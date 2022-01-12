import { toBuffer } from "it-buffer";
import lp from "it-length-prefixed";
import { pipe } from "it-pipe";
import Libp2p from "libp2p";
import PeerId from "peer-id";
import { collect, consume, take } from "streaming-iterables";

import { DidKey } from "../didkey";
import { buildId } from "../rdfutils";

/*
 * Protocols:
 * https://www.w3.org/TR/activitypub
 */

export type Activity = Object;
export type OnActivity = (x: Activity) => void | Promise<void>;

export class ActivityPub {
  static readonly protocol = "/chitchat/activitypub/0.1.0";
  static readonly verbs = {
    get: "GET",
    post: "POST",
  };

  libp2p: Libp2p;
  onActivity: OnActivity;

  constructor(libp2p: Libp2p, onActivity: OnActivity) {
    this.libp2p = libp2p;
    this.onActivity = onActivity;
  }

  setHandler() {
    this.libp2p.handle(ActivityPub.protocol, async ({ stream }) => {
      const [result] = await pipe(
        [],
        stream,
        lp.decode(),
        take(1),
        toBuffer,
        collect
      );
      const { route, verb, data } = JSON.parse(
        new TextDecoder().decode(result)
      );
      this.handleRoutes(route, verb, data);
    });
  }

  unsetHandler() {
    this.libp2p.unhandle(ActivityPub.protocol);
  }

  handleRoutes(route: string, verb: string, data: object) {
    if (data["@context"] != "https://www.w3.org/ns/activitystream") {
      throw Error("data must have the activitystreams context");
    }

    switch (route) {
      case "inbox":
        this.handleInbox(verb, data);
        break;
      case "outbox":
        break;
      case "following":
        break;
      case "followers":
        break;
      default:
        throw Error(`unhandled route: ${route}`);
    }
  }

  handleInbox(verb: string, data: object) {
    switch (verb) {
      case ActivityPub.verbs.get:
        break;
      case ActivityPub.verbs.post:
        this.onActivity(data);
        break;
      default:
        throw Error(`unhanded verb: ${verb}`);
    }
  }

  async send(peer: PeerId, route: string, verb: string, data: object) {
    const connection = await this.libp2p.dial(peer);
    const { stream } = await connection.newStream(ActivityPub.protocol);
    const message = new TextEncoder().encode(
      JSON.stringify({ route: route, verb: verb, data: data })
    );
    await pipe([message], lp.encode(), stream, consume);
  }

  async sendFollow(did: DidKey) {
    if (!did) return;
    const actorDid = DidKey.fromPeerId(this.libp2p.peerId);
    const data = {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Follow",
      actor: actorDid.did,
      object: did.did,
    };
    const peerId = await did.buildPeerId();
    this.send(peerId, "inbox", ActivityPub.verbs.post, data);
  }

  static async createNote(message: string, actor: PeerId, date?: string) {
    date = date ? date : new Date().toISOString();
    const did = DidKey.fromPeerId(actor);
    const interest = did.did;
    // wrap in activity
    const note = {
      "https://www.w3.org/ns/activitystreams#attributedTo": [
        {
          "@id": did.did,
        },
      ],
      "https://www.w3.org/ns/activitystreams#content": [
        {
          "@value": message,
        },
      ],
      "https://www.w3.org/ns/activitystreams#to": [
        {
          "@id": `${did.did}/following`,
        },
      ],
      "@type": ["https://www.w3.org/ns/activitystreams#Note"],
    };
    note["@id"] = await buildId(note);

    const activity = {
      "https://www.w3.org/ns/activitystreams#actor": [
        {
          "@id": did.did,
        },
      ],
      "https://www.w3.org/ns/activitystreams#object": [note],
      "https://www.w3.org/ns/activitystreams#startTime": [
        {
          "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
          "@value": date,
        },
      ],
      "@type": ["https://www.w3.org/ns/activitystreams#Create"],
    };
    activity["@id"] = await buildId(activity);

    return activity;
  }
}

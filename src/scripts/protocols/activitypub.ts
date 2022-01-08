import { pipe } from "it-pipe";
import { toBuffer } from "it-buffer";
import { collect, consume, take } from "streaming-iterables";
import lp from "it-length-prefixed";

import Libp2p from "libp2p";
import PeerId from "peer-id";
import { DidKey } from "../didutils";
import { noRemoteContext } from "../utils";

/*
 * Protocols:
 * https://www.w3.org/TR/activitypub
 */

export class ActivityPub {
  static readonly protocol = "/chitchat/activitypub/0.1.0";
  static readonly verbs = {
    get: "GET",
    post: "POST",
  };

  // TODO: handles return ret code? send back?

  libp2p: Libp2p;
  handleActivity: (data: object) => void;

  constructor(libp2p: Libp2p, handleActivity: (data: object) => void) {
    this.libp2p = libp2p;
    this.handleActivity = handleActivity;
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
      throw "data must have the activitystreams context";
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
        throw `unhandled route: ${route}`;
    }
  }

  handleInbox(verb: string, data: object) {
    switch (verb) {
      case ActivityPub.verbs.get:
        break;
      case ActivityPub.verbs.post:
        this.handleActivity(data);
        break;
      default:
        throw `unhanded verb: ${verb}`;
    }
  }

  async send(peer: PeerId, route: string, verb: string, data: object) {
    console.log("sending", peer, data);
    const connection = await this.libp2p.dial(peer);
    const { stream } = await connection.newStream(ActivityPub.protocol);
    const message = new TextEncoder().encode(
      JSON.stringify({ route: route, verb: verb, data: data })
    );
    await pipe([message], lp.encode(), stream, consume);
  }

  async sendFollow(did: DidKey) {
    console.log("sending follow to", did);
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
}

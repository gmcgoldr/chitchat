import { pipe } from "it-pipe";
import { toBuffer } from "it-buffer";
import { collect, consume, take } from "streaming-iterables";
import lp from "it-length-prefixed";

import Libp2p from "libp2p";
import PeerId from "peer-id";
import { didToPeerId, peerIdToDidKey } from "../didutils";

/*
 * Protocols:
 * https://www.w3.org/TR/activitypub
 */

class ActivityPub {
  static readonly protocol = "/chitchat/activitypub/0.1.0";
  static readonly verbs = {
    get: "GET",
    post: "POST",
  };

  // TODO: handles return ret code? send back?

  libp2p: Libp2p;
  handleFollow: (data: object) => void;

  constructor(libp2p: Libp2p, handeFollow: (data: object) => void) {
    this.libp2p = libp2p;
    this.handleFollow = handeFollow;

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

  handleRoutes(route: string, verb: string, data: object) {
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

  handleActivity(data: object) {
    const activity = data["type"];
    switch (activity) {
      case "Follow":
        this.handleFollow(data);
        break;
      default:
        throw `unhanded activity: ${activity}`;
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

  async sendFollow(did: string) {
    const didKey = peerIdToDidKey(this.libp2p.peerId);
    const actorDid = `did:key:${didKey}`;
    const data = {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Follow",
      actor: actorDid,
      object: did,
    };
    const peerId = await didToPeerId(did);
    this.send(peerId, "inbox", ActivityPub.verbs.post, data);
  }
}

import { NOISE } from "@chainsafe/libp2p-noise";
import Libp2p from "libp2p";
import Crypto from "libp2p-crypto";
import Gossipsub from "libp2p-gossipsub";
import KadDHT from "libp2p-kad-dht";
import Mplex from "libp2p-mplex";
import WebRTCStar from "libp2p-webrtc-star";
import Websockets from "libp2p-websockets";
import PeerId from "peer-id";

import { ActivityPub, OnActivity } from "./protocols/activitypub";

export async function buildPeerId(): Promise<PeerId> {
  const privateKey = await Crypto.keys.generateKeyPair("Ed25519", 256);
  return PeerId.createFromPrivKey(privateKey.bytes);
}

export async function buildNode(peerId: PeerId, onActivity: OnActivity) {
  // libp2p signal servers:
  // /dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star
  // /dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star

  // NOTE: peer discovery is handled by the webrtc-star protocol, so no need
  // to setup the bootstrap and rendezvous

  const node = await Libp2p.create({
    peerId: peerId,
    addresses: {
      listen: [
        "/dns4/chitchat-relay.herokuapp.com/tcp/443/wss/p2p-webrtc-star/",
      ],
    },
    modules: {
      // @ts-ignore
      transport: [Websockets, WebRTCStar],
      // @ts-ignore
      connEncryption: [NOISE],
      // @ts-ignore
      streamMuxer: [Mplex],
      dht: KadDHT,
      pubsub: Gossipsub,
    },
    config: {
      peerDiscovery: {
        enabled: true,
        autodial: true,
        webRTCStar: {
          enabled: true,
        },
      },
      dht: {
        enabled: true,
      },
    },
  });

  const protoActivityPub = new ActivityPub(node, onActivity);
  protoActivityPub.setHandler();

  await node.start();
  return node;
}

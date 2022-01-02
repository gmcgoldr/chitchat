import Libp2p from "libp2p";
import Websockets from "libp2p-websockets";
import WebRTCStar from "libp2p-webrtc-star";
import { NOISE } from "@chainsafe/libp2p-noise";
import Mplex from "libp2p-mplex";
import Crypto from "libp2p-crypto";
import PeerId from "peer-id";

export async function buildPeerId() {
  const privateKey = await Crypto.keys.generateKeyPair("Ed25519", 256);
  return await PeerId.createFromPrivKey(privateKey.bytes);
}

export async function buildNode(peerId) {
  // libp2p signal servers:
  // /dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star
  // /dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star

  const node = await Libp2p.create({
    peerId: peerId,
    addresses: {
      // will automatically append peerId
      listen: [
        "/dns4/chitchat-relay.herokuapp.com/tcp/443/wss/p2p-webrtc-star/",
      ],
    },
    modules: {
      transport: [Websockets, WebRTCStar],
      connEncryption: [NOISE],
      streamMuxer: [Mplex],
      // handled in the WebRTCStar transport
      peerDiscovery: [],
    },
    config: {
      peerDiscovery: {
        autoDial: false,
        webRTCStar: {
          enabled: true,
        },
      },
    },
  });

  await node.start();

  return node;
}

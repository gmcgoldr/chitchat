import { pipe } from "it-pipe";
import { toBuffer } from "it-buffer";
import { collect, consume, take } from "streaming-iterables";
import lp from "it-length-prefixed";

import Libp2p from "libp2p";
import Websockets from "libp2p-websockets";
import WebRTCStar from "libp2p-webrtc-star";
import { NOISE } from "@chainsafe/libp2p-noise";
import Mplex from "libp2p-mplex";
import Crypto from "libp2p-crypto";
import PeerId from "peer-id";

localStorage.debug = ""; // change to libp2p:* for all libp2p debug

document.addEventListener("DOMContentLoaded", async () => {
  const privateKey = await Crypto.keys.generateKeyPair("Ed25519", 256);
  const peerId = await PeerId.createFromPrivKey(privateKey.bytes);

  const libp2p = await Libp2p.create({
    peerId: peerId,
    addresses: {
      // will automatically append peerId
      listen: [
        // "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
        // "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
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

  libp2p.handle(
    "/chitchat/activitypub/inbox/0.1.0/push",
    async ({ stream }) => {
      let data;
      const [result] = await pipe(
        [],
        stream,
        lp.decode(),
        take(1),
        toBuffer,
        collect
      );
      console.log(result);
      data = new TextDecoder().decode(result);
      document.getElementById("p2p_message_get").innerText = data;
    }
  );

  await libp2p.start();


  // let address = `/dns4/wrtc-star2.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/p2p/${libp2p.peerId.toB58String()}`;
  let address = `/dns4/chitchat-relay.herokuapp.com/tcp/443/wss/p2p-webrtc-star/p2p/${libp2p.peerId.toB58String()}`;
  document.getElementById("p2p_self_address").innerText = address;

  document
    .getElementById("p2p_dial_button")
    .addEventListener("click", async () => {
      const peer = document.getElementById("p2p_dial_address").value;

      let ping;
      try {
        ping = await libp2p.ping(peer);
      } catch (err) {
        ping = err.message;
      }
      document.getElementById("p2p_ping").innerText = `Ping: ${ping}`;
    });

  document
    .getElementById("p2p_send_button")
    .addEventListener("click", async () => {
      const peer = document.getElementById("p2p_dial_address").value;

      const protocol = "/chitchat/activitypub/inbox/0.1.0/push";
      const connection = await libp2p.dial(peer);
      const { stream } = await connection.newStream(protocol);

      let data = new TextEncoder().encode(
        document.getElementById("p2p_message_push").value
      );

      console.log(data);
      try {
        await pipe([data], lp.encode(), stream, consume);
      } catch (err) {
        console.log(err);
      }
    });
});

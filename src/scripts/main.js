import { pipe } from "it-pipe";
import { toBuffer } from "it-buffer";
const { collect, take } = require("streaming-iterables");

import Libp2p from "libp2p";
import Websockets from "libp2p-websockets";
import WebRTCStar from "libp2p-webrtc-star";
import { NOISE } from "@chainsafe/libp2p-noise";
import Mplex from "libp2p-mplex";
import Crypto from "libp2p-crypto";

document.addEventListener("DOMContentLoaded", async () => {
  const libp2p = await Libp2p.create({
    addresses: {
      // will automatically append peerId
      listen: [
        "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
        "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
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

  await libp2p.start();

  let address = `/dns4/wrtc-star2.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/p2p/${libp2p.peerId.toB58String()}`;
  document.getElementById("p2p_self_address").innerText = address;

  // TODO:
  // - filter connections to known peers
  // - lookup peer in peer book

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

      const protocol = "/ipfs/ping/1.0.0";
      const connection = await libp2p.dial(peer);
      const { stream } = await connection.newStream(protocol);

      const data = Crypto.randomBytes(32);

      let data_back;
      try {
        const [result] = await pipe(
          [data],
          stream,
          (stream) => take(1, stream),
          toBuffer,
          collect
        );
        data_back = new Uint8Array(result);
      } catch (err) {
        data_back = err.message;
      }

      document.getElementById(
        "p2p_ping"
      ).innerText += `\nData:\n${data}\n${data_back}`;
    });
});

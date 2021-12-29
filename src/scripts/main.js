import Libp2p from "libp2p";
import Websockets from "libp2p-websockets";
import WebRTCStar from "libp2p-webrtc-star";
import { NOISE } from "@chainsafe/libp2p-noise";
import Mplex from "libp2p-mplex";

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

  document
    .getElementById("p2p_dial_button")
    .addEventListener("click", async () => {
      const dial_address = document.getElementById("p2p_dial_address").value;
      let ping;
      try {
        ping = await libp2p.ping(dial_address);
      } catch (err) {
        ping = err.message;
      }
      document.getElementById("p2p_ping").innerText = `Ping: ${ping}`;
    });
});

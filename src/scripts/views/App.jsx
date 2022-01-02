import { buildNode, buildPeerId } from "../p2p";

import React, { useState, useEffect } from "react";
import EventEmitter from "events";
import { Header } from "./Header";
import { CreateAccount } from "./CreateAccount";
import { FollowInvite } from "./FollowInvite";

export function App() {
  const storage = window.sessionStorage;
  const [peerId, setPeerId] = useState(storage.getItem("peerId"));
  const [libp2p, setLibp2p] = useState(null);
  const eventBus = new EventEmitter();

  useEffect(
    async () => {
      if (peerId === null) {
        console.log(peerId);
        console.log(buildPeerId());
        setPeerId(await buildPeerId());
        storage.setItem("peerId", peerId);
        console.log(peerId);
      }
      if (libp2p === null) {
        setLibp2p(await buildNode(peerId));
      }
    },
    // run once only
    []
  );

  return (
    <div>
      <Header />
      <CreateAccount eventBus={eventBus} storage={storage} />
    </div>
  );
}

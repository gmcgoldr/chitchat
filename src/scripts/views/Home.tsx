import React, { useState, useEffect } from "react";
import { Header } from "./common/Header";
import { CreateAccount } from "./common/CreateAccount";

import { buildNode, buildPeerId } from "../p2p";
import { Storage } from "../storage";

export function Home() {
  const [store, setStore] = useState(new Storage());

  const [libp2p, setLibp2p] = useState(undefined);
  const [peerId, setPeerId] = useState(undefined);
  const [name, setName] = useState("");

  useEffect(async () => {
    await store.init();
    setPeerId(await store.getPeerId());
    setName(await store.getName());
  }, []);

  useEffect(async () => {
    if (peerId) setLibp2p(await buildNode(peerId));
  }, [peerId]);

  async function createAccount() {
    const peerId = await buildPeerId();
    setPeerId(peerId);
    await store.addPeerId(peerId);
    await store.setPeerId(peerId);
    await store.setName(name);
  }

  return (
    <div>
      <Header name={name} hasAccount={!!peerId} />
      {peerId ? null : (
        <CreateAccount
          name={name}
          setName={setName}
          createAccount={createAccount}
        />
      )}
    </div>
  );
}

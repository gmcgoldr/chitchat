import React, { useState, useEffect } from "react";
import { Header } from "./common/Header";
import { CreateAccount } from "./common/CreateAccount";

import { buildNode, buildPeerId } from "../p2p";
import { Storage } from "../storage";
import Libp2p from "libp2p";
import PeerId from "peer-id";

export function Home() {
  const [store, setStore]: [Storage, any] = useState(new Storage());
  const [libp2p, setLibp2p]: [Libp2p, any] = useState(undefined);
  const [peerId, setPeerId]: [PeerId, any] = useState(undefined);
  const [displayName, setDisplayName]: [string, any] = useState("");

  useEffect(async () => {
    await store.init();
    setPeerId(await store.getStatePeerId());
  }, []);

  useEffect(async () => {
    if (peerId) setLibp2p(await buildNode(peerId));
  }, [peerId]);

  async function createAccount() {
    const peerId = await buildPeerId();
    setPeerId(peerId);
    await store.addOwnedPeerId(peerId);
    await store.setStatePeerId(peerId);
    // TODO: display name
  }

  async function logOut() {
    setPeerId(undefined);
    await store.setStatePeerId(undefined);
  }

  async function selectAccount(key: string) {
    const peerId = await store.getOwnedPeerId(key);
    setPeerId(peerId);
    await store.setStatePeerId(peerId);
    // TODO: display name
  }

  return (
    <div>
      <Header
        name={displayName}
        loggedIn={!!peerId}
        logout={logOut}
        selectAccount={selectAccount}
        store={store}
      />
      {peerId ? null : (
        <CreateAccount
          name={displayName}
          setName={setDisplayName}
          createAccount={createAccount}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Header } from "./common/Header";
import { CreateAccount } from "./common/CreateAccount";

import { buildNode, buildPeerId } from "../p2p";
import { Storage } from "../storage";
import Libp2p from "libp2p";
import PeerId from "peer-id";
import { buildVerifiableCredential } from "../credentialutils";

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
    const displayNameCred = await buildVerifiableCredential(
      peerId,
      "https://schema.org/alternateName",
      [{ "@value": displayName }]
    );
    store.addCredential(displayNameCred);
  }

  async function logOut() {
    setPeerId(undefined);
    await store.setStatePeerId(undefined);
  }

  async function selectAccount(key: string) {
    const peerId = await store.getOwnedPeerId(key);
    setPeerId(peerId);
    await store.setStatePeerId(peerId);
    const info = await store.getPeerIdInfo(peerId.toB58String());
    setDisplayName(info.displayName ? info.displayName : "");
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
          displayName={displayName}
          setDisplayName={setDisplayName}
          createAccount={createAccount}
        />
      )}
    </div>
  );
}

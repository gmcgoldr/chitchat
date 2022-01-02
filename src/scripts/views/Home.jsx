import PeerId from "peer-id";
import { toString } from "uint8arrays/to-string";

import React, { useState, useEffect } from "react";
import { Header } from "./common/Header";
import { CreateAccount } from "./common/CreateAccount";

import { buildNode, buildPeerId } from "../p2p";

export function Home() {
  const storage = window.sessionStorage;

  const [peerIdStr, setPeerIdStr] = useState(storage.getItem("peerId"));
  const [libp2p, setLibp2p] = useState(null);
  const [name, setName] = useState(() => {
    const name = storage.getItem("name");
    if (name === null) return "";
    else return name;
  });

  useEffect(async () => {
    if (peerIdStr !== null) window.sessionStorage.setItem("peerId", peerIdStr);
    if (libp2p === null && peerIdStr !== null) {
      const peerId = await PeerId.createFromProtobuf(peerIdStr);
      setLibp2p(await buildNode(peerId));
    }
  }, [peerIdStr]);

  useEffect(() => {
    window.sessionStorage.setItem("name", name);
  }, [name]);

  async function createAccount() {
    const peerId = await buildPeerId();
    const peerIdStr = toString(peerId.marshal(), "base16");
    setPeerIdStr(peerIdStr);
  }

  return (
    <div>
      <Header name={name} isAccount={peerIdStr !== null} />
      {peerIdStr === null ? (
        <CreateAccount
          name={name}
          setName={setName}
          createAccount={createAccount}
        />
      ) : null}
    </div>
  );
}

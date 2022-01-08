import React, { useState, useEffect } from "react";
import { Header } from "./common/Header";
import { CreateAccount } from "./common/CreateAccount";

import { buildNode, buildPeerId } from "../p2p";
import { Storage } from "../storage";
import Libp2p from "libp2p";
import PeerId from "peer-id";
import { buildVerifiableCredential } from "../credentialutils";

import { ActivityPub } from "../protocols/activitypub";
import { DidKey } from "../didutils";

export function Home({ addFollow }) {
  const [store, setStore]: [Storage, any] = useState(new Storage());
  const [libp2p, setLibp2p]: [Libp2p, any] = useState(undefined);
  const [protoActivityPub, setProtoActivityPub]: [ActivityPub, any] =
    useState(undefined);
  const [peerId, setPeerId]: [PeerId, any] = useState(undefined);
  const [displayName, setDisplayName]: [string, any] = useState("");
  const [addedFollow, setAddedFollow]: [string, any] = useState(undefined);

  // TODO: cache activities

  function handleFollow(follow: object) {
    if (!peerId) return;
    const did = DidKey.fromPeerId(peerId);
    if (follow["object"] != did.did) return;
    store.addFollower(follow["actor"]);
  }

  function handleActivity(activity: object) {
    switch (activity["type"]) {
      case "Follow": {
        handleFollow(activity);
        break;
      }
      default:
        throw `unhandled activity type: ${activity["type"]}`;
    }
  }

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
  }

  useEffect(async () => {
    await store.init();
    setPeerId(await store.getStatePeerId());
  }, []);

  useEffect(async () => {
    if (peerId) {
      const libp2p = await buildNode(peerId);
      const protoActivityPub = new ActivityPub(libp2p, handleActivity);
      protoActivityPub.setHandler();
      await store.setStatePeerId(peerId);
      const info = await store.getPeerIdInfo(peerId.toB58String());
      setDisplayName(info.displayName ? info.displayName : "");
      setLibp2p(libp2p);
      setProtoActivityPub(protoActivityPub);
    }
  }, [peerId]);

  useEffect(() => {
    if (protoActivityPub && peerId && addedFollow != addFollow) {
      const followDid = DidKey.fromDid(addFollow);
      protoActivityPub.sendFollow(followDid);
      store.addFollowing(followDid);
      setAddedFollow(addFollow);
    }
  }, [addFollow, protoActivityPub, peerId]);

  return (
    <div>
      <Header
        name={displayName}
        loggedIn={!!peerId}
        logout={logOut}
        selectAccount={selectAccount}
        store={store}
        did={peerId ? DidKey.fromPeerId(peerId) : undefined}
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

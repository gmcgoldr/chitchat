import Libp2p from "libp2p";
import { InMessage } from "libp2p-interfaces/src/pubsub";
import { includes, map } from "lodash";
import { get } from "lodash";
import PeerId from "peer-id";
import { useEffect, useState } from "react";

import { DidKey } from "../didkey";
import { buildNode, buildPeerId } from "../p2p";
import { Activity, ActivityPub, OnActivity } from "../protocols/activitypub";
import { buildVerifiableCredential } from "../rdfutils";
import { Storage } from "../storage";
import { Activities } from "./common/Activities";
import { AddFollow } from "./common/AddFollow";
import { CreateAccount } from "./common/CreateAccount";
import { CreatePost } from "./common/CreatePost";
import { Header } from "./common/Header";

/**
 * Create a new account.
 *
 * @param store
 * @param displayName - the display name for the account
 * @param setPeerId - function to set the current `PeerID`
 */
async function createAccount(
  displayName: string,
  store: Storage,
  setPeerId: any
) {
  if (!displayName) return;
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

/**
 * Log out of the currently active account.
 *
 * @param store
 * @param setPeerId - function to set the current `PeerID`
 */
async function logOut(store: Storage, setPeerId: any) {
  setPeerId(undefined);
  await store.setStatePeerId(undefined);
}

/**
 * Log into an account with given `PeerId`.
 *
 * @param store
 * @param setPeerId - function to set the current `PeerID`
 */
async function selectAccount(key: string, store: Storage, setPeerId: any) {
  const peerId = await store.getOwnedPeerId(key);
  setPeerId(peerId);
}

/**
 * Add an `Activity` to the UI.
 *
 * @param activity - the activity to handle
 */
function addActivityUi(
  activity: Activity,
  activities: Activity[],
  setActivities: any
) {
  if (
    includes(
      map(activities, (a) => a["@id"]),
      activity["@id"]
    )
  )
    return;
  setActivities((prev) => [...prev, activity]);
}

/**
 * Add an `Activity` to the storage.
 *
 * @param activity - the activity to handle
 */
function addActivityStorage(activity: Activity) {}

/**
 * Post a message to the network.
 *
 * @param message - the message to post
 */
async function postMessage(message: string, libp2p: Libp2p, peerId: PeerId) {
  const activity = await ActivityPub.createNote(message, peerId);
  const interest = get(activity, [
    "https://www.w3.org/ns/activitystreams#actor",
    0,
    "@id",
  ]);
  if (!interest) return;
  await libp2p.pubsub.publish(
    interest,
    new TextEncoder().encode(JSON.stringify(activity))
  );
}

/**
 * Add a DID to the following list.
 *
 * @param did - the DID to follow
 * @param store
 * @param libp2p
 * @param peerId - the peerId following the DID
 * @param onActivity - send DID pubsub messages to this callback
 */
async function followDid(
  did: string,
  store: Storage,
  libp2p: Libp2p,
  peerId: PeerId,
  onActivity: OnActivity
) {
  libp2p.pubsub.subscribe(did);
  // @ts-ignore
  if (!includes(libp2p.pubsub.eventNames(), did)) {
    libp2p.pubsub.on(did, (message: InMessage) =>
      // TODO: move to deserialiation, verify id, if from sender dont verify sig
      onActivity(JSON.parse(new TextDecoder().decode(message.data)))
    );
  }
  store.addFollowing({ actor: DidKey.fromPeerId(peerId).did, object: did });
}

export interface LoggedInProps {
  location: URL;
  activities: Activity[];
  postMessage: (x: string) => void;
  followDid: (x: string) => void;
}

function LoggedIn({
  location,
  activities,
  followDid,
  postMessage,
}: LoggedInProps) {
  return (
    <section>
      <AddFollow location={location} follow={(did: string) => followDid(did)} />
      <CreatePost post={(message: string) => postMessage(message)} />
      <Activities activities={activities} />
    </section>
  );
}

export interface LoggedOutProps {
  displayName: string;
  setDisplayName: (x: string) => void;
  createAccount: () => void;
}

function LoggedOut({
  displayName,
  setDisplayName,
  createAccount,
}: LoggedOutProps) {
  return (
    <CreateAccount
      displayName={displayName}
      setDisplayName={setDisplayName}
      createAccount={createAccount}
    />
  );
}

export interface HomeProps {
  location: URL;
}

export function Home({ location }: HomeProps) {
  const [store, setStore]: [Storage, any] = useState(null);
  const [libp2p, setLibp2p]: [Libp2p, any] = useState(null);
  const [peerId, setPeerId]: [PeerId, any] = useState(null);
  const [displayName, setDisplayName]: [string, any] = useState("");
  const [activities, setActivities]: [Activity[], any] = useState([]);

  const onActivity = (activity: Activity) => {
    addActivityStorage(activity);
    addActivityUi(activity, activities, setActivities);
  };

  // build the store only once
  useEffect(() => {
    const newStore = new Storage();
    (async () => await newStore.init())();
    setStore(newStore);
  }, []);

  // build the libp2p instance when peerId changes
  useEffect(() => {
    if (!peerId) return;
    (async () => {
      const newLibp2p = await buildNode(peerId, onActivity);
      setLibp2p(newLibp2p);
    })();
  }, [peerId]);

  // update info when peerId changes (and store and libp2p are ready)
  useEffect(() => {
    if (!store || !peerId || !libp2p) return;
    const did = DidKey.fromPeerId(peerId);
    (async () => {
      await store.setStatePeerId(peerId);
      for (const following of await store.getFollowing(did.did)) {
        await followDid(following["object"], store, libp2p, peerId, onActivity);
      }
      const info = await store.getPeerIdInfo(peerId.toB58String());
      setDisplayName(info && info.displayName ? info.displayName : "");
    })();
  }, [store, peerId, libp2p]);

  return (
    <div>
      <Header
        displayName={displayName}
        peerId={peerId}
        did={peerId ? DidKey.fromPeerId(peerId) : null}
        store={store}
        loggedIn={!!store && !!peerId && !!libp2p}
        logout={() => logOut(store, setPeerId)}
        selectAccount={(key: string) => selectAccount(key, store, setPeerId)}
      />
      {peerId ? (
        <LoggedIn
          location={location}
          activities={activities}
          followDid={(did: string) =>
            followDid(did, store, libp2p, peerId, onActivity)
          }
          postMessage={(message: string) =>
            postMessage(message, libp2p, peerId)
          }
        />
      ) : (
        <LoggedOut
          displayName={displayName}
          setDisplayName={setDisplayName}
          createAccount={() => createAccount(displayName, store, setPeerId)}
        />
      )}
    </div>
  );
}

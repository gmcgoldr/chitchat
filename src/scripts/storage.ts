import { IDBPDatabase, openDB } from "idb";
import PeerId from "peer-id";
import { DidKey } from "./didutils";

const stores = {
  ownedPeerIds: "ownedPeerIds",
  credentials: "credentials",
  state: "state",
  peerIdCredentialInfo: "peerIdCredentialInfo",
  followers: "followers",
  following: "following",
  activities: "activities",
};

export class Storage {
  db: IDBPDatabase;

  async init() {
    this.db = await openDB("chitChat", 2, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains(stores.ownedPeerIds)) {
          db.createObjectStore(stores.ownedPeerIds);
        }

        if (!db.objectStoreNames.contains(stores.state)) {
          db.createObjectStore(stores.state);
        }

        if (!db.objectStoreNames.contains(stores.credentials)) {
          const store = db.createObjectStore(stores.credentials, {
            keyPath: "id",
          });
          store.createIndex("subject", "subjectId");
          store.createIndex("issuer", "issuerId");
        }

        if (!db.objectStoreNames.contains(stores.peerIdCredentialInfo)) {
          db.createObjectStore(stores.peerIdCredentialInfo, {
            keyPath: "peerId",
          });
        }

        if (!db.objectStoreNames.contains(stores.followers)) {
          db.createObjectStore(stores.followers, {
            keyPath: "actor",
          });
        }

        if (!db.objectStoreNames.contains(stores.following)) {
          db.createObjectStore(stores.following, {
            keyPath: "object",
          });
        }

        if (!db.objectStoreNames.contains(stores.activities)) {
          db.createObjectStore(stores.activities, {
            keyPath: "id",
          });
        }
      },
    });
  }

  async getStatePeerId() {
    if (this.db === undefined) return undefined;
    const peerId = await this.db.get(stores.state, "peerId");
    if (!peerId) return undefined;
    return PeerId.createFromProtobuf(peerId);
  }

  async setStatePeerId(peerId: PeerId) {
    await this.db.put(
      stores.state,
      peerId ? peerId.marshal() : undefined,
      "peerId"
    );
  }

  async addOwnedPeerId(peerId: PeerId) {
    await this.db.add(
      stores.ownedPeerIds,
      peerId ? peerId.marshal() : undefined,
      peerId.toB58String()
    );
  }

  async getOwnedPeerId(key: string) {
    if (this.db === undefined) return undefined;
    const peerId = await this.db.get(stores.ownedPeerIds, key);
    return PeerId.createFromProtobuf(peerId);
  }

  async getOwnedPeerIdKeys() {
    if (this.db === undefined) return undefined;
    return this.db.getAllKeys(stores.ownedPeerIds);
  }

  // TODO: validate credentials before storing?
  // TODO: drop credential rebuilds peer id info

  async addCredential(credential: object) {
    const subject =
      credential["https://www.w3.org/2018/credentials#credentialSubject"][0];
    const issuer = credential["https://www.w3.org/2018/credentials#issuer"][0];
    const subjectId = subject["@id"];
    const issuderId = issuer["@id"];

    await this.db.add(stores.credentials, {
      id: credential["@id"],
      issuerId: issuderId,
      subjectId: subjectId,
      data: credential,
    });

    const peerId = (
      await DidKey.fromDid(subjectId).buildPeerId()
    ).toB58String();
    let info = await this.db.get(stores.peerIdCredentialInfo, peerId);
    if (!info) info = { peerId: peerId };

    if ("https://schema.org/alternateName" in subject) {
      info.displayName =
        subject["https://schema.org/alternateName"][0]["@value"];
    }

    this.db.put(stores.peerIdCredentialInfo, info);
  }

  async getPeerIdInfo(peerIdKey: string) {
    return this.db.get(stores.peerIdCredentialInfo, peerIdKey);
  }

  async addFollower(did: DidKey) {
    console.log("add follower to storage");
    this.db.put(stores.followers, {
      actor: did.did,
    });
  }

  async addFollowing(did: DidKey) {
    console.log("add following to storage");
    this.db.put(stores.following, {
      object: did.did,
    });
  }
}

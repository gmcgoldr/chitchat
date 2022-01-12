import { IDBPDatabase, openDB } from "idb";
import { get, map } from "lodash";
import PeerId from "peer-id";

import { DidKey } from "./didkey";

const stores = {
  ownedPeerIds: "ownedPeerIds",
  credentials: "credentials",
  state: "state",
  peerIdCredentialInfo: "peerIdCredentialInfo",
  following: "following",
  activities: "activities",
};

export interface PeerIdInfo {
  peerId: string;
  displayName: string;
}

export interface Following {
  actor: string;
  object: string;
}

export class Storage {
  db: IDBPDatabase;

  async init() {
    this.db = await openDB("chitChat", 2, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains(stores.ownedPeerIds))
          db.createObjectStore(stores.ownedPeerIds);

        if (!db.objectStoreNames.contains(stores.state))
          db.createObjectStore(stores.state);

        if (!db.objectStoreNames.contains(stores.peerIdCredentialInfo))
          db.createObjectStore(stores.peerIdCredentialInfo, {
            keyPath: "peerId",
          });

        if (!db.objectStoreNames.contains(stores.activities))
          db.createObjectStore(stores.activities, {
            keyPath: "id",
          });

        if (!db.objectStoreNames.contains(stores.credentials)) {
          const store = db.createObjectStore(stores.credentials, {
            keyPath: "id",
          });
          store.createIndex("subject", "subjectId");
          store.createIndex("issuer", "issuerId");
        }

        if (!db.objectStoreNames.contains(stores.following)) {
          const store = db.createObjectStore(stores.following, {
            keyPath: ["actor", "object"],
          });
          store.createIndex("actor", "actor");
          store.createIndex("object", "object");
        }
      },
    });
  }

  async getStatePeerId(): Promise<PeerId> {
    if (this.db === undefined) return null;
    const peerId = await this.db.get(stores.state, "peerId");
    if (!peerId) return null;
    return PeerId.createFromProtobuf(peerId);
  }

  async setStatePeerId(peerId: PeerId): Promise<void> {
    await this.db.put(stores.state, peerId ? peerId.marshal() : null, "peerId");
  }

  async addOwnedPeerId(peerId: PeerId): Promise<void> {
    await this.db.add(
      stores.ownedPeerIds,
      peerId ? peerId.marshal() : null,
      peerId.toB58String()
    );
  }

  async getOwnedPeerId(key: string): Promise<PeerId> {
    if (this.db === undefined) return null;
    const peerId = await this.db.get(stores.ownedPeerIds, key);
    return PeerId.createFromProtobuf(peerId);
  }

  async getOwnedPeerIdKeys(): Promise<string[]> {
    if (this.db === undefined) return null;
    return map(await this.db.getAllKeys(stores.ownedPeerIds), (k) =>
      k.toString()
    );
  }

  // TODO: validate credentials before storing?
  // TODO: drop credential rebuilds peer id info

  async addCredential(credential: object): Promise<void> {
    const subject = get(credential, [
      "https://www.w3.org/2018/credentials#credentialSubject",
      0,
    ]);
    const issuer = get(credential, [
      "https://www.w3.org/2018/credentials#issuer",
      0,
    ]);
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
    let info: PeerIdInfo = await this.db.get(
      stores.peerIdCredentialInfo,
      peerId
    );
    if (!info) info = { peerId: peerId, displayName: null };

    info.displayName = get(subject, [
      "https://schema.org/alternateName",
      0,
      "@value",
    ]);

    this.db.put(stores.peerIdCredentialInfo, info);
  }

  async getPeerIdInfo(peerIdKey: string): Promise<PeerIdInfo> {
    return this.db.get(stores.peerIdCredentialInfo, peerIdKey);
  }

  async addFollowing(following: Following): Promise<void> {
    this.db.put(stores.following, following);
  }

  async getFollowing(actor: string): Promise<Following[]> {
    return this.db.getAllFromIndex(stores.following, "actor", actor);
  }
}

import { IDBPDatabase, openDB } from "idb";
import PeerId from "peer-id";
import { didToPeerId } from "./didutils";

const stores = {
  ownedPeerIds: "ownedPeerIds",
  credentials: "credentials",
  state: "state",
  peerIdCredentialInfo: "peerIdCredentialInfo",
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

    const peerId = (await didToPeerId(subjectId)).toB58String();
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

  // TODO: drop credential rebuilds peer id info
}

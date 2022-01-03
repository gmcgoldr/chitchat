import { IDBPDatabase, openDB } from "idb";
import PeerId from "peer-id";

const stores = {
  ownedPeerIds: "ownedPeerIds",
  credentials: "credentials",
  state: "state",
};

export class Storage {
  db: IDBPDatabase;

  async init(): Promise<void> {
    this.db = await openDB("chitChat", 2, {
      upgrade: (db) => {
        for (const store in stores) {
          if (!db.objectStoreNames.contains(store)) db.createObjectStore(store);
        }
      },
    });
  }

  async getStatePeerId(): Promise<PeerId> {
    if (this.db === undefined) return undefined;
    const peerId = await this.db.get(stores.state, "peerId");
    if (!peerId) return undefined;
    return PeerId.createFromProtobuf(peerId);
  }

  async setStatePeerId(peerId: PeerId): Promise<void> {
    await this.db.put(
      stores.state,
      peerId ? peerId.marshal() : undefined,
      "peerId"
    );
  }

  async addOwnedPeerId(peerId: PeerId): Promise<void> {
    await this.db.add(
      stores.ownedPeerIds,
      peerId ? peerId.marshal() : undefined,
      peerId.toB58String()
    );
  }

  async getOwnedPeerId(key: string): Promise<PeerId> {
    if (this.db === undefined) return undefined;
    const peerId = await this.db.get(stores.ownedPeerIds, key);
    return PeerId.createFromProtobuf(peerId);
  }

  async getOwnedPeerIdKeys() {
    if (this.db === undefined) return undefined;
    return this.db.getAllKeys(stores.ownedPeerIds);
  }
}

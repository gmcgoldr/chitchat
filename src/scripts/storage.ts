import { IDBPDatabase, openDB } from "idb";
import PeerId from "peer-id";

export class Storage {
  db: IDBPDatabase;

  async init(): Promise<void> {
    this.db = await openDB("chitChat", 2, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains("peerIds")) {
          const store = db.createObjectStore("peerIds");
        }

        if (!db.objectStoreNames.contains("state")) {
          const store = db.createObjectStore("state");
        }
      },
    });
  }

  async getPeerId(): Promise<PeerId> {
    const peerId = await this.db.get("state", "peerId");
    if (!peerId) return undefined;
    return PeerId.createFromProtobuf(peerId);
  }

  async setPeerId(peerId: PeerId): Promise<void> {
    await this.db.put("state", peerId.marshal(), "peerId");
  }

  async addPeerId(peerId: PeerId): Promise<void> {
    await this.db.add("peerIds", peerId.marshal(), peerId.toB58String());
  }

  async getName(): Promise<String> {
    const name = await this.db.get("state", "name");
    if (name === undefined) return "";
    else return name;
  }

  async setName(name: String): Promise<void> {
    await this.db.put("state", name, "name");
  }
}

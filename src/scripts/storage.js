import PeerId from "peer-id";

class Storage {
  getPeerId() {
    const peerIdKey = window.sessionStorage.getItem("peerIdKey");
    if (peerIdKey === null) return null;
    return PeerId.createFromPrivKey(peerIdKey);
  }

  setPeerId(peerId) {
    // Buffer.from(u8).toString('base64');
    // peerId.privKey
  }
}

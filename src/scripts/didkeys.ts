import { Ed25519PublicKey } from "libp2p-crypto/src/keys/ed25519-class";
import { RsaPublicKey } from "libp2p-crypto/src/keys/rsa-class";
import PeerId from "peer-id";
import * as mf from "multiformats/basics";

export function peerIdToDid(peerId: PeerId): string {
  let prefix: string;
  if (peerId.pubKey instanceof Ed25519PublicKey) {
    prefix = "ed";
  } else if (peerId.pubKey instanceof RsaPublicKey) {
    prefix = "1205";
  }
  const bytes = new Uint8Array([
    ...mf.bytes.fromHex(prefix),
    ...peerId.pubKey.bytes,
  ]);
  return `did:key:${mf.bases.base58btc.encode(bytes)}`;
}

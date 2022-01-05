import { Ed25519PublicKey } from "libp2p-crypto/src/keys/ed25519-class";
import PeerId from "peer-id";
import { base58btc } from "multiformats/bases/base58";
import { equals } from "uint8arrays/equals";

/*
 * Protocols:
 * https://www.w3.org/TR/did-core/
 * https://w3c-ccg.github.io/did-method-key/
 * https://github.com/multiformats/multicodec
 */

const prefixEd25519 = Uint8Array.from(Buffer.from("ed", "hex"));
const prefixRsa = Uint8Array.from(Buffer.from("1205", "hex"));

export function peerIdToDidKey(peerId: PeerId): string {
  let prefix: Uint8Array;
  if (peerId.pubKey instanceof Ed25519PublicKey) {
    prefix = Uint8Array.from([0xed, 0x01]);
  } else {
    throw "unhandled Peer ID key type";
  }
  const bytes = new Uint8Array([...prefix, ...peerId.pubKey._key]);
  return base58btc.encode(bytes);
}

export async function didToPeerId(did: string) {
  if (!did.startsWith("did:key:")) {
    throw "invalid did key";
  }
  const didKey = did.substring(8);
  if (!didKey.startsWith("z")) {
    throw "invalid encoding";
  }
  const multi = base58btc.decode(didKey);
  if (!equals(multi.slice(0, 2), Uint8Array.from([0xed, 0x01]))) {
    throw "invalid key codec";
  }
  const key = new Ed25519PublicKey(multi.slice(2));
  return PeerId.createFromPubKey(key.bytes);
}

export function didKeyToDocument(didKey: string): object {
  return {
    "@context": ["https://w3id.org/did/v1"],
    id: `did:key:${didKey}`,
    verificationMethod: [
      {
        id: `#${didKey}`,
        type: "Ed25519VerificationKey2020",
        controller: `did:key:${didKey}`,
        publicKeyMultiBase: didKey,
      },
    ],
    authentication: [`#${didKey}`],
    assertionMethod: [`#${didKey}`],
    capabilityDelegation: [`#${didKey}`],
    capabilityInvocation: [`#${didKey}`],
  };
}

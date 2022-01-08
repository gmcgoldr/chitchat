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

export class DidKey {
  readonly did: string;
  constructor(readonly multiKey: string) {
    if (!multiKey.startsWith("z")) {
      throw Error("invalid multikey");
    }
    this.did = `did:key:${multiKey}`;
  }

  static fromPeerId(peerId: PeerId): DidKey {
    let prefix: Uint8Array;
    if (peerId.pubKey instanceof Ed25519PublicKey) {
      prefix = Uint8Array.from([0xed, 0x01]);
    } else {
      throw new Error("unhandled Peer ID key type");
    }
    // @ts-ignore
    const bytes = new Uint8Array([...prefix, ...peerId.pubKey._key]);
    const multiKey = base58btc.encode(bytes);
    return new DidKey(multiKey);
  }

  static fromDid(did: string): DidKey {
    if (!did.startsWith("did:key:")) {
      throw new Error("invalid did key");
    }
    const multiKey = did.substring(8);
    return new DidKey(multiKey);
  }

  async buildPeerId(): Promise<PeerId> {
    const keyBytes = base58btc.decode(this.multiKey);
    if (!equals(keyBytes.slice(0, 2), Uint8Array.from([0xed, 0x01]))) {
      throw new Error("invalid key codec");
    }
    const key = new Ed25519PublicKey(keyBytes.slice(2));
    return PeerId.createFromPubKey(key.bytes);
  }

  buildDocument(): object {
    return {
      "@context": ["https://w3id.org/did/v1"],
      id: this.did,
      verificationMethod: [
        {
          id: `#${this.multiKey}`,
          type: "Ed25519VerificationKey2020",
          controller: this.did,
          publicKeyMultiBase: this.multiKey,
        },
      ],
      authentication: [`#${this.multiKey}`],
      assertionMethod: [`#${this.multiKey}`],
      capabilityDelegation: [`#${this.multiKey}`],
      capabilityInvocation: [`#${this.multiKey}`],
    };
  }
}

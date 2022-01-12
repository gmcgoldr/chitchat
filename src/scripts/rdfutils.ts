import jsonld from "jsonld";
import { base58btc } from "multiformats/bases/base58";
import { CID } from "multiformats/cid";
import * as codecRaw from "multiformats/codecs/raw";
import { sha256 } from "multiformats/hashes/sha2";
import PeerId from "peer-id";

import { DidKey } from "./didkey";
import { noJsonLdContext } from "./utils";

/*
 * Protocols:
 * https://www.w3.org/TR/vc-data-model/
 * https://w3c-ccg.github.io/lds-ed25519-2020/
 * https://www.w3.org/2018/credentials#credentialSubject
 */

export async function buildId(doc: object) {
  if (!noJsonLdContext(doc)) {
    throw Error("context must be expanded");
  }
  // @ts-ignore
  const canonized = await jsonld.canonize(doc);
  const bytes = new TextEncoder().encode(canonized);
  const hash = await sha256.digest(bytes);
  const cid = CID.create(1, codecRaw.code, hash);
  return `urn:cid:${cid.toString()}`;
}

export async function buildProof(doc: object, peerId: PeerId, date?: string) {
  if (!noJsonLdContext(doc)) {
    throw Error("context must be expanded");
  }

  date = date ? date : new Date().toISOString();
  const issuerDid = DidKey.fromPeerId(peerId);

  // @ts-ignore
  const canonized = await jsonld.canonize(doc);
  const bytes = new TextEncoder().encode(canonized);
  const hash = await sha256.digest(bytes);
  const signature = await peerId.privKey.sign(hash.bytes);
  const encodedSignature = base58btc.encode(signature);

  // return {
  //   "@context": ["https://w3id.org/security/suites/ed25519-2020/v1"],
  //   type: "Ed25519Signature2020",
  //   created: date,
  //   proofValue: encodedSignature,
  //   proofPurpose: "assertionMethod",
  //   verificationMethod: `did:key:${issuerDidKey}#${issuerDidKey}`,
  // };

  return {
    "https://w3id.org/security#proof": [
      {
        "@graph": [
          {
            "http://purl.org/dc/terms/created": [
              {
                "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
                "@value": date,
              },
            ],
            "https://w3id.org/security#proofPurpose": [
              {
                "@id": "https://w3id.org/security#assertionMethod",
              },
            ],
            "https://w3id.org/security#proofValue": [
              {
                "@type": "https://w3id.org/security#multibase",
                "@value": encodedSignature,
              },
            ],
            "@type": ["https://w3id.org/security#Ed25519Signature2020"],
            "https://w3id.org/security#verificationMethod": [
              {
                "@id": `${issuerDid.did}#${issuerDid.multiKey}`,
              },
            ],
          },
        ],
      },
    ],
  };
}

export async function buildVerifiableCredential(
  peerId: PeerId,
  key: string,
  data: object,
  subjectDid?: DidKey,
  date?: string
) {
  date = date ? date : new Date().toISOString();
  const issuerDid = DidKey.fromPeerId(peerId);
  subjectDid = subjectDid ? subjectDid : issuerDid;

  // let doc = {
  //   "@context": ["https://www.w3.org/2018/credentials/v1"],
  //   type: "VerifiableCredential",
  //   issuer: `did:key:${issuerDidKey}`,
  //   issuanceDate: date,
  //   credentialSubject: {
  //     "@context": ["https://schema.org"],
  //     id: `did:key:${subjectDidKey}`,
  //   },
  // };

  const doc = {
    "@type": ["https://www.w3.org/2018/credentials#VerifiableCredential"],
    "https://www.w3.org/2018/credentials#issuer": [
      {
        "@id": issuerDid.did,
      },
    ],
    "https://www.w3.org/2018/credentials#issuanceDate": [
      {
        "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
        "@value": date,
      },
    ],
    "https://www.w3.org/2018/credentials#credentialSubject": [
      {
        "@id": subjectDid.did,
      },
    ],
  };

  doc["https://www.w3.org/2018/credentials#credentialSubject"][0][key] = data;

  doc["@id"] = await buildId(doc);
  doc["proof"] = await buildProof(doc, peerId);

  return doc;
}

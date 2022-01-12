import { PeerId } from "libp2p-interfaces/src/pubsub";
import { useEffect, useState } from "react";

import { DidKey } from "../../didkey";
import { Storage } from "../../storage";

interface AccountSelectorProps {
  store: Storage;
  peerIdKey: string;
  selectAccount: (x: string) => void;
}

function AccountSelector({
  store,
  peerIdKey,
  selectAccount,
}: AccountSelectorProps) {
  const [displayName, setDisplayName]: [string, (x: string) => void] =
    useState(null);

  // TODO: add key suffix to disambiguate

  useEffect(async () => {
    if (!store) return;
    const info = await store.getPeerIdInfo(peerIdKey);
    setDisplayName(
      info && info.displayName ? info.displayName : peerIdKey.substring(0, 32)
    );
  }, [peerIdKey, store]);

  return (
    <a
      href="#"
      className="list-group-item list-group-item-action"
      onClick={() => selectAccount(peerIdKey)}
    >
      {displayName}
    </a>
  );
}

interface AccountModalOutBodyProps {
  count: number;
  store: Storage;
  selectAccount: (x: string) => void;
}

function AccountModalOutBody({
  count,
  store,
  selectAccount,
}: AccountModalOutBodyProps) {
  const [accounts, setAccounts]: [string[], (x: string[]) => void] = useState(
    []
  );

  useEffect(async () => {
    if (!store) return;
    const keys = await store.getOwnedPeerIdKeys();
    setAccounts(keys);
  }, [count, store]);

  return (
    <section>
      {store && accounts.length ? (
        <div>
          <p>Log into account:</p>
          <div className="list-group">
            {accounts.map((k, i) => (
              <AccountSelector
                // @ts-ignore
                key={i}
                store={store}
                peerIdKey={k}
                selectAccount={selectAccount}
              />
            ))}
          </div>
        </div>
      ) : (
        <p>No accounts available.</p>
      )}
    </section>
  );
}

interface AccountModalInBodyProps {
  displayName: string;
  peerId: PeerId;
  did: DidKey;
  logout: () => void;
}

function AccountModalInBody({
  displayName,
  peerId,
  did,
  logout,
}: AccountModalInBodyProps) {
  return (
    <section>
      <div className="d-flex justify-content-center m-2">
        <button type="button" className="btn btn-primary" onClick={logout}>
          Log out
        </button>
      </div>
      <div className="grid m-2">
        <div className="row mb-2">
          <div className="col-3 bg-secondary text-white rounded">Handle</div>
          <div className="col-9 text-truncate">{displayName}</div>
        </div>
        <div className="row mb-2">
          <div className="col-3 bg-secondary text-white rounded">Peer ID</div>
          <div className="col-9 text-truncate">
            <a
              href="#"
              onClick={() => {
                navigator.clipboard.writeText(peerId.toB58String());
              }}
            >
              {peerId ? peerId.toB58String() : ""}
            </a>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-3 bg-secondary text-white rounded">DID</div>
          <div className="col-9 text-truncate">
            <a
              href="#"
              onClick={() => {
                navigator.clipboard.writeText(did.did);
              }}
            >
              {did ? did.did : ""}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export interface AccountModalProps {
  displayName: string;
  peerId: PeerId;
  did: DidKey;
  loggedIn: boolean;
  store: Storage;
  logout: () => void;
  selectAccount: (x: string) => void;
}

export function AccountModal({
  displayName,
  peerId,
  did,
  loggedIn,
  store,
  logout,
  selectAccount,
}: AccountModalProps) {
  // used to update the state every time the modal is open
  const [count, setCount]: [number, (x: number) => void] = useState(0);

  return (
    <section>
      <button
        type="button"
        className="btn btn-purple-to-red"
        data-bs-toggle="modal"
        data-bs-target="#accountModal"
        data-bs-placement="top"
        onClick={() => setCount(count + 1)}
      >
        {loggedIn ? <span>@{displayName}</span> : <span>Log in</span>}
      </button>
      <div
        className="modal fade"
        id="accountModal"
        tabIndex={-1}
        aria-labelledby="accountModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="accountModalLabel">
                Account
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {loggedIn ? (
                <AccountModalInBody
                  displayName={displayName}
                  peerId={peerId}
                  did={did}
                  logout={logout}
                />
              ) : (
                <AccountModalOutBody
                  store={store}
                  count={count}
                  selectAccount={selectAccount}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

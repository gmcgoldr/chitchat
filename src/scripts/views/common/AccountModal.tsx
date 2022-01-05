import { useEffect, useState } from "react";

function AccountSelector({ store, peerIdKey, selectAccount }) {
  const [displayName, setDisplayName] = useState(null);

  // TODO: add key suffix to disambiguate

  useEffect(async () => {
    const info = await store.getPeerIdInfo(peerIdKey);
    setDisplayName(
      info && info.displayName ? info.displayName : peerIdKey.substring(0, 32)
    );
  }, [peerIdKey]);

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

function AccountModalOutBody({ store, selectAccount, count }) {
  const [accounts, setAccounts] = useState(undefined);

  useEffect(async () => {
    const keys = await store.getOwnedPeerIdKeys();
    setAccounts(keys);
  }, [count]);

  return (
    <section>
      {accounts && accounts.length ? (
        <div>
          <p>Log into account:</p>
          <div className="list-group">
            {accounts.map((k) => (
              <AccountSelector
                key={k}
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

function AccountModalInBody({ name, logout }) {
  return (
    <section>
      <div className="d-flex justify-content-center m-2">
        <button type="button" className="btn btn-primary" onClick={logout}>
          Log out
        </button>
      </div>
      <div className="grid m-2">
        <div className="row">
          <div className="col-4 bg-secondary text-white rounded">
            Display name
          </div>
          <div className="col-8">{name}</div>
        </div>
      </div>
    </section>
  );
}

export function AccountModal({ name, loggedIn, logout, selectAccount, store }) {
  const [count, setCount] = useState(0);

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
        {loggedIn ? <span>@{name}</span> : <span>Log in</span>}
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
                <AccountModalInBody name={name} logout={logout} />
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

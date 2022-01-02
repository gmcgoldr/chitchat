import React, { useState, useEffect } from "react";

export function CreateAccount(eventBus) {
  const storage = window.sessionStorage;
  const [name, setName] = useState(() => {
    const name = storage.getItem("name");
    return name === null ? "" : name;
  });

  useEffect(() => {});

  return (
    <section>
      <div className="container mw-md">
        <h3>New Account</h3>

        <p>
          It seems you're new here. Tell people about yourself to get started.
        </p>

        <form>
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text">Name</span>
              <input
                type="name"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-describedby="newAccountNameHelp"
              />
            </div>
            <div id="newAccountNameHelp" className="form-text">
              Use a name which will help people find you.
            </div>
          </div>
          <button
            id="newAccountSubmit"
            type="button"
            className="btn btn-primary"
            onClick={storage.setItem("name", name)}
          >
            Create account
          </button>
        </form>
      </div>
    </section>
  );
}

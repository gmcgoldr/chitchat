import React, { useState } from "react";

export function ShareModal({ did }) {
  const [isCopied, setIsCopied]: [boolean, any] = useState(false);

  const location = new URL(window.location.href);
  const link = did
    ? `${location.origin}${location.pathname}/?follow=${did.did}`
    : "";
  function setClipboardToLink() {
    setIsCopied(true);
    navigator.clipboard.writeText(link);
  }

  return (
    <section>
      <button
        type="button"
        className="btn btn-blue-to-pink"
        data-bs-toggle="modal"
        data-bs-target="#shareModal"
        data-bs-placement="top"
      >
        <i className="bi bi-send"></i>&nbsp; Share Invite
      </button>
      <div
        className="modal fade"
        id="shareModal"
        tabIndex={-1}
        aria-labelledby="shareInviteLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="shareInviteLabel">
                Share Invite
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => {
                  setIsCopied(false);
                }}
              ></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "1.5em" }}>
                <a href="#">
                  <i className="bi bi-facebook"></i>
                </a>
                &ensp;
                <a href="#">
                  <i className="bi bi-twitter"></i>
                </a>
                &ensp;
                <a href="#">
                  <i className="bi bi-instagram"></i>
                </a>
              </p>
              <p>
                <a
                  href="#"
                  className="me-3 text-decoration-none d-flex align-items-center"
                  onClick={setClipboardToLink}
                >
                  <i
                    style={{ fontSize: "1.5em" }}
                    className="bi bi-clipboard-check"
                  ></i>
                  &nbsp;
                  <span>{isCopied ? "Link copied" : "Copy follow link"}</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

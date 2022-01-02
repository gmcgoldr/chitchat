import React, { useState } from "react";

export function ShareModal() {
  const [isCopied, setIsCopied] = useState(false);

  const link = "localhost:1234/follow";
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
        tabIndex="-1"
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
                &nbsp;
                <a href="#">
                  <i className="bi bi-twitter"></i>
                </a>
                &nbsp;
                <a href="#">
                  <i className="bi bi-instagram"></i>
                </a>
              </p>
              <p className="d-flex align-items-center">
                <a href="#" className="me-3" onClick={setClipboardToLink}>
                  <i
                    style={{ fontSize: "1.5em" }}
                    className="bi bi-clipboard-check"
                  ></i>
                </a>
                <span className="font-monospace me-3">
                  {isCopied ? "Link copied!" : link}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

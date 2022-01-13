import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import QRCode from "react-qr-code";

import { CopyLink } from "./CopyLink";

export function ShareModal({ did }) {
  const [link, setLink]: [string, any] = useState("");
  const [showModal, setShowModal]: [boolean, any] = useState(false);

  useEffect(() => {
    const location = new URL(window.location.href);
    const link = did
      ? `${location.origin}${location.pathname}?follow=${did.did}`
      : "";
    setLink(link);
  }, [did]);

  return (
    <section>
      <button
        type="button"
        className="btn btn-blue-to-pink"
        onClick={() => setShowModal(true)}
      >
        <i className="bi bi-send"></i>&nbsp; Share Invite
      </button>
      <Modal show={showModal}>
        <Modal.Header>
          <Modal.Title>Share Invite</Modal.Title>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowModal(false)}
          ></button>
        </Modal.Header>
        <Modal.Body>
          <p
            style={{ fontSize: "1.5em" }}
            className="d-flex justify-content-center"
          >
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
          <p className="d-flex justify-content-center">
            <CopyLink value={link} altText="Copy link to clipboard" />
          </p>
          <p className="d-flex justify-content-center">
            <QRCode value={link} size={128} />
          </p>
        </Modal.Body>
      </Modal>
    </section>
  );
}

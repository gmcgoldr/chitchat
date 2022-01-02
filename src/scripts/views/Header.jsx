import { ShareModal } from "./ShareModal";

import logo from "../../svg/logo-solid-color.svg";

export function Header() {
  return (
    <header className="mb-3 border-bottom">
      <div className="container">
        <nav className="navbar navbar-light d-flex">
          <a className="navbar-brand d-flex" href="#">
            <div className="align-self-center">
              <img
                src={logo}
                alt="logo"
                style={{ height: "48px", textAlign: "middle" }}
              />
            </div>
            <div className="ms-2 align-self-center">
              <span className="font-heading" style={{ fontSize: "1.4em" }}>
                ChitChat
              </span>
            </div>
          </a>
          <ShareModal />
        </nav>
      </div>
    </header>
  );
}

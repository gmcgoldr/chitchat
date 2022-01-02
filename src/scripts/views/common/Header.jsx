import { ShareModal } from "./ShareModal";

import logo from "../../../svg/logo-solid-color.svg";

export function Header({ name, isAccount }) {
  return (
    <header className="mb-3 border-bottom">
      <div className="container mw-lg">
        <nav className="navbar navbar-light d-flex flex-row">
          <a className="navbar-brand d-flex" href="#">
            <div>
              <img
                src={logo}
                alt="logo"
                style={{ height: "48px", textAlign: "middle" }}
              />
            </div>
            <div className="ms-2">
              <span className="font-heading" style={{ fontSize: "1.4em" }}>
                ChitChat
              </span>
            </div>
          </a>
          <div className="ms-auto">
            <ShareModal />
          </div>
          {isAccount ? (
            <a href="#" className="ms-3 btn btn-primary">
              @{name}
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

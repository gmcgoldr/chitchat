import { ShareModal } from "./ShareModal";

import logo from "../../../svg/logo-solid-color.svg";

export function Header({ name, hasAccount }) {
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
          {hasAccount ? (
            <a href="#" className="ms-2 btn btn-primary">
              @{name}
            </a>
          ) : (
            <a href="#" className="ms-2 btn btn-primary">
              Login
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}

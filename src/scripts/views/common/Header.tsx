import { ShareModal } from "./ShareModal";
import { AccountModal } from "./AccountModal";

const logo = require("../../../svg/logo-solid-color.svg") as string;

export function Header({ name, loggedIn, logout, selectAccount, store }) {
  return (
    <header className="mb-3 border-bottom">
      <div className="container mw-lg">
        <nav className="navbar navbar-light d-flex flex-row">
          <a className="navbar-brand d-flex" href="#">
            <div>
              <img src={logo} alt="logo" style={{ height: "48px" }} />
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
          <div className="ms-2">
            <AccountModal
              name={name}
              loggedIn={loggedIn}
              logout={logout}
              selectAccount={selectAccount}
              store={store}
            />
          </div>
        </nav>
      </div>
    </header>
  );
}

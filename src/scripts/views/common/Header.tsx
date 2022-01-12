import { PeerId } from "libp2p-interfaces/src/pubsub";

import { DidKey } from "../../didkey";
import { Storage } from "../../storage";
import { AccountModal } from "./AccountModal";
import { ShareModal } from "./ShareModal";

const logo = require("../../../svg/logo-solid-color.svg") as string;

export interface HeaderProps {
  displayName: string;
  peerId: PeerId;
  did: DidKey;
  loggedIn: boolean;
  store: Storage;
  logout: () => void;
  selectAccount: (x: string) => void;
}

export function Header({
  displayName,
  peerId,
  did,
  loggedIn,
  store,
  logout,
  selectAccount,
}: HeaderProps) {
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
            <ShareModal did={did} />
          </div>
          <div className="ms-2">
            <AccountModal
              displayName={displayName}
              peerId={peerId}
              did={did}
              loggedIn={loggedIn}
              store={store}
              logout={logout}
              selectAccount={selectAccount}
            />
          </div>
        </nav>
      </div>
    </header>
  );
}

import "bootstrap/js/dist/modal";

import React from "react";
import ReactDOM from "react-dom";
import { Home } from "./views/Home";

localStorage.debug = ""; // change to libp2p:* for all libp2p debug

const url = new URL(window.location.toString());

ReactDOM.render(
  <Home addFollow={url.searchParams.get("follow")} />,
  document.getElementById("root-home")
);

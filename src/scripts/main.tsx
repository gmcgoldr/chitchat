import "bootstrap/js/dist/modal";

import React from "react";
import ReactDOM from "react-dom";
import { Home } from "./views/Home";

localStorage.debug = ""; // change to libp2p:* for all libp2p debug

ReactDOM.render(<Home />, document.getElementById("root-home"));

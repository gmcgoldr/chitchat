import React from "react";
import ReactDOM from "react-dom";

import { Router } from "./views/Router";

localStorage.debug = ""; // change to libp2p:* for all libp2p debug

ReactDOM.render(<Router />, document.getElementById("root-home"));

import "bootstrap/js/dist/modal";

import React from "react";
import ReactDOM from "react-dom";
import { App } from "./views/App";

localStorage.debug = ""; // change to libp2p:* for all libp2p debug

ReactDOM.render(<App />, document.getElementById("root"));

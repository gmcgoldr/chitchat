import { useEffect, useState } from "react";

import { Home } from "./Home";

export function Router() {
  const [location, setLocation]: [URL, (x: URL) => void] = useState(null);

  useEffect(() => {
    setLocation(new URL(window.location.href));
  }, []);

  return <Home location={location} />;

  // switch (location ? location.pathname : null) {
  //   case "/":
  //     return <Home location={location} />;
  //   default:
  //     return <div>404</div>;
  // }
}

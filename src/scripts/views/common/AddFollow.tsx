import { useEffect, useState } from "react";

export interface AddFollowProps {
  location: URL;
  follow: (did: string) => void;
}

export function AddFollow({ location, follow }: AddFollowProps) {
  const [did, setDid]: [string, (x: string) => void] = useState("");

  useEffect(() => {
    if (!location) return;
    const newDid = location.searchParams.get("follow");
    setDid(newDid ? newDid : "");
  }, [location]);

  return (
    <section>
      <div className="container mw-md">
        <h3>Follow</h3>
        <form>
          <div className="mb-3">
            <input
              type="name"
              className="form-control"
              value={did}
              onChange={(e) => {
                setDid(e.target.value);
              }}
            />
          </div>
          <button
            id="createPostSubmit"
            type="button"
            className="btn btn-primary"
            onClick={() => follow(did)}
          >
            Follow
          </button>
        </form>
      </div>
    </section>
  );
}

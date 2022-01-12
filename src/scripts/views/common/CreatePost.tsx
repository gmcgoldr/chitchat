import { useState } from "react";

export interface CreatePostProps {
  post: (x: string) => void;
}

export function CreatePost({ post }: CreatePostProps) {
  const [message, setMessage]: [string, (x: string) => void] = useState("");

  return (
    <section>
      <div className="container mw-md">
        <h3>Post</h3>
        <form>
          <div className="mb-3">
            <input
              type="name"
              className="form-control"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            />
          </div>
          <button
            id="createPostSubmit"
            type="button"
            className="btn btn-primary"
            onClick={() => post(message)}
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
}

import { pipe } from "it-pipe";
import { toBuffer } from "it-buffer";
import { collect, consume, take } from "streaming-iterables";
import lp from "it-length-prefixed";

import Libp2p from "libp2p";
import PeerId from "peer-id";

const protocol = "/chitchat/activitypub/0.1.0";

async function handleRoutes(route: string, verb: string, data: object) {}

async function sendRoutes(route: string, verb: string, data: object) {}

export function handle(libp2p: Libp2p) {
  libp2p.handle(protocol, async ({ stream }) => {
    const [result] = await pipe(
      [],
      stream,
      lp.decode(),
      take(1),
      toBuffer,
      collect
    );
    const { route, verb, data } = JSON.parse(new TextDecoder().decode(result));
    handleRoutes(route, verb, data);
  });
}

export async function send(
  libp2p: Libp2p,
  peer: PeerId,
  route: string,
  verb: string,
  data: object
) {
  const connection = await libp2p.dial(peer);
  const { stream } = await connection.newStream(protocol);
  const message = new TextEncoder().encode(
    JSON.stringify({ route: route, verb: verb, data: data })
  );
  await pipe([message], lp.encode(), stream, consume);
}

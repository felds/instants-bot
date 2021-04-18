/// <reference path="./src/types.d.ts" />

import http from "http";

async function main() {
  // await loadAppConfig();

  await Promise.all([
    // load modules
    import("./src/dm"),
    import("./src/events"),
  ]);

  console.log("Hora do show, porra!");
}
main().catch((err) => `Oops! Something went wrong...\n\n${err}`);

// server
const port = process.env.PORT;
const server = http.createServer((req, res) => {
  res.setHeader("Content-type", "text/plain; charset=utf-8");
  res.end("Olha a pedra!!");
});
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// import http from "http";
// import { join } from "path";
// import "./src/dm";
// import { importDir } from "./src/util";

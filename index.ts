/// <reference path="./src/types.d.ts" />

import http from "http";
import { join } from "path";
import { importDir } from "./src/util";
import { loadAppConfig } from "./src/util/firebase";

async function main() {
  await loadAppConfig();
  importDir(join(__dirname, "./src/events"));
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

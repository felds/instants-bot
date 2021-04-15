/// <reference path="./src/types.d.ts" />

// load env vars from json
Object.entries(require("./.env.json") as { [k: string]: any }).forEach(
  ([k, v]) => {
    process.env[k] = process.env[k] ?? v;
  },
);

import http from "http";
import { join } from "path";
import util from "util";
import "./src/dm";
import { importDir } from "./src/util";

importDir(join(__dirname, "./src/events"));

// server
const server = http.createServer((req, res) => {
  res.setHeader("Content-type", "text/plain; charset=utf-8");
  res.write(util.format("\n\nENV: %O", process.env));
  res.end();
});

server.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});

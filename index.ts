/// <reference path="./src/types.d.ts" />

// load env vars from json
Object.entries(require("./.env.json") as { [k: string]: any }).forEach(
  ([k, v]) => {
    process.env[k] = process.env[k] ?? v;
  },
);

import { join } from "path";
import "./src/dm";
import { importDir } from "./src/util";

importDir(join(__dirname, "./src/events"));

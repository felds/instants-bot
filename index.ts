/// <reference path="./src/types.d.ts" />

import { join } from "path";
import config from "./src/config";
import { client } from "./src/discord";
import { importDir } from "./src/util";

client.login(config.TOKEN);

importDir(join(__dirname, "./src/events"));

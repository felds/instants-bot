/// <reference path="./src/types.d.ts" />

import { join } from "path";
import server from "./server-http";
import config from "./src/config";
import { client } from "./src/discord";
import "./src/dm";
import { importDir } from "./src/util";

client.login(config.TOKEN);

importDir(join(__dirname, "./src/events"));
//server to keep app alive in Heroku
server.listen(process.env.PORT || 80);

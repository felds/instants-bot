import bunyan from "bunyan";
import process from "process";
import config from "./config";

export const logger = bunyan.createLogger({
  name: "cleiton-bot",
  streams: [{ level: config.DEBUG ? "trace" : "info", stream: process.stdout }],
});

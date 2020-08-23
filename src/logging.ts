import bunyan from "bunyan";
import process from "process";

export const logger = bunyan.createLogger({
  name: "cleiton-bot",
  streams: [{ level: "debug", stream: process.stdout }],
});

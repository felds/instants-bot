import bunyan from "bunyan";
import process from "process";
import config from "./config";

const level = config.DEBUG ? "trace" : "info";

export const logger = bunyan.createLogger({
  name: "cleiton-bot",
  streams: [{ level, stream: process.stdout }],
});

if (config.ENV === "gcp") {
  import("@google-cloud/logging-bunyan").then(({ LoggingBunyan }) => {
    const connector = new LoggingBunyan();
    logger.addStream(connector.stream(level));
  });
}

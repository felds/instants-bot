import config from "../config";
import { client } from "../discord";
import { logger } from "../logging";

client.on("ready", () => {
  logger.info(
    { user: client.user?.tag },
    "Logged in. Ready to debochar legal. Listening to prefix %O.",
    config.PREFIX,
  );
});

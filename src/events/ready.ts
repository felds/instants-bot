import { client } from "../discord";
import config from "../config";
import { logger } from "../logging";

client.on("ready", () => {
  logger.info(
    { user: client.user?.tag },
    "Logged in. Ready to debochar legal."
  );

  client.user?.setActivity({
    name: `${config.prefix} -help`,
    type: "LISTENING",
  });
});

import fs from "fs";
import { client } from "./src/discord";
import config from "./src/config";

client.login(config.token);

const EVENTS_FOLDER = "./src/events";
fs.readdir(EVENTS_FOLDER, (err, files) => {
  if (err) {
    console.log(`Failed at loading events.`, err);
    process.exit(1);
  }

  files.forEach(
    (event) =>
      event.endsWith(".ts") &&
      (console.log(`- Importing event ${event}`),
      import(`${EVENTS_FOLDER}/${event.slice(0, -3)}`))
  );
});

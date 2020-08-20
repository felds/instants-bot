import { client } from "../discord";
import config from "../config";

client.on("ready", () => {
  console.log(`
---------------------

  Estou pronto!
  Estou pronto!
    -- Bob Esponja

---------------------

- Logged in as ${client.user?.tag}
`);

  client.user?.setActivity({
    name: `${config.prefix} -help`,
    type: "LISTENING",
  });
});

import assert from "assert";
import { join } from "path";
import config from "../config";
import { client } from "../discord";
import { logger } from "../logging";
import { getQueue } from "../queue";
import { importDir } from "../util";

// import individual commands
const commands: Promise<Command[]> = importDir<{ command: Command }>(
  join(__dirname, "../commands/"),
).then((modules) => modules.map((module) => module.command));

client.on("message", async (message) => {
  if (message.author.bot) return;

  const cleanContent = message.cleanContent;
  const [prefix, ...args] = cleanContent.split(/\s+/);

  // not a command for me
  if (prefix !== config.PREFIX) return;

  // handle connections
  const queue = (() => {
    try {
      const guild = message.guild;
      assert(guild, new Error("The message doesn't have a guild."));
      return getQueue(message.guild!);
    } catch (err) {
      logger.error({ err }, "Error while connecting to the voice channel.");
      return message.reply(err.message);
    }
  })();

  for (const command of await commands) {
    if (command.aliases.length && !command.aliases.includes(args[0])) continue;
    return command.process(message, queue, ...args);
  }
});

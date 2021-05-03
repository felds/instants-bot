import assert from "assert";
import { Message } from "discord.js";
import { join } from "path";
import config from "../config";
import { client } from "../discord";
import { logger } from "../logging";
import { getQueue, Queue } from "../queue";
import { importDir } from "../util";

export type Command = {
  aliases: string[];
  description: string;
  process: (message: Message, queue: Queue, ...args: string[]) => Promise<void>;
};

// import individual commands
const commands: Promise<Command[]> = importDir<{ command: Command }>(
  join(__dirname, "../commands/"),
)
  .then((modules) => modules.map((module) => module.command))
  .catch((err) => {
    logger.fatal("Couldn't load command.", { err });
    process.exit(1);
  });

client.on("message", async (message) => {
  if (message.author.bot) return;

  const cleanContent = message.cleanContent;
  const [prefix, ...args] = cleanContent.split(/\s+/);

  // not a command for me
  if (prefix !== config.PREFIX) return;

  // handle connections
  try {
    const guild = message.guild;
    assert(guild, new Error("The message doesn't have a guild."));

    const queue = getQueue(guild);

    for (const command of await commands) {
      if (command.aliases.length && !command.aliases.includes(args[0]))
        continue;
      return await command.process(message, queue, ...args);
    }
  } catch (err) {
    message.reply(err.message);
  }
});

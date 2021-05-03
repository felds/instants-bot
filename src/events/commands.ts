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
  process: (message: Message, queue: Queue, args: string[]) => Promise<void>;
};

// import individual commands
const commandsFolder = join(__dirname, "../commands");
const commands: Promise<Command[]> = importDir<{ command: Command }>(
  commandsFolder,
)
  .then((modules) => modules.map((module) => module.command))
  .catch((err) => {
    logger.fatal("Couldn't load command.", { err });
    process.exit(1);
  });
const defaultCommand = import(join(commandsFolder, "99-search.ts")).then(
  (x) => x.command,
) as Promise<Command>;

client.on("message", async (message) => {
  // message from another bot. ignore.
  if (message.author.bot) return;

  const cleanContent = message.cleanContent;
  const [prefix, ...args] = cleanContent.split(/\s+/);

  // not a message for me. ignore.
  if (prefix !== config.PREFIX) return;

  // handling commands
  const guild = message.guild;
  assert(guild, new Error("The message doesn't have a guild."));

  const queue = getQueue(guild);
  let handled = false;
  try {
    for (const command of await commands) {
      if (commandRespondsTo(command, args)) {
        await command.process(message, queue, args);
        handled = true;
      }
    }
    if (!handled) {
      await (await defaultCommand).process(message, queue, args);
    }
  } catch (err) {
    message.reply(err.message);
  }
});

function commandRespondsTo(command: Command, args: string[]) {
  return command.aliases.length > 0 && command.aliases.includes(args[0]);
}

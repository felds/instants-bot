import assert from "assert";
import { join } from "path";
import config from "../config";
import { client } from "../discord";
import { getQueue } from "../queue";
import { createCommandRunner } from "../util/command";

const commandRunner = createCommandRunner(
  join(__dirname, "../commands/chat"),
  "search",
);

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
  try {
    await commandRunner.then((process) => process(message, queue, args));
  } catch (err) {
    message.reply(err.message);
  }
});

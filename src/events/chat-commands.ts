import assert from "assert";
import { join } from "path";
import config from "../config";
import { client } from "../discord";
import { getQueue, Queue } from "../queue";
import { createCommandRunner } from "../util/command";

const commandRunner = createCommandRunner<{ queue: Queue }>(
  join(__dirname, "../commands/chat"),
  "search",
);

client.on("message", async (message) => {
  // it's a DM. ignore.
  if (message.channel.type === "dm") return;

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
    const process = await commandRunner;
    await process(args, message, { queue });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    message.reply(msg);
  }
});

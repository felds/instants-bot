import { join } from "path";
import { client } from "../discord";
import { createCommandRunner } from "../util/command";

const commandRunner = createCommandRunner(
  join(__dirname, "../commands/dm"),
  "search",
);

client.on("message", async (message) => {
  // not a DM. ignore.
  if (message.channel.type !== "dm") return;

  // message from another bot. ignore.
  if (message.author.bot) return;

  const cleanContent = message.cleanContent;
  const args = cleanContent.split(/\s+/);
  try {
    const process = await commandRunner;
    await process(args, message);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    message.reply(msg);
  }
});

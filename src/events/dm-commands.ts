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

  // handling commands
  try {
    // @ts-ignore
    await commandRunner.then((process) => process(message, undefined, args));
  } catch (err) {
    message.reply(err.message);
  }
});

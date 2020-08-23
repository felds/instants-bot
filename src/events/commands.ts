import { VoiceChannel } from "discord.js";
import { join } from "path";
import config from "../config";
import { client, getVoiceChannel } from "../discord";
import Queue, { getQueue } from "../queue";
import { importDir } from "../util";
import { logger } from "../logging";

// import individual commands
const commands: Promise<Command[]> = importDir<{ command: Command }>(
  join(__dirname, "../commands")
).then((modules) => modules.map((module) => module.command));

client.on("message", async (message) => {
  if (message.author.bot) return;

  const cleanContent = message.cleanContent.trim();
  if (!matchPrefix(cleanContent)) return;

  // handle connections
  let voiceChannel: VoiceChannel;
  let queue: Queue;
  try {
    voiceChannel = getVoiceChannel(message);
    queue = await getQueue(voiceChannel);
  } catch (err) {
    logger.error({ err }, "Error while connecting to the voice channel.");
    return message.reply(err.message);
  }

  const args = cleanContent.split(/\s+/).slice(1);
  for (const command of await commands) {
    if (command.aliases.length && !command.aliases.includes(args[0])) continue;
    return command.process(message, queue, ...args);
  }
});

function matchPrefix(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return (
    lowerContent.startsWith(config.prefix + " ") ||
    lowerContent === config.prefix
  );
}

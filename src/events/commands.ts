import { VoiceChannel } from "discord.js";
import CommandHandler from "../CommandHandler";
import config from "../config";
import { client, getVoiceChannel } from "../discord";
import Queue, { getQueue } from "../queue";

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
    return message.reply(err.message);
  }

  const args = cleanContent.split(/\s+/).slice(1);
  const handlers: ICommandHandler[] = [
    // --------------------------
    new CommandHandler.Help(args, message),
    new CommandHandler.List(args, message, queue),
    new CommandHandler.Skip(args, message, queue),
    new CommandHandler.Stop(args, message, queue),
    new CommandHandler.Search(args, message, queue),
    // --------------------------
  ];
  for (const handler of handlers) {
    if (await handler.accepts()) {
      await handler.handle();
      return;
    }
  }
});

function matchPrefix(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return (
    lowerContent.startsWith(config.prefix + " ") ||
    lowerContent === config.prefix
  );
}

import { MessageMentions, Util, VoiceChannel } from "discord.js";
import { join } from "path";
import { client, getVoiceChannel } from "../discord";
import { logger } from "../logging";
import { getQueue, Queue } from "../queue";
import { importDir } from "../util";

// import individual commands
const commands: Promise<Command[]> = importDir<{ command: Command }>(
  join(__dirname, "../commands/"),
).then((modules) => modules.map((module) => module.command));

client.on("message", async (message) => {
  if (message.author.bot) return;

  const me = client.user!;
  if (!message.mentions.has(me)) return;

  // handle connections
  let channel: VoiceChannel;
  let queue: Queue;
  try {
    channel = getVoiceChannel(message);
    queue = getQueue(channel);
  } catch (err) {
    logger.error({ err }, "Error while connecting to the voice channel.");
    return message.reply(err.message);
  }

  const squeakyCleanContent = message.content.replace(/<[@#&].*?>/g, "").trim();
  const args = squeakyCleanContent.split(/\s+/);
  console.log({
    args,
    squeakyCleanContent,
    content: message.content,
    removeMentions: Util.removeMentions(message.content),
    removeMentionsClean: Util.removeMentions(message.cleanContent),
    mentions: message.mentions.users.map((u) => String(u)),
    x: MessageMentions,
  });
  for (const command of await commands) {
    if (command.aliases.length && !command.aliases.includes(args[0])) continue;
    return command.process(message, queue, ...args);
  }
});

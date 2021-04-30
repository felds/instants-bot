import { VoiceState } from "discord.js";
import { client } from "../discord";
import { logger } from "../logging";
import { getQueue, QueueException } from "../queue";
import { getUserConfig } from "../util/firebase";

client.on(
  "voiceStateUpdate",
  async function voiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
    if (!shouldPlay(oldState, newState)) {
      return;
    }

    const member = newState.member!;

    const userConfig = await getUserConfig(member.id);
    const url = userConfig?.doorbell as string | undefined;
    const channel = newState.channel!;

    if (!url) return;

    try {
      const queue = getQueue(newState.guild);
      logger.debug({ url }, "Playing buzzer.");
      await queue.play({
        url,
        title: `🥑 ${member.displayName}`,
        voiceChannel: channel,
      });
    } catch (err) {
      if (err instanceof QueueException) {
        logger.warn(
          { channel: err.channel.name, guild: err.channel.guild.name },
          err.message,
        );
      }
    }
  },
);

function isJoining(oldState: VoiceState, newState: VoiceState): boolean {
  return !!(newState.channel && oldState.channel !== newState.channel);
}

function shouldPlay(oldState: VoiceState, newState: VoiceState): boolean {
  const { member } = newState;

  if (!member) {
    logger.debug("No member.");
    return false;
  }
  if (member.user.bot) {
    logger.trace({ user: member.user.tag }, "User is a bot.");
    return false;
  }
  if (!isJoining(oldState, newState)) {
    logger.trace(
      { user: member.user.tag },
      "User is not joining a new voice channel.",
    );
    return false;
  }

  return true;
}

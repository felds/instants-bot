import { Client, VoiceState } from "discord.js";
import config from "./src/config";
import { logger } from "./src/logging";

const client = new Client();
client.login(config.TOKEN);

const sounds: { [id: string]: string } = {
  "741127151289499709": "/Users/felds/Downloads/boom-chicka-wah-wah.mp3",
};

client.on("ready", () => logger.info("Logged in as user %O", client.user?.tag));

const isJoining = (oldState: VoiceState, newState: VoiceState) =>
  !!(newState.channel && oldState.channel !== newState.channel);

client.on(
  "voiceStateUpdate",
  async (oldState: VoiceState, newState: VoiceState) => {
    if (!shouldPlay(oldState, newState)) {
      return;
    }

    const member = newState.member!;
    const channel = newState.channel!;

    const connection = await channel.join();
    logger.debug({ file: sounds[member.id] }, "Playing buzzer.");
    connection.play(sounds[member.id]);
  },
);

function shouldPlay(oldState: VoiceState, newState: VoiceState): boolean {
  const { member, channel } = newState;

  if (!member) {
    logger.debug("No member.");
    return false;
  }
  if (member.user.bot) {
    logger.trace({ user: member.user.tag }, "User is a bot.");
    return false;
  }
  if (!channel || !isJoining(oldState, newState)) {
    logger.trace(
      { user: member.user.tag },
      "User is not joining a new voice channel.",
    );
    return false;
  }
  if (!channel.joinable) {
    logger.debug({ channel: channel.name }, "Channel is not joinable.");
    return false;
  }
  if (!sounds[member.id]) {
    logger.trace({ user: member.user.tag }, "User is a bot.");
    return false;
  }

  return true;
}

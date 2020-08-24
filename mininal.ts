import { Client, GuildMember, VoiceChannel, VoiceState } from "discord.js";
import config from "./src/config";
import { logger } from "./src/logging";

const client = new Client();
client.login(config.token);

const sounds: { [id: string]: string } = {
  "741127151289499709": "/Users/felds/Downloads/boom-chicka-wah-wah.mp3",
};

client.on("ready", () => logger.info("Logged in as user %O", client.user?.tag));

const isJoining = (oldState: VoiceState, newState: VoiceState) =>
  !!(newState.channel && oldState.channel !== newState.channel);

client.on(
  "voiceStateUpdate",
  async (oldState: VoiceState, newState: VoiceState) => {
    try {
      const [member, channel] = shouldPlay(oldState, newState);

      const connection = await channel.join();
      logger.debug({ file: sounds[member.id] }, "Playing buzzer.");
      connection.play(sounds[member.id]);
    } catch (err) {
      logger.debug(err);
    }
  },
);

function shouldPlay(
  oldState: VoiceState,
  newState: VoiceState,
): [GuildMember, VoiceChannel] {
  const { member, channel } = newState;

  if (!member) {
    throw "No member.";
  }
  if (member.user.bot) {
    throw "User is a bot.";
  }
  if (!channel || !isJoining(oldState, newState)) {
    throw "User is not joining a new voice channel.";
  }
  if (!channel.joinable) {
    throw "Channel is not joinable.";
  }
  if (!sounds[member.id]) {
    throw "User doesn't have a sound.";
  }

  return [member, channel];
}

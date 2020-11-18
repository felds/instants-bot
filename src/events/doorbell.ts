import { VoiceState } from "discord.js";
import { client } from "../discord";
import { logger } from "../logging";
import { getQueue, QueueException } from "../queue";

const doorbells: { [k: string]: Instant } = {
  "517135926334324747": {
    url: "https://www.myinstants.com/media/sounds/eaburnea_u4ueT4r.mp3",
    title: "MIMA entrou na sala",
  },
  "109491752984907776": {
    url: "https://www.myinstants.com/media/sounds/oi_demonios_amp.mp3",
    title: "FELDS entrou na sala",
  },
  "338896627228213248": {
    url: "https://www.myinstants.com/media/sounds/barry-white-lalalala.mp3",
    title: "YURI entrou na sala",
  },
  "229722390437822464": {
    url: "https://www.myinstants.com/media/sounds/jamal.mp3",
    title: "JAMAL entrou na sala",
  },
  "692852659765641337": {
    url: "https://www.myinstants.com/media/sounds/manuca_ola_amigao.mp3",
    title: "MOTOSO entrou na sala",
  },
  "172161615620341761": {
    url: "https://www.myinstants.com/media/sounds/carrera_eh_verdade.mp3",
    title: "CARRERA entrou na sala",
  },
  "741127151289499709": {
    url: "https://www.myinstants.com/media/sounds/hello_D4GzkfK.mp3",
    title: "MINION entrou na sala",
  },
  "418762238506172416": {
    url: "https://www.myinstants.com/media/sounds/masculynah_QsNgdVk.mp3",
    title: "LARISSA entrou na sala",
  },
};

client.on("voiceStateUpdate", async function voiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState,
) {
  if (!shouldPlay(oldState, newState)) {
    return;
  }

  const member = newState.member!;
  const channel = newState.channel!;
  const sound = doorbells[member.id];

  try {
    const queue = getQueue(channel);
    logger.debug({ sound }, "Playing buzzer.");
    await queue.play(sound);
  } catch (err) {
    if (err instanceof QueueException) {
      logger.warn(
        { channel: err.channel.name, guild: err.channel.guild.name },
        err.message,
      );
    }
  }
});

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
  if (!doorbells[member.id]) {
    logger.trace({ user: member.user.tag }, "User is a bot.");
    return false;
  }

  return true;
}

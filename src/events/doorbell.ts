import { VoiceState } from "discord.js";
import { client } from "../discord";
import { getQueue } from "../queue";

const doorbells: { [k: string]: Instant } = {
  "517135926334324747": {
    url: "https://www.myinstants.com/media/sounds/eaburnea_u4ueT4r.mp3",
    title: "MIMA entrou na sala",
  },
  "109491752984907776": {
    url:
      "https://www.myinstants.com/media/sounds/whatsapp_audio_2017-10-30_at_15_07_57.mp3",
    title: "FELDS entrou na sala",
  },
  "338896627228213248": {
    url: "https://www.myinstants.com/media/sounds/oh-novinha_mixagem.mp3",
    title: "YURI entrou na sala",
  },
  "229722390437822464": {
    url: "https://www.myinstants.com/media/sounds/jamal.mp3",
    title: "JAMAL entrou na sala",
  },
  "692852659765641337": {
    url: "https://www.myinstants.com/media/sounds/manda_o_michael_manuel.mp3",
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
};

client.on(
  "voiceStateUpdate",
  async (oldState: VoiceState, newState: VoiceState) => {
    const voiceChannel = newState.channel;
    if (!voiceChannel) return; // not entering a voice channel

    const member = newState.member;
    if (!member || member.user.bot) return; // user is a bot

    // user is not joinin a new server
    if (oldState.channelID === newState.channelID) return; // not changing voice channels

    if (doorbells[member.id]) {
      try {
        const queue = await getQueue(voiceChannel);
        queue.play(doorbells[member.id]);
      } catch (err) {
        console.error("Error while ringing doorbell", err);
      }
    }
  }
);

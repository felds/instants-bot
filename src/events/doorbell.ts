import { VoiceState } from "discord.js";
import { client } from "../discord";
import { getQueue } from "../queue";

client.on(
  "voiceStateUpdate",
  async (oldState: VoiceState, newState: VoiceState) => {
    const voiceChannel = newState.channel;
    if (!voiceChannel) return;

    const member = newState.member;
    if (!member || member.user.bot) return;

    if (oldState.channelID === newState.channelID) return; // user is not joinin a new server

    const queue = await getQueue(voiceChannel);

    if (member.id === "517135926334324747") {
      queue.play({
        url: "https://www.myinstants.com/media/sounds/eaburnea_u4ueT4r.mp3",
        title: "MIMA entrou na sala",
      });
    }
    if (member.id === "109491752984907776") {
      queue.play({
        url: "https://www.myinstants.com/media/sounds/hellou.mp3",
        title: "FELDS entrou na sala",
      });
    }
    if (member.id === "338896627228213248") {
      queue.play({
        url: "https://www.myinstants.com/media/sounds/oh-novinha_mixagem.mp3",
        title: "YURI entrou na sala",
      });
    }
    if (member.id === "229722390437822464") {
      queue.play({
        url: "https://www.myinstants.com/media/sounds/jamal.mp3",
        title: "JAMAL entrou na sala",
      });
    }
    if (member.id === "692852659765641337") {
      queue.play({
        url:
          "https://www.myinstants.com/media/sounds/manda_o_michael_manuel.mp3",
        title: "MOTOSO entrou na sala",
      });
    }
    if (member.id === "172161615620341761") {
      queue.play({
        url: "https://www.myinstants.com/media/sounds/carrera_eh_verdade.mp3",
        title: "CARRERA entrou na sala",
      });
    }
  }
);

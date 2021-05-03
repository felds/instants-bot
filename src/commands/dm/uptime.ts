import { Command } from "../../util/command";

export const command: Command = {
  name: "uptime",
  aliases: ["-uptime"],
  description: "Quando foi que esse servidor subiu?",
  process: async (args, message) => {
    const since = new Date();
    since.setSeconds(since.getSeconds() - process.uptime());
    message.reply(`Eu estou de pé desde ${since}`);
  },
};

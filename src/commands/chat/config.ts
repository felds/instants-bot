import assert from "assert";
import { Command } from "../../util/command";
import { setGuildConfig } from "../../util/firebase";

export const command: Command = {
  name: "config",
  aliases: ["-config"],
  description: "Configura parâmetros do servidor",
  process: async (args, message) => {
    const guild = message.guild;
    assert(guild, "Você não está em um servidor.");

    const user = message.author;
    const isAdmin = guild.member(user)?.permissions.has("ADMINISTRATOR");
    assert(isAdmin, "Você tem que ser admin pra mudar uma configuração.");

    const [k, ...v] = args;
    const value = v.join(" ");
    assert(k, "Você não me falou que config você quer mudar.");
    assert(value, "Você não me falou o valor.");

    await setGuildConfig(guild.id, { [k]: value });

    message.reply(`Você configurou o parâmetro "${k}" para o valor "${value}"`);
  },
};

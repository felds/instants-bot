import { format } from "util";
import { client } from "../discord";
import { getUserConfig } from "../util/firebase";

client.on("message", async (msg) => {
  if (msg.channel.type !== "dm") return;
  if (msg.author.bot) return;

  const cleanContent = msg.cleanContent;
  const userId = msg.author.id;

  const userConfig = await getUserConfig(userId);

  msg.reply("reply: " + format(userConfig));
  msg.author.send("msg: " + format(userConfig));

  // msg.author.send(
  //   "Olha essa parada: (userId) " +
  //     format(cleanContent) +
  //     format(userId) +
  //     format(doorbells),
  // );
});

import { format } from "util";
import { client } from "../discord";
import { doorbells } from "../events/doorbell";

client.on("message", (msg) => {
  if (msg.channel.type !== "dm") return;

  const cleanContent = msg.cleanContent;
  const userId = msg.author.id;

  doorbells[userId] = {
    url: "https://www.myinstants.com/media/sounds/ps_1.mp3",
    title: "FELDS entrou na sala",
  };

  msg.author.send(
    "Olha essa parada: (userId) " +
      format(cleanContent) +
      format(userId) +
      format(doorbells),
  );
});

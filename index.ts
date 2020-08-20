import fs from "fs";

const EVENTS_FOLDER = "./src/events";
fs.readdir(EVENTS_FOLDER, (err, files) => {
  if (err) {
    console.log(`Failed at loading events.`, err);
    process.exit(1);
  }

  files.forEach(
    (event) =>
      event.endsWith(".ts") &&
      (console.log(`- Importing event ${event}`),
      import(`${EVENTS_FOLDER}/${event.slice(0, -3)}`))
  );
});

// client.on("message", async (message) => {
//   if (message.author.bot) return;

//   const cleanContent = message.cleanContent.trim();
//   if (!matchPrefix(cleanContent)) return;

//   // handle connections
//   let voiceChannel: VoiceChannel;
//   let queue: Queue;
//   try {
//     voiceChannel = getVoiceChannel(message);
//     queue = await getQueue(voiceChannel);
//   } catch (err) {
//     return message.reply(err.message);
//   }

//   const args = cleanContent.split(/\s+/).slice(1);
//   const handlers: ICommandHandler[] = [
//     // --------------------------
//     new CommandHandler.Help(args, message),
//     new CommandHandler.List(args, message, queue),
//     new CommandHandler.Skip(args, message, queue),
//     new CommandHandler.Stop(args, message, queue),
//     new CommandHandler.Search(args, message, queue),
//     // --------------------------
//   ];
//   for (const handler of handlers) {
//     if (await handler.accepts()) {
//       await handler.handle();
//       return;
//     }
//   }
// });

// function getVoiceChannel(message: Message): VoiceChannel {
//   const voiceChannel = message.member?.voice.channel;

//   if (!voiceChannel) {
//     throw new Error(
//       "você tem que estar conectado em um canal de voz para me usar (ui)."
//     );
//   }

//   return voiceChannel;
// }

// function matchPrefix(content: string): boolean {
//   const lowerContent = content.toLowerCase();
//   return (
//     lowerContent.startsWith(config.prefix + " ") ||
//     lowerContent === config.prefix
//   );
// }

// const CHECK_INTERVAL = 5_000;

// function disconnectWhenEmpty() {
//   const conns = client.voice?.connections;
//   if (!conns) return;

//   for (const [id, conn] of conns) {
//     const allBots = conn.channel.members.every((m) => m.user.bot);
//     if (allBots) {
//       conn.disconnect();
//     }
//   }
// }
// client.setInterval(disconnectWhenEmpty, CHECK_INTERVAL);

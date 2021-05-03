/**
 * Disconnects from the voice channel when there`s no users left.
 */
import { VoiceState } from "discord.js";
import { client } from "../discord";
import { logger } from "../logging";

client.on("voiceStateUpdate", (oldState: VoiceState, newState: VoiceState) => {
  const leavingChannel = oldState.channel;
  if (!leavingChannel) return;

  // state change doesn't have a member or it's a bot
  const member = oldState.member;
  if (!member || member.user.bot) return;

  // user is not leaving a server
  if (oldState.channelID === newState.channelID) return;

  const connection = client.voice?.connections.find((c) =>
    c.channel.equals(leavingChannel),
  );
  if (!connection) return;

  const members = leavingChannel.members;
  if (members.every((m) => m.user.bot)) {
    logger.info(
      { guild: leavingChannel.guild.name, channel: oldState.channel?.name },
      "I was left alone in the channel. Disconnecting.",
    );
    connection.disconnect();
  }
});

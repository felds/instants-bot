import { client } from "../discord";

client.on("voiceStateUpdate", (oldState, newState) => {
  const hasConnectedToNewChannel =
    oldState.channelID !== newState.channelID && newState.channel;

  if (!hasConnectedToNewChannel || newState.member?.user !== client.user) {
    return;
  }

  newState.setSelfDeaf(true);
});

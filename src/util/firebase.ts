import { Snowflake } from "discord.js";
import * as admin from "firebase-admin";

admin.initializeApp();
const fs = admin.firestore();

export type UserConfig = {
  doorbell?: string;
};

export async function getUserConfig(userId: Snowflake): Promise<UserConfig> {
  const doc = await fs.doc(`UserConfig/${userId}`).get();
  return doc.data() || {};
}

export async function setUserConfig(
  userId: Snowflake,
  config: object,
): Promise<UserConfig> {
  const docId = `UserConfig/${userId}`;
  await fs.doc(docId).set(config, { merge: true });
  const doc = await fs.doc(docId).get();
  return doc.data() || {};
}

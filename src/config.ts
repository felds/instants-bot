export default {
  PREFIX: process.env.COMMAND_PREFIX,
  TOKEN: process.env.TOKEN,
  DEBUG: process.env.DEBUG ?? false,
  TENOR_KEY: process.env.TENOR_KEY,
  ENV: process.env.ENV as string | undefined | "gcp",
};

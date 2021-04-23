/// <reference path="./src/types.d.ts" />

async function main() {
  await Promise.all([
    // load modules
    // import("./src/dm"),
    import("./src/events"),
  ]);
}
main().catch((err) => `Oops! Something went wrong...\n\n${err}`);

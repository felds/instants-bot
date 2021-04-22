/// <reference path="./src/types.d.ts" />

async function main() {
  // await loadAppConfig();

  await Promise.all([
    // load modules
    import("./src/dm"),
    import("./src/events"),
  ]);

  console.log("Hora do show, porra!");
}
main().catch((err) => `Oops! Something went wrong...\n\n${err}`);

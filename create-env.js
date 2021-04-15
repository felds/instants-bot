const admin = require("firebase-admin");
const { writeFileSync, existsSync } = require("fs");

admin.initializeApp();

const fs = admin.firestore();
fs.doc(`AppConfig/env`)
  .get()
  .then((doc) => {
    writeEnv(doc.data());
  })
  .catch((err) => {
    console.error("Couldn't create .env file.", err);
    process.exit(1);
  });

function writeEnv(obj) {
  const filename = ".env.json";
  const forced =
    process.argv.includes("-f") || process.argv.includes("--force");

  if (existsSync(filename) && !forced) {
    console.error(`${filename} file already exists. use "-- -f" to override.`);
    process.exit(1);
  }

  writeFileSync(filename, JSON.stringify(obj, null, 2));
  console.log(`Create env file: ${filename}`);
}

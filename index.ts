import { join } from "path";
import { importDir } from "./src/util";
import { loadAppConfig } from "./src/util/firebase";

async function main() {
  await loadAppConfig();
  importDir(join(__dirname, "./src/events"));
}
main().catch((err) => `Oops! Something went wrong...\n\n${err}`);

// import http from "http";
// import { join } from "path";
// import "./src/dm";
// import { importDir } from "./src/util";

// // server
// const server = http.createServer((req, res) => {
//   res.setHeader("Content-type", "text/plain; charset=utf-8");
//   res.write(util.format("\n\nENV: %O", process.env));
//   res.end();
// });

// server.listen(process.env.PORT, () => {
//   console.log(`Listening on port ${process.env.PORT}`);
// });

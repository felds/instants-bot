import http from "http";
import { join } from "path";
import util from "util";
import { importDir } from "./src/util";
import { loadAppConfig } from "./src/util/firebase";

async function main() {
  await loadAppConfig();
  importDir(join(__dirname, "./src/events"));

  // server
  const port = process.env.PORT ?? 3000;
  const server = http.createServer((req, res) => {
    res.setHeader("Content-type", "text/plain; charset=utf-8");
    res.write(util.format("\n\nENV: %O", process.env));
    res.end();
  });
  server.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
main().catch((err) => `Oops! Something went wrong...\n\n${err}`);

// import http from "http";
// import { join } from "path";
// import "./src/dm";
// import { importDir } from "./src/util";

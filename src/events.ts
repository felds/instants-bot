import { join } from "path";
import { importDir } from "./util/fs";

importDir(join(__dirname, "./events/"));

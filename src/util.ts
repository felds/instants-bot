import fs from "fs";

export async function importDir<T>(path: string): Promise<T[]> {
  return new Promise((resolve) => {
    fs.readdir(path, (err, files) => {
      if (err) throw err;

      resolve(
        Promise.all(
          files.map((file) => import(`${path}/${file.slice(0, -3)}`)),
        ),
      );
    });
  });
}

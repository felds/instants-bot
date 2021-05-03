import fs from "fs";

export async function importDir<T>(path: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) throw err;

      Promise.all(files.map((file) => import(`${path}/${file.slice(0, -3)}`)))
        .then(resolve)
        .catch(reject);
    });
  });
}

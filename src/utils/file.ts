import { app } from "electron";
import path from "path";
import fs from "fs";
import { logJson } from "./logger";

export function getConfigPath(fileName: string) {
  const isDev = !app.isPackaged;
  return isDev
    ? path.resolve(__dirname, `../${fileName}`)
    : path.join(app.getPath("userData"), fileName);
}

export async function writeFile(fileName: string, data: any): Promise<void> {
  const configPath = getConfigPath(fileName);

  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await fs.promises.writeFile(configPath, data, "utf-8").catch((e) => {
    logJson({ fn: "writeFile", level: "error", msg: e });
    return {};
  });
}

export async function readFile(fileName: string): Promise<string> {
  const configPath = getConfigPath(fileName);
  return await fs.promises.readFile(configPath, "utf-8").catch((e) => {
    logJson({ fn: "readFile", level: "error", msg: e });
    return "";
  });
}

// export async function writeJsonFile(
//   fileName: string,
//   data: any
// ): Promise<void> {
//   return writeFile(fileName, JSON.stringify(data, null, 2));
// }

// export async function readJsonFile<T>(
//   fileName: string,
//   fallback: T
// ): Promise<T> {
//   try {
//     const content = await readFile(fileName);
//     return JSON.parse(content) as T;
//   } catch (err) {
//     return fallback;
//   }
// }

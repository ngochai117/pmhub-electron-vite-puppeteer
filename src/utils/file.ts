import { app } from "electron";
import fs from "node:fs";
import { logJson } from "./logger";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getArgValue(flag: string): string | undefined {
  const arg = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  return arg?.split("=")[1];
}

export function getConfigPath(fileName: string) {
  const isDev = !app.isPackaged;
  const devDir = path.join(__dirname, "..", "cache");

  return isDev
    ? path.join(devDir, fileName)
    : path.join(app.getPath("userData"), fileName);
}

export function writeFile(fileName: string, data: any) {
  const configPath = getConfigPath(fileName);

  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    fs.writeFileSync(configPath, data, "utf-8");
  } catch (e) {
    logJson({ fn: "writeFile", level: "error", msg: e });
  }
}

export async function readFile(fileName: string): Promise<string> {
  const configPath = getConfigPath(fileName);
  return fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf8") : "";
  // return await fs.promises.readFile(configPath, "utf-8").catch((e) => {
  //   logJson({ fn: "readFile", level: "error", msg: e });
  //   return "";
  // });
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

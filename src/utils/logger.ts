export function logJson(
  obj: Record<string, any> & {
    level?: "info" | "success" | "error" | string;
    fn?: string;
    action?: string;
    msg?: any;
  }
) {
  const { level = "debug", ...rest } = obj;
  const message = JSON.stringify(rest, null, 2);
  if (level === "info") {
    console.info("ℹ️", message);
  } else if (level === "success") {
    console.info("✅", message);
  } else if (level === "error") {
    console.error("❌", message);
  } else {
    console.debug("🔍", message);
  }
  // Ghi vào file
  // appendLogFile(`[${level.toUpperCase()}] ${message}`);
}

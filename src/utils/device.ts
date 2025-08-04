import { machineIdSync } from "node-machine-id";
import macaddress from "macaddress";
import si from "systeminformation";
import { createHash } from "crypto";
import os from "os";
import { logJson } from "./logger";

export async function getDeviceId(): Promise<string> {
  const mac = await macaddress.one();
  const cpu = await si.cpu();
  const cpuHash = cpu.vendor + cpu.brand + cpu.family + cpu.model;
  const base = machineIdSync() + mac + cpuHash;
  const deviceId = createHash("sha256").update(base).digest("hex");
  logJson({ fn: "getDeviceId", deviceId });
  // return deviceId;
  return "device-id-test-4";
}

export function isLikelyVirtualMachine(): boolean {
  const hostname = os.hostname().toLowerCase();
  return (
    hostname.includes("vm") ||
    hostname.includes("virtual") ||
    hostname.includes("sandbox")
  );
}

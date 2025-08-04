import packageData from "../../package.json";

import { LicenseResponseFE } from "../types/license";
import { callApiBase, PATH } from "./base";
import { METHOD } from "../types/api";

export async function sendLogToServer(body: any) {
  const version = packageData?.version;
  const res = await callApiBase<LicenseResponseFE>({
    method: METHOD.POST,
    path: PATH.LOG,
    body: { ...body, appVersion: version },
  });
  return res;
}

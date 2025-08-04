import { getDeviceId } from "../utils/device";
import { LicenseResponseFE, RequestActiveLicenseFE } from "../types/license";
import { callApiBase, PATH } from "./base";
import { METHOD } from "../types/api";

export async function getLicenseInfoViaServer() {
  const deviceId = await getDeviceId();
  const res = await callApiBase<LicenseResponseFE>({
    method: METHOD.POST,
    path: PATH.LICENSE_INFO,
    body: { deviceId },
  });
  return res.response?.data;
}

export async function activateTrial() {
  const deviceId = await getDeviceId();
  const res = await callApiBase<LicenseResponseFE>({
    method: METHOD.POST,
    path: PATH.ACTIVATE,
    body: { deviceId } as RequestActiveLicenseFE,
  });
  return res;
}

export async function activateKey(key: string) {
  const deviceId = await getDeviceId();
  const res = await callApiBase<LicenseResponseFE>({
    method: METHOD.POST,
    path: PATH.ACTIVATE,
    body: { deviceId, key } as RequestActiveLicenseFE,
  });
  return res;
}

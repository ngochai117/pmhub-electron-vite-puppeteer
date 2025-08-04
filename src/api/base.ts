import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { logJson } from "../utils/logger";
import qs from "querystring";
import { CallApiBaseConfig, CallApiBaseResponse, METHOD } from "../types/api";
import { decryptJSON, encryptData, encryptJson } from "../utils/encrypts";

export const DOMAIN = "http://localhost:8080";
// export const DOMAIN =
//   "https://pmhub-server-267683729174.asia-southeast1.run.app";

export const PATH = {
  LICENSE_INFO: "/license-info",
  ACTIVATE: "/activate",
  LOG: "/log",
};

export const STATUS_CODE = {
  BAD_REQUEST: 400,
  SUCCESS: 200,
};

export async function callApiBase<T = any>(
  config: CallApiBaseConfig
): Promise<CallApiBaseResponse<T>> {
  const {
    method = METHOD.GET,
    path,
    body: _body = {},
    headers = {},
    options,
  } = config;
  const { encrypt = true } = options || {};

  let url = `${DOMAIN}${path}`;

  const isGet = method.toUpperCase() === METHOD.GET.toUpperCase();

  const body = { ..._body, clientTime: Date.now() };

  if (isGet && Object.keys(body).length > 0) {
    const queryString = encryptData(qs.stringify(body));
    url += url.includes("?") ? `&${queryString}` : `?${queryString}`;
  }

  const contentTye = encrypt ? "text/plain" : "application/json";

  const axiosConfig: AxiosRequestConfig = {
    method,
    url,
    headers: {
      "Content-Type": contentTye,
      Accept: "application/json, text/plain, */*",
      ...headers,
    },
    ...(isGet ? {} : { data: encryptJson(body) }),
    timeout: 10000,
  };

  logJson({ fn: "callApiBase", url, options: axiosConfig, data: body });

  try {
    const res: AxiosResponse = await axios(axiosConfig);
    const status = res?.status;
    const response = decryptJSON(res.data);
    logJson({
      level: "success",
      msg: `API success ${status}`,
      response,
    });

    return { status, success: isApiSuccess({ status } as any), response };
  } catch (error: any) {
    const res = error?.response;
    const status = res?.status || 500;
    const code = res?.code || "";
    logJson({
      fn: "callApiBase",
      action: "response",
      plainText: res.data,
    });
    const response = decryptJSON(res?.data);
    const msg = response?.msg || error.message;

    logJson({
      level: "error",
      msg: `API Error ${status} : ${code}`,
      error: msg,
    });

    return { status, success: false, response: { ...response, msg } };
  }
}

function isApiSuccess(response: CallApiBaseResponse): boolean {
  return response?.status >= 200 && response?.status < 300;
}

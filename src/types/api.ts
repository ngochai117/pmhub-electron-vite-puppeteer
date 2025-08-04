export const METHOD = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
} as const;

type HttpMethod = keyof typeof METHOD;
export type ApiHeader = Record<string, string | boolean>;

export interface CallApiBaseConfig {
  method?: HttpMethod;
  path: string;
  body?: Record<string, any>;
  headers?: Record<string, string | boolean>;
  options?: { encrypt?: boolean };
}

export interface CallApiBaseResponse<T = any> {
  status: number;
  success: boolean;
  response: {
    msg?: string;
    data?: T;
    serverTime?: number;
  };
}

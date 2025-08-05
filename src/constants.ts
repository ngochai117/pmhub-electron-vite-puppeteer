const DOMAIN = "https://pmhub.mservice.com.vn";
// export const DOMAIN_API = "http://localhost:8080";
export const DOMAIN_API =
  "https://pmhub-server-267683729174.asia-southeast1.run.app";

export const FILE_NAMES = {
  USER_DATA: "file-u.txt",
  CACHE_BROWSER: "cache-browser",
};

export const PATHS = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
};

export const URLS = {
  LOGIN: DOMAIN + PATHS.LOGIN,
  DASHBOARD: DOMAIN,
};

export const ELEMENTS = {
  INPUT_USERNAME: 'input[name="username"]',
  INPUT_PASSWORD: 'input[name="password"]',
  BUTTON_LOGIN: 'button[type="submit"]',
};

export const ELECTRON_EVENTS = {
  LOGIN: "LOGIN",
  GET_USER_DATA: "GET_USER_DATA",
  GET_LICENSE: "GET_LICENSE",
  SHOW_ERROR_MODAL: "SHOW_ERROR_MODAL",
  ACTIVATE_LICENSE: "ACTIVATE_LICENSE",
  SWITCH_THEME: "SWITCH_THEME",
};

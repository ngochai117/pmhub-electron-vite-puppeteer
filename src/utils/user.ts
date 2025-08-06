import { FILE_NAMES } from "../constants";
import { LicenseResponseFE } from "../types/license";
import { UserData } from "../types/user";
import { getNumber } from "./data";
import { decryptJSON } from "./encrypts";
import { readFile } from "./file";

export const getUserData = async () => {
  return decryptJSON<UserData>(await readFile(FILE_NAMES.USER_DATA));
};

export const checkUserDataValid = (userData?: UserData) => {
  return (
    userData?.username &&
    userData?.password &&
    getNumber(userData?.projects?.length) > 0
  );
};

export const checkLicenseValid = (license?: LicenseResponseFE) => {
  return !!license?.valid;
};

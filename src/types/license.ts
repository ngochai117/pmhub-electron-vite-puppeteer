export enum LicenseType {
  NEW = "NEW",
  TRIAL = "TRIAL",
  ULTIMATE = "ULTIMATE",
  LIMIT = "LIMIT",
}

interface License {
  key: string;
  type: LicenseType;
  deviceId?: string;
  expiredAt?: Date;
  createdAt: Date;
  durationMilliseconds?: number;
}

export interface RequestFromFE {
  clientTime: number;
}

export interface RequestLicenseInfoFE extends RequestFromFE {
  deviceId: string;
}
export interface RequestActiveLicenseFE extends RequestFromFE {
  key?: string; // don't have key => activate trial
  deviceId: string;
}

export interface LicenseResponseFE
  extends Omit<License, "createdAt" | "expiredAt"> {
  expiredAt?: Date;
  createdAt: Date;
  activatedAt?: Date;
  isExpired?: boolean;
  valid: boolean;
  remainingTime?: number; // milliseconds
}

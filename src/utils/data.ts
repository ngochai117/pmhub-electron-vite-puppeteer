export const getNumber = (value: any, defaultValue = 0) => {
  try {
    if (typeof value === "number") {
      return value;
    }
    if (!value) {
      return defaultValue;
    }
    const valueParse = Number(value);
    return Number.isNaN(valueParse) ? defaultValue : valueParse;
  } catch {
    return defaultValue;
  }
};

import { Direction } from "enums/Direction";

export const isNullOrUndefined = (value: any) => {
  return value === null || value === undefined;
};

export const generateId = (): number => {
  return Math.floor(Math.random() * 10000000);
};

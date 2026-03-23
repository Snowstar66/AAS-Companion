import { readEnv } from "@aas-companion/config";

export function getAppEnv() {
  return readEnv(process.env);
}

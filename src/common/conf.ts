// noinspection SpellCheckingInspection

import { ConfigService } from "@nestjs/config";


export function getKeySecret(c: ConfigService): string {
  return c.get("SECRET_KEY");
}

export function getNetWork(c: ConfigService): "mainnet" | "testnet" | "devnet" | "localnet" {
  return c.get("NETWORK");
}

export function getAppName(c: ConfigService): string {
  return c.get("APP_NAME");
}

export function getSenderAddress(c: ConfigService): string {
  return c.get("SENDER_ADDRESS");
}

export function getEndpointUrl(c: ConfigService): string {
  return c.get("ENDPOINT_URL");
}

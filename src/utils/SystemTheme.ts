import { AndroidTheme } from "../types";

export const SystemTheme = {
  getSystemTheme(): AndroidTheme | undefined {
    const json = window.HybridInterface?.getSystemTheme();
    if (json)
      return JSON.parse(json)
  }
}
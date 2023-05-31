import { AndroidTheme } from "src/types";

export const SystemTheme = {
  getSystemTheme(): AndroidTheme | undefined {
    const json = window.HybridInterface?.getSystemTheme();
    if (json)
      return JSON.parse(json)
  }
}
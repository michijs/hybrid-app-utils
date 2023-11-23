import { Capacitor } from "@capacitor/core";
import { Options } from "./types";
export * from "./utils";

export function setupHybrid(options?: Options) {
  if (Capacitor.isNativePlatform()) {
    if (!options?.statusBarAdapter?.disabled)
      import("./adapters/statusBarAdapter");
    if (!options?.backButtonAdapter?.disabled)
      import("./adapters/backButtonAdapter");
    if (!options?.padNavigationAdapter?.disabled)
      import("./adapters/padNavigationAdapter");
  }
}

import { App } from "@capacitor/app";

App.addListener("backButton", ({ canGoBack }) => {
  if (canGoBack && (window.location.hash || window.location.pathname !== "/"))
    window.history.back();
  else App.exitApp();
});

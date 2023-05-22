import { StatusBar } from "@capacitor/status-bar";
const themeColorMetaTag = document.querySelector<HTMLMetaElement>(
  `meta[name=theme-color]`,
);
if (themeColorMetaTag) {
  StatusBar.setBackgroundColor({
    color: themeColorMetaTag?.content,
  });
  const observer = new MutationObserver(() => {
    StatusBar.setBackgroundColor({
      color: themeColorMetaTag?.content,
    });
  });

  observer.observe(themeColorMetaTag, {
    attributeFilter: ["content"],
  });
}

import { HybridNavigator, HybridShareData } from "../types";

export const share = async (shareData?: ShareData) =>
  new Promise<void>(async (resolve, reject) => {
    if (!shareData) reject("No known share data fields supplied");
    else if (window.HybridInterface) {
      window.HybridInterface.onShareHasResult = (result) => {
        if (result) resolve();
        else {
          reject("The user aborted a request.");
        }
      };
      const hibridShareData: HybridShareData = {
        ...shareData,
        files: await Promise.all(
          (shareData.files ?? []).map(async (x) => ({
            text: await x.text(),
            name: x.name,
          })),
        ),
      };
      window.HybridInterface?.share(JSON.stringify(hibridShareData));
    } else reject("Share not supported");
  });

export const hybridNavigator: HybridNavigator = {
  share: (data) => {
    if (navigator.share) return navigator.share(data);
    else return share(data);
  },
  canShare: (data) => {
    if (navigator.canShare) return navigator.canShare(data);
    else return !!window.HybridInterface?.share;
  },
};

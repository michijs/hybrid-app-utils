import { HybridShareData } from "../types"

export const share = async (shareData: ShareData) => new Promise<void>(async (resolve, reject) => {
  if (window.HybridInterface)
    window.HybridInterface.onShareHasResult = (result) => {
      if (result)
        resolve()
      else {
        reject("The user aborted a request.");
      }
    }
  const hibridShareData: HybridShareData = {
    ...shareData,
    files: await Promise.all((shareData.files ?? []).map(async x => ({
      text: await x.text(),
      name: x.name
    })))
  }
  window.HybridInterface?.share(JSON.stringify(hibridShareData))
})

export const hybridNavigator = {
  share: (data) => {
    navigator.share ?? share
  }
}
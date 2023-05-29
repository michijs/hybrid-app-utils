import { LaunchParamsCallback, LaunchQueue } from "../types";
import { FakeFileSystemFileHandle } from "./FakeFileSystemFileHandle";

const consumers = new Array<LaunchParamsCallback>();

export const createHybridFileSystemFileHandle = (newFileContent: string, newFileName: string, newFileType: string) =>
  new FakeFileSystemFileHandle(new File([newFileContent], newFileName, { type: `${newFileType};charset=utf-8` }), async (file) => {
    const text = await file.text()
    window.HybridInterface?.saveOpenedFile(text)
  })


export const getOpenedFileHandle = () => {
  if (window.HybridInterface) {
    const newFileContent = window.HybridInterface.getOpenedFileContent();
    const newFileName = window.HybridInterface.getOpenedFileName();
    const newFileType = window.HybridInterface.getOpenedFileType();
    return createHybridFileSystemFileHandle(newFileContent, newFileName, newFileType)
  }
}

const notifyCostumers = () => {
  const openedFileHandle = getOpenedFileHandle();
  if (openedFileHandle)
    consumers.forEach(x => x({
      files: [openedFileHandle],
    }))
}
export const HybridLaunchQueue: LaunchQueue = {
  ...(window.launchQueue ?? {}),
  setConsumer(callback) {
    consumers.push(callback)
    window.launchQueue?.setConsumer(callback);
    const openedFileHandle = getOpenedFileHandle();
    if (openedFileHandle)
      callback({
        files: [openedFileHandle],
      })
  }
}

if (window.HybridInterface)
  window.HybridInterface.onNewOpenFileOpened = notifyCostumers
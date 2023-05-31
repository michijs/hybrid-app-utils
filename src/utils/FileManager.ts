import { FakeFileSystemFileHandle } from "./FakeFileSystemFileHandle";
import { getOpenedFileHandle } from "./HybridLaunchQueue";

export abstract class FileManager {
  static download(file: File) {
    const recordURL = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.setAttribute("download", file.name);
    link.href = recordURL;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  static supportsBrowserSaveFilePicker = Boolean(window.showSaveFilePicker)

  static showSaveFilePicker(
    options: Parameters<typeof window.showSaveFilePicker>[0],
  ): Promise<FileSystemFileHandle> {
    if (FileManager.supportsBrowserSaveFilePicker) return window.showSaveFilePicker(options);
    else {
      return new Promise<FileSystemFileHandle>((resolve, reject) => {
        const type: string = Object.keys(options?.types?.[0].accept ?? [])[0];
        if (window.HybridInterface) {
          window.HybridInterface.onShowSaveFilePickerHasResult = (result) => {
            const openedFile = getOpenedFileHandle();
            if (result && openedFile)
              resolve(
                openedFile
              )
            else
              reject("The user aborted a request.");
          }
          window.HybridInterface?.showSaveFilePicker(options?.suggestedName ?? '', type ?? "*/*")
        } else {
          const response = window.prompt("File name", options?.suggestedName);
          if (response)
            resolve(
              new FakeFileSystemFileHandle(
                new File([""], response, { type: `${type};charset=utf-8` }),
                this.download
              )
            );
          reject("The user aborted a request.");
        }
      });
    }
  }

  static showOpenFilePicker(
    options: Parameters<typeof window.showOpenFilePicker>[0],
  ): Promise<FileSystemFileHandle[]> {
    if (window.showOpenFilePicker) return window.showOpenFilePicker(options);
    else {
      return new Promise((resolve, reject) => {
        if (window.HybridInterface) {
          const allAccept = options?.types?.map((x) => Object.keys(x.accept)).flat();
          window.HybridInterface.onShowOpenFilePickerHasResult = (result) => {
            const openedFile = getOpenedFileHandle();
            if (result && openedFile)
              resolve(
                [openedFile]
              )
            else
              reject("The user aborted a request.");
          }
          window.HybridInterface?.showOpenFilePicker(allAccept?.join('|') ?? "*/*")
        } else {
          const allAccept = options?.types?.map((x) => {
            return Object.entries(x.accept).map(([key, value]) => {
              return Array.isArray(value) && value.length > 0
                ? value
                : key;
            });
          }).flat(2)
          const el = document.createElement("input") as HTMLInputElement;
          el.setAttribute("type", "file");
          if (allAccept)
            el.setAttribute("accept", allAccept.join(","));
          if (options?.multiple) el.multiple = options?.multiple;
          // TODO: Handle reject
          el.onchange = () => {
            if (el?.files)
              resolve(
                Array.from(el.files).map((x) => new FakeFileSystemFileHandle(x, this.download)),
              );
          };
          el.click();
        }
      });
    }
  }
}

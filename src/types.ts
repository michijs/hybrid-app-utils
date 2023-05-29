
export interface Options {
  statusBarAdapter?: {
    disabled?: boolean
  },
  backButtonAdapter?: {
    disabled?: boolean
  },
  padNavigationAdapter?: {
    disabled?: boolean
  }
}

export type OnCloseWriterCallback = (fileContent: string) => void;
export type OnFileChangeCallback = (file: File) => void;

export interface LaunchParams {
  targetURL?: string,
  files: FileSystemFileHandle[]
}

export type LaunchParamsCallback = (launchParams: LaunchParams) => void;

export interface LaunchQueue {
  setConsumer(launchParamsCallback: LaunchParamsCallback): void
}

declare global {

  interface Window {
    HybridInterface?: {

      showOpenFilePicker(suggestedType: string): void;
      showSaveFilePicker(suggestedName: string, suggestedType: string): void;
      /**
       * Saves opened by OS file changes
       */
      saveOpenedFile(content: string): void;
      getOpenedFileContent(): string;
      getOpenedFileType(): string;
      getOpenedFileName(): string;
      getShowSaveFilePickerResult(): boolean;
      onShowSaveFilePickerHasResult(fileName?: string, fileType?: string): void
      onShowOpenFilePickerHasResult(fileContent?: string, fileName?: string, fileType?: string): void
      onNewOpenFileOpened(): void
    }
    launchQueue?: LaunchQueue
  }
}


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

interface HybridFile {
  name: string,
  text: string
}

export interface HybridShareData extends Omit<ShareData, 'files'> {
  files: HybridFile[]
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
      onShowSaveFilePickerHasResult(result: boolean): void
      onShowOpenFilePickerHasResult(result: boolean): void
      onShareHasResult(result: boolean): void
      onNewOpenFileOpened(): void
      share(shareData: string): void
    }
    launchQueue?: LaunchQueue
  }
}

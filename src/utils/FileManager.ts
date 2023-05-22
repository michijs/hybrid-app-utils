type OnCreateFileCallback = (file: File) => void;

export class FakeWritable implements FileSystemWritableFileStream {
  private writableResult = "";
  private fileName: string;
  private onCreateFileCallback: OnCreateFileCallback;

  constructor(fileName: string, onCreateFileCallback: OnCreateFileCallback) {
    this.fileName = fileName;
    this.onCreateFileCallback = onCreateFileCallback;
  }
  seek(_position: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  truncate(_size: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  locked: boolean;
  abort(_reason?: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getWriter(): WritableStreamDefaultWriter<any> {
    throw new Error("Method not implemented.");
  }

  async write(chunk: string) {
    this.writableResult += chunk;
  }
  async close() {
    const newFile = new File([this.writableResult], this.fileName, {
      type: "text/plain;charset=utf-8",
    });
    const link = document.createElement("a");
    link.setAttribute("download", this.fileName);
    link.href = URL.createObjectURL(newFile);
    link.click();
    URL.revokeObjectURL(link.href);
    this.onCreateFileCallback(newFile);
  }
}

function fileSystemHandleIsFileSystemFileHandle(fileSystemHandle: FileSystemHandle): fileSystemHandle is FileSystemFileHandle {
  return fileSystemHandle.kind === 'file'
}

export class FakeFileSystemFileHandle implements FileSystemFileHandle {
  private file: File;

  constructor(file: File) {
    this.file = file;
    this.name = file.name;
  }
  kind: "file";
  isFile: true;
  isDirectory: false;
  name: string;

  async isSameEntry(other: FileSystemHandle): Promise<boolean> {
    if (fileSystemHandleIsFileSystemFileHandle(other)) {
      const otherFile = await other.getFile()
      return this.file === otherFile;
    }
    return false;
  }
  async queryPermission(
    _descriptor?: FileSystemHandlePermissionDescriptor | undefined,
  ): Promise<PermissionState> {
    return "granted";
  }
  async requestPermission(
    _descriptor?: FileSystemHandlePermissionDescriptor | undefined,
  ): Promise<PermissionState> {
    throw "granted";
  }
  async getFile() {
    return this.file;
  }
  async createWritable(_options: FileSystemCreateWritableOptions) {
    return new FakeWritable(this.file.name, (newFile) => (this.file = newFile));
  }
}

export abstract class FileManager {
  static download(file: File) {
    const recordURL = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.setAttribute("download", file.name);
    link.href = recordURL;
    link.click();
  }

  static supportsNativeShowSaveFilePicker = Boolean(window.showSaveFilePicker)

  static showSaveFilePicker(
    options: Parameters<typeof window.showSaveFilePicker>[0],
  ): Promise<FileSystemFileHandle> {
    if (FileManager.supportsNativeShowSaveFilePicker) return window.showSaveFilePicker(options);
    else {
      return new Promise<FileSystemFileHandle>((resolve, reject) => {
        const response = window.prompt("File name", options?.suggestedName);
        if (response)
          resolve(
            new FakeFileSystemFileHandle(
              new File([""], response, { type: "text/plain;charset=utf-8" }),
            ),
          );
        reject("The user aborted a request.");
      });
    }
  }

  static showOpenFilePicker(
    options: Parameters<typeof window.showOpenFilePicker>[0],
  ): Promise<FileSystemFileHandle[]> {
    if (window.showOpenFilePicker) return window.showOpenFilePicker(options);
    else {
      return new Promise((resolve) => {
        const el = document.createElement("input") as HTMLInputElement;
        el.setAttribute("type", "file");
        if (options?.types) {
          const allAccept = options.types
            .map((x) => {
              return Object.entries(x.accept).map(([key, value]) => {
                return Array.isArray(value) && value.length > 0
                  ? value.join(",")
                  : key;
              });
            })
            .join(",");
          el.setAttribute("accept", allAccept);
        }
        if (options?.multiple) el.multiple = options?.multiple;
        el.onchange = () => {
          if (el?.files)
            resolve(
              Array.from(el.files).map((x) => new FakeFileSystemFileHandle(x)),
            );
        };
        el.click();
      });
    }
  }
}

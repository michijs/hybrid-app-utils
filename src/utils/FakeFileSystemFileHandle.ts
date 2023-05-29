import { fileSystemHandleIsFileSystemFileHandle } from "../typeWards/fileSystemHandleIsFileSystemFileHandle";
import { OnFileChangeCallback } from "../types";
import { FakeWritable } from "./FakeWritable";

export class FakeFileSystemFileHandle implements FileSystemFileHandle {
  private file: File;
  private onFileChange: OnFileChangeCallback;

  constructor(file: File, onFileChange: OnFileChangeCallback) {
    this.file = file;
    this.onFileChange = onFileChange;
  }
  kind: "file";
  isFile: true;
  isDirectory: false;
  get name() {
    return this.file.name;
  }

  async isSameEntry(other: FileSystemHandle): Promise<boolean> {
    if (fileSystemHandleIsFileSystemFileHandle(other)) {
      const otherFile = await other.getFile();
      return this.file === otherFile;
    }
    return false;
  }
  async queryPermission(
    _descriptor?: FileSystemHandlePermissionDescriptor | undefined
  ): Promise<PermissionState> {
    return "granted";
  }
  async requestPermission(
    _descriptor?: FileSystemHandlePermissionDescriptor | undefined
  ): Promise<PermissionState> {
    throw "granted";
  }
  async getFile() {
    return this.file;
  }
  async createWritable(_options: FileSystemCreateWritableOptions) {
    return new FakeWritable((fileContent: string) => {
      const newFile = new File([fileContent], this.file.name, {
        type: this.file.type,
      });
      this.file = newFile;
      this.onFileChange(newFile)
    });
  }
}

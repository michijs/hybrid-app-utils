import { OnCloseWriterCallback } from "../types";


export class FakeWritable implements FileSystemWritableFileStream {
  private writableResult = "";
  private onCloseWriter: OnCloseWriterCallback;

  constructor(onCloseWriter: OnCloseWriterCallback) {
    this.onCloseWriter = onCloseWriter;
  }
  seek(_position: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  truncate(_size: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  locked: boolean = false;
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
    this.onCloseWriter(this.writableResult);
  }
}

export function fileSystemHandleIsFileSystemFileHandle(
  fileSystemHandle: FileSystemHandle,
): fileSystemHandle is FileSystemFileHandle {
  return fileSystemHandle.kind === "file";
}

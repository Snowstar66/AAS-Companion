import type { ControlMirrorUploadedSnapshotFileInput } from "@aas-companion/domain";

export const CONTROL_MIRROR_UPLOADED_SNAPSHOT_MAX_FILES = 48;
export const CONTROL_MIRROR_UPLOADED_SNAPSHOT_MAX_FILE_BYTES = 1024 * 1024;

export type ControlMirrorUploadedSnapshotAdapterResult = {
  files: ControlMirrorUploadedSnapshotFileInput[];
  rejectedBeforeProcessing: Array<{
    path: string;
    reason: "empty_file" | "too_large";
  }>;
};

function getExplicitUploadPath(file: File) {
  const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath;

  return relativePath?.trim() || file.name;
}

async function readFileText(file: File) {
  if (typeof file.text === "function") {
    return file.text();
  }

  if (typeof file.arrayBuffer === "function") {
    const buffer = await file.arrayBuffer();
    return new TextDecoder().decode(buffer);
  }

  return new Response(file).text();
}

export async function prepareControlMirrorUploadedSnapshotFiles(files: File[]): Promise<ControlMirrorUploadedSnapshotAdapterResult> {
  const preparedFiles: ControlMirrorUploadedSnapshotFileInput[] = [];
  const rejectedBeforeProcessing: ControlMirrorUploadedSnapshotAdapterResult["rejectedBeforeProcessing"] = [];

  for (const file of files.slice(0, CONTROL_MIRROR_UPLOADED_SNAPSHOT_MAX_FILES)) {
    const path = getExplicitUploadPath(file);

    if (file.size <= 0) {
      rejectedBeforeProcessing.push({
        path,
        reason: "empty_file"
      });
      continue;
    }

    if (file.size > CONTROL_MIRROR_UPLOADED_SNAPSHOT_MAX_FILE_BYTES) {
      rejectedBeforeProcessing.push({
        path,
        reason: "too_large"
      });
      continue;
    }

    try {
      preparedFiles.push({
        path,
        content: await readFileText(file),
        sizeBytes: file.size,
        lastModifiedAt: file.lastModified ? new Date(file.lastModified) : null
      });
    } catch {
      preparedFiles.push({
        path,
        content: null,
        sizeBytes: file.size,
        lastModifiedAt: file.lastModified ? new Date(file.lastModified) : null
      });
    }
  }

  return {
    files: preparedFiles,
    rejectedBeforeProcessing
  };
}

export async function prepareControlMirrorUploadedSnapshotFilesFromFormData(formData: FormData): Promise<ControlMirrorUploadedSnapshotAdapterResult> {
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File);

  return prepareControlMirrorUploadedSnapshotFiles(files);
}

import { describe, expect, it, vi } from "vitest";
import {
  CONTROL_MIRROR_UPLOADED_SNAPSHOT_MAX_FILE_BYTES,
  CONTROL_MIRROR_UPLOADED_SNAPSHOT_MAX_FILES,
  prepareControlMirrorUploadedSnapshotFiles,
  prepareControlMirrorUploadedSnapshotFilesFromFormData
} from "@/lib/control-mirror/uploaded-snapshot-adapter";

describe("Control Mirror uploaded snapshot adapter", () => {
  it("converts selected files into uploaded snapshot input records", async () => {
    const result = await prepareControlMirrorUploadedSnapshotFiles([
      {
        name: "control-report.md",
        size: 8,
        lastModified: Date.UTC(2026, 4, 22),
        text: async () => "# Report"
      } as File
    ]);

    expect(result.rejectedBeforeProcessing).toEqual([]);
    expect(result.files).toHaveLength(1);
    expect(result.files[0]).toMatchObject({
      path: "control-report.md",
      content: "# Report",
      sizeBytes: 8
    });
    expect(result.files[0]?.lastModifiedAt).toBeInstanceOf(Date);
  });

  it("passes unreadable files as null content instead of processing them as evidence", async () => {
    const result = await prepareControlMirrorUploadedSnapshotFiles([
      {
        name: "build.log",
        size: 7,
        lastModified: Date.UTC(2026, 4, 22),
        text: vi.fn(async () => {
          throw new Error("read failed");
        })
      } as unknown as File
    ]);

    expect(result.files).toEqual([
      {
        path: "build.log",
        content: null,
        sizeBytes: 7,
        lastModifiedAt: expect.any(Date)
      }
    ]);
  });

  it("rejects empty and too-large files before server-side snapshot processing", async () => {
    const formData = new FormData();
    const tooLargeFile = new File([new Uint8Array(CONTROL_MIRROR_UPLOADED_SNAPSHOT_MAX_FILE_BYTES + 1)], "huge.log");

    formData.append("files", new File([], "empty.md"));
    formData.append("files", tooLargeFile);

    const result = await prepareControlMirrorUploadedSnapshotFilesFromFormData(formData);

    expect(result.files).toEqual([]);
    expect(result.rejectedBeforeProcessing).toEqual([
      {
        path: "empty.md",
        reason: "empty_file"
      },
      {
        path: "huge.log",
        reason: "too_large"
      }
    ]);
  });

  it("caps adapter processing at the uploaded snapshot file count limit", async () => {
    const formData = new FormData();

    for (let index = 0; index < CONTROL_MIRROR_UPLOADED_SNAPSHOT_MAX_FILES + 2; index += 1) {
      formData.append("files", new File([`file ${index}`], `file-${index}.md`));
    }

    const result = await prepareControlMirrorUploadedSnapshotFilesFromFormData(formData);

    expect(result.files).toHaveLength(CONTROL_MIRROR_UPLOADED_SNAPSHOT_MAX_FILES);
  });
});

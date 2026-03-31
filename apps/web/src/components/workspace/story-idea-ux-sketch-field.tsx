"use client";

import { useEffect, useMemo, useState } from "react";

type SketchPreview = {
  id: string;
  name: string;
  contentType: string;
  dataUrl: string;
};

type StoryIdeaUxSketchFieldProps = {
  existingSketches: SketchPreview[];
  entityTitle: string;
  isArchived: boolean;
};

export function StoryIdeaUxSketchField({
  existingSketches,
  entityTitle,
  isArchived
}: StoryIdeaUxSketchFieldProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const selectedPreviews = useMemo(
    () =>
      selectedFiles.map((file, index) => ({
        id: `selected-${index}-${file.name}`,
        name: file.name,
        contentType: file.type,
        dataUrl: URL.createObjectURL(file)
      })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      selectedPreviews.forEach((preview) => URL.revokeObjectURL(preview.dataUrl));
    };
  }, [selectedPreviews]);

  const visibleSketches = selectedPreviews.length > 0 ? selectedPreviews : existingSketches;
  const hasUxSketch = visibleSketches.length > 0;

  return (
    <div className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50/45 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-foreground">UX Sketch</span>
        {hasUxSketch ? (
          <span className="inline-flex rounded-full border border-sky-200 bg-white px-2.5 py-1 text-xs font-semibold text-sky-900">
            {visibleSketches.length > 1 ? `${visibleSketches.length} UX Sketches Attached` : "UX Sketch Attached"}
          </span>
        ) : null}
        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
          Conceptual - subject to change
        </span>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        Add an early UX sketch here when it helps explain the idea. Keep it conceptual and framing-level rather than final design.
      </p>
      {hasUxSketch ? (
        <div className="space-y-3">
          {selectedPreviews.length > 0 ? (
            <p className="text-xs text-sky-900">Previewing selected files before save.</p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleSketches.map((sketch) => (
              <div className="space-y-2 overflow-hidden rounded-2xl border border-border/70 bg-white p-3" key={sketch.id}>
                <img
                  alt={sketch.name ? `UX sketch for ${entityTitle}: ${sketch.name}` : `UX sketch attached to ${entityTitle}`}
                  className="max-h-80 w-full rounded-xl object-contain"
                  src={sketch.dataUrl}
                />
                <p className="text-xs text-muted-foreground">{sketch.name}</p>
              </div>
            ))}
          </div>
          {!isArchived && existingSketches.length > 0 ? (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input className="rounded border-border" name="clearUxSketch" type="checkbox" value="1" />
              Remove current sketches on next save
            </label>
          ) : null}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
          No UX sketch is attached yet.
        </div>
      )}
      {!isArchived ? (
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Upload sketch</span>
          <input
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="block w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-sky-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-sky-900 hover:file:bg-sky-200"
            multiple
            name="uxSketchFiles"
            onChange={(event) => {
              setSelectedFiles(Array.from(event.currentTarget.files ?? []));
            }}
            type="file"
          />
          <p className="text-xs text-muted-foreground">PNG, JPEG, WEBP or GIF. Up to 4 files, max 2 MB each.</p>
        </label>
      ) : null}
    </div>
  );
}

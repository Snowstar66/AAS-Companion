"use client";

import type { ProfiledFramingAiHandoff } from "@/lib/framing/framing-brief-export";

type ZipEntry = {
  path: string;
  data: Uint8Array;
};

const crcTable = new Uint32Array(256).map((_, index) => {
  let value = index;

  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }

  return value >>> 0;
});

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc = (crcTable[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(target: Uint8Array, offset: number, value: number) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
}

function writeUint32(target: Uint8Array, offset: number, value: number) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
  target[offset + 2] = (value >>> 16) & 0xff;
  target[offset + 3] = (value >>> 24) & 0xff;
}

function toZipTimestamp(date: Date) {
  const year = Math.max(1980, date.getFullYear());
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = Math.floor(date.getSeconds() / 2);

  const dosTime = (hours << 11) | (minutes << 5) | seconds;
  const dosDate = ((year - 1980) << 9) | (month << 5) | day;

  return { dosTime, dosDate };
}

function createStoredZip(entries: ZipEntry[]) {
  const encoder = new TextEncoder();
  const now = toZipTimestamp(new Date());
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.path.replaceAll("\\", "/"));
    const data = entry.data;
    const checksum = crc32(data);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    writeUint32(localHeader, 0, 0x04034b50);
    writeUint16(localHeader, 4, 20);
    writeUint16(localHeader, 6, 0);
    writeUint16(localHeader, 8, 0);
    writeUint16(localHeader, 10, now.dosTime);
    writeUint16(localHeader, 12, now.dosDate);
    writeUint32(localHeader, 14, checksum);
    writeUint32(localHeader, 18, data.length);
    writeUint32(localHeader, 22, data.length);
    writeUint16(localHeader, 26, nameBytes.length);
    writeUint16(localHeader, 28, 0);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, data);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    writeUint32(centralHeader, 0, 0x02014b50);
    writeUint16(centralHeader, 4, 20);
    writeUint16(centralHeader, 6, 20);
    writeUint16(centralHeader, 8, 0);
    writeUint16(centralHeader, 10, 0);
    writeUint16(centralHeader, 12, now.dosTime);
    writeUint16(centralHeader, 14, now.dosDate);
    writeUint32(centralHeader, 16, checksum);
    writeUint32(centralHeader, 20, data.length);
    writeUint32(centralHeader, 24, data.length);
    writeUint16(centralHeader, 28, nameBytes.length);
    writeUint16(centralHeader, 30, 0);
    writeUint16(centralHeader, 32, 0);
    writeUint16(centralHeader, 34, 0);
    writeUint16(centralHeader, 36, 0);
    writeUint32(centralHeader, 38, 0);
    writeUint32(centralHeader, 42, offset);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const centralDirectorySize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const endRecord = new Uint8Array(22);
  writeUint32(endRecord, 0, 0x06054b50);
  writeUint16(endRecord, 4, 0);
  writeUint16(endRecord, 6, 0);
  writeUint16(endRecord, 8, entries.length);
  writeUint16(endRecord, 10, entries.length);
  writeUint32(endRecord, 12, centralDirectorySize);
  writeUint32(endRecord, 16, offset);
  writeUint16(endRecord, 20, 0);

  const allParts = [...localParts, ...centralParts, endRecord];
  const totalLength = allParts.reduce((sum, part) => sum + part.length, 0);
  const combined = new Uint8Array(totalLength);
  let cursor = 0;

  for (const part of allParts) {
    combined.set(part, cursor);
    cursor += part.length;
  }

  return new Blob([combined.buffer.slice(combined.byteOffset, combined.byteOffset + combined.byteLength)], {
    type: "application/zip"
  });
}

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function decodeDataUrl(dataUrl: string) {
  const commaIndex = dataUrl.indexOf(",");

  if (commaIndex === -1) {
    throw new Error("Invalid data URL");
  }

  return decodeBase64(dataUrl.slice(commaIndex + 1));
}

export function buildFramingBriefExportPackage(input: {
  artifact: ProfiledFramingAiHandoff;
}) {
  const encoder = new TextEncoder();
  const { artifact } = input;
  const entries: ZipEntry[] = [
    {
      path: artifact.markdownFilename,
      data: encoder.encode(artifact.markdown)
    },
    {
      path: artifact.jsonFilename,
      data: encoder.encode(JSON.stringify(artifact.json, null, 2))
    }
  ];

  const storyIdeaGroups = [
    ...artifact.payload.framing_structure.epics.flatMap((epic) => epic.story_ideas),
    ...artifact.payload.framing_structure.unassigned_story_ideas
  ];

  for (const storyIdea of storyIdeaGroups) {
    for (const sketch of storyIdea.ux_sketches) {
      if (!sketch.file_path || !sketch.data_url) {
        continue;
      }

      entries.push({
        path: sketch.file_path,
        data: decodeDataUrl(sketch.data_url)
      });
    }
  }

  const guidanceTitle = artifact.profile === "bmad_prepared" ? "BMAD handling rules" : "General handling rules";
  const readme = [
    `# ${artifact.label} Package`,
    "",
    `Outcome: ${artifact.payload.handshake.outcome_key} - ${artifact.payload.handshake.outcome_title}`,
    `Profile: ${artifact.label}`,
    "",
    "Contents:",
    `- ${artifact.markdownFilename}`,
    `- ${artifact.jsonFilename}`,
    "- ux-sketches/... linked to the correct Story Idea",
    "",
    artifact.description,
    "",
    `## ${guidanceTitle}`,
    ...artifact.json.guidance.map((line) => `- ${line}`),
    "",
    "Use the markdown handoff for direct AI transfer. Use the JSON plus ux-sketches folder when the next step should preserve structure, traceability and visual references together."
  ].join("\n");

  entries.unshift({
    path: "README.md",
    data: encoder.encode(readme)
  });

  return {
    blob: createStoredZip(entries),
    filename: artifact.packageFilename
  };
}

export type TraceAttributes = Record<string, string | number | boolean>;

export function createTraceAttributes(attributes: TraceAttributes) {
  return {
    "aas.story_id": "M1-STORY-001",
    ...attributes
  };
}

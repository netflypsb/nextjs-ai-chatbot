import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { ArtifactKind } from "@/components/artifact";
import type { createDocument } from "./ai/tools/create-document";
import type { createPlan } from "./ai/tools/create-plan";
import type { getWeather } from "./ai/tools/get-weather";
import type { listDocuments } from "./ai/tools/list-documents";
import type { readDocument } from "./ai/tools/read-document";
import type { readPlan } from "./ai/tools/read-plan";
import type { requestSuggestions } from "./ai/tools/request-suggestions";
import type { searchDocuments } from "./ai/tools/search-documents";
import type { updateDocument } from "./ai/tools/update-document";
import type { updatePlan } from "./ai/tools/update-plan";
import type { Suggestion } from "./db/schema";

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type weatherTool = InferUITool<typeof getWeather>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
  ReturnType<typeof requestSuggestions>
>;
type searchDocumentsTool = InferUITool<ReturnType<typeof searchDocuments>>;
type listDocumentsTool = InferUITool<ReturnType<typeof listDocuments>>;
type readDocumentTool = InferUITool<ReturnType<typeof readDocument>>;
type createPlanTool = InferUITool<ReturnType<typeof createPlan>>;
type updatePlanTool = InferUITool<ReturnType<typeof updatePlan>>;
type readPlanTool = InferUITool<ReturnType<typeof readPlan>>;

export type ChatTools = {
  getWeather: weatherTool;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
  searchDocuments: searchDocumentsTool;
  listDocuments: listDocumentsTool;
  readDocument: readDocumentTool;
  createPlan: createPlanTool;
  updatePlan: updatePlanTool;
  readPlan: readPlanTool;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  planDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;
  finish: null;
  "chat-title": string;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};

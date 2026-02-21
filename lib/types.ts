import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { ArtifactKind } from "@/components/artifact";
import type { browseWeb } from "./ai/tools/browse-web";
import type { createDocument } from "./ai/tools/create-document";
import type { createPlan } from "./ai/tools/create-plan";
import type { executeCode } from "./ai/tools/execute-code";
import type { getWeather } from "./ai/tools/get-weather";
import type { listDocuments } from "./ai/tools/list-documents";
import type { readDocument } from "./ai/tools/read-document";
import type { readPlan } from "./ai/tools/read-plan";
import type { readSkill } from "./ai/tools/read-skill";
import type { requestSuggestions } from "./ai/tools/request-suggestions";
import type { searchDocuments } from "./ai/tools/search-documents";
import type { searchSkills } from "./ai/tools/search-skills";
import type { searchTools } from "./ai/tools/search-tools";
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
type browseWebTool = InferUITool<typeof browseWeb>;
type executeCodeTool = InferUITool<typeof executeCode>;
type readSkillTool = InferUITool<typeof readSkill>;
type searchSkillsTool = InferUITool<typeof searchSkills>;
type searchToolsTool = InferUITool<typeof searchTools>;

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
  browseWeb: browseWebTool;
  executeCode: executeCodeTool;
  readSkill: readSkillTool;
  searchSkills: searchSkillsTool;
  searchTools: searchToolsTool;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  planDelta: string;
  presentationDelta: string;
  webviewDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;
  finish: null;
  "chat-title": string;
  checkpoint: string;
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

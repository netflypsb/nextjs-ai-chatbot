import { auth } from "@/lib/auth";
import {
  getDocumentsByProjectId,
  getProjectById,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const { id } = await params;
  const project = await getProjectById({ id });

  if (!project) {
    return new ChatSDKError("not_found:database").toResponse();
  }

  if (project.userId !== session.user.id) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const documents = await getDocumentsByProjectId({ projectId: id });
  return Response.json(documents);
}

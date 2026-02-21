import { auth } from "@/lib/auth";
import {
  deleteProject,
  getProjectById,
  updateProject,
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

  return Response.json(project);
}

export async function PATCH(
  request: Request,
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

  try {
    const body = await request.json();
    const updated = await updateProject({
      id,
      name: body.name,
      description: body.description,
    });

    return Response.json(updated);
  } catch (_error) {
    return new ChatSDKError("bad_request:api").toResponse();
  }
}

export async function DELETE(
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

  const deleted = await deleteProject({ id });
  return Response.json(deleted);
}

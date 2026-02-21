import { auth } from "@/lib/auth";
import {
  createProject,
  getProjectsByUserId,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const projects = await getProjectsByUserId({ userId: session.user.id });
  return Response.json(projects);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  try {
    const { name, description } = await request.json();

    if (!name || typeof name !== "string") {
      return new ChatSDKError("bad_request:api").toResponse();
    }

    const project = await createProject({
      userId: session.user.id,
      name,
      description,
    });

    return Response.json(project, { status: 201 });
  } catch (_error) {
    return new ChatSDKError("bad_request:api").toResponse();
  }
}

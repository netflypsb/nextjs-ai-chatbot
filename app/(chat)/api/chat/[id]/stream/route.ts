import { UI_MESSAGE_STREAM_HEADERS } from "ai";
import { after } from "next/server";
import { createResumableStreamContext } from "resumable-stream";
import { auth } from "@/lib/auth";
import { getLatestStreamIdByChatId } from "@/lib/db/queries";

function getStreamContext() {
  try {
    return createResumableStreamContext({ waitUntil: after });
  } catch (_) {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return new Response(null, { status: 401 });
  }

  const { id: chatId } = await params;

  if (!process.env.REDIS_URL) {
    return new Response(null, { status: 204 });
  }

  const activeStreamId = await getLatestStreamIdByChatId({ chatId });

  if (!activeStreamId) {
    return new Response(null, { status: 204 });
  }

  const streamContext = getStreamContext();

  if (!streamContext) {
    return new Response(null, { status: 204 });
  }

  try {
    const resumedStream =
      await streamContext.resumeExistingStream(activeStreamId);

    if (!resumedStream) {
      return new Response(null, { status: 204 });
    }

    return new Response(resumedStream, {
      headers: UI_MESSAGE_STREAM_HEADERS,
    });
  } catch (_) {
    return new Response(null, { status: 204 });
  }
}

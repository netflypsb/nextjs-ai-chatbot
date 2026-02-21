import type { UseChatHelpers } from "@ai-sdk/react";
import { ArrowDownIcon } from "lucide-react";
import { Fragment } from "react";
import type { CheckpointData } from "@/hooks/use-checkpoints";
import { useMessages } from "@/hooks/use-messages";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import {
  Checkpoint,
  CheckpointIcon,
  CheckpointTrigger,
} from "./ai-elements/checkpoint";
import { useDataStream } from "./data-stream-provider";
import { Greeting } from "./greeting";
import { PreviewMessage, ThinkingMessage } from "./message";

type MessagesProps = {
  addToolApprovalResponse: UseChatHelpers<ChatMessage>["addToolApprovalResponse"];
  chatId: string;
  checkpoints?: CheckpointData[];
  status: UseChatHelpers<ChatMessage>["status"];
  votes: Vote[] | undefined;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  onRestoreCheckpoint?: (messageIndex: number) => void;
  isReadonly: boolean;
  isArtifactVisible: boolean;
  selectedModelId: string;
};

function PureMessages({
  addToolApprovalResponse,
  chatId,
  checkpoints,
  status,
  votes,
  messages,
  setMessages,
  regenerate,
  onRestoreCheckpoint,
  isReadonly,
  selectedModelId: _selectedModelId,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    scrollToBottom,
    hasSentMessage,
  } = useMessages({
    status,
  });

  useDataStream();

  return (
    <div className="relative flex-1">
      <div
        className="absolute inset-0 touch-pan-y overflow-y-auto"
        ref={messagesContainerRef}
      >
        <div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
          {messages.length === 0 && <Greeting />}

          {messages.map((message, index) => {
            const checkpoint = checkpoints?.find(
              (cp) => cp.messageIndex === index
            );

            return (
              <Fragment key={message.id}>
                <PreviewMessage
                  addToolApprovalResponse={addToolApprovalResponse}
                  chatId={chatId}
                  isLoading={
                    status === "streaming" && messages.length - 1 === index
                  }
                  isReadonly={isReadonly}
                  message={message}
                  regenerate={regenerate}
                  requiresScrollPadding={
                    hasSentMessage && index === messages.length - 1
                  }
                  setMessages={setMessages}
                  vote={
                    votes
                      ? votes.find((vote) => vote.messageId === message.id)
                      : undefined
                  }
                />
                {checkpoint && (
                  <Checkpoint>
                    <CheckpointIcon />
                    <CheckpointTrigger
                      className="text-xs"
                      onClick={() =>
                        onRestoreCheckpoint?.(checkpoint.messageIndex)
                      }
                      tooltip="Restore conversation to this point"
                    >
                      {checkpoint.reason === "context-trim"
                        ? "Context checkpoint — Restore"
                        : "Checkpoint — Restore"}
                    </CheckpointTrigger>
                  </Checkpoint>
                )}
              </Fragment>
            );
          })}

          {status === "submitted" &&
            !messages.some((msg) =>
              msg.parts?.some(
                (part) => "state" in part && part.state === "approval-responded"
              )
            ) && <ThinkingMessage />}

          <div
            className="min-h-[24px] min-w-[24px] shrink-0"
            ref={messagesEndRef}
          />
        </div>
      </div>

      <button
        aria-label="Scroll to bottom"
        className={`absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border bg-background p-2 shadow-lg transition-all hover:bg-muted ${
          isAtBottom
            ? "pointer-events-none scale-0 opacity-0"
            : "pointer-events-auto scale-100 opacity-100"
        }`}
        onClick={() => scrollToBottom("smooth")}
        type="button"
      >
        <ArrowDownIcon className="size-4" />
      </button>
    </div>
  );
}

export const Messages = PureMessages;

"use client";

import { useCallback, useState } from "react";

export type CheckpointData = {
  id: string;
  messageIndex: number;
  timestamp: Date;
  reason: "auto" | "context-trim" | "manual";
};

export function useCheckpoints() {
  const [checkpoints, setCheckpoints] = useState<CheckpointData[]>([]);

  const addCheckpoint = useCallback(
    (messageIndex: number, reason: CheckpointData["reason"] = "auto") => {
      setCheckpoints((prev) => {
        // Don't duplicate checkpoints at the same index
        if (prev.some((cp) => cp.messageIndex === messageIndex)) {
          return prev;
        }
        return [
          ...prev,
          {
            id: `cp-${Date.now()}-${messageIndex}`,
            messageIndex,
            timestamp: new Date(),
            reason,
          },
        ];
      });
    },
    []
  );

  const restoreToCheckpoint = useCallback(
    (messageIndex: number) => {
      setCheckpoints((prev) =>
        prev.filter((cp) => cp.messageIndex <= messageIndex)
      );
      return messageIndex + 1; // Return the number of messages to keep
    },
    []
  );

  const clearCheckpoints = useCallback(() => {
    setCheckpoints([]);
  }, []);

  return { checkpoints, addCheckpoint, restoreToCheckpoint, clearCheckpoints };
}

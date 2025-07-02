"use client";

import { useRealtimeRun } from "@trigger.dev/react-hooks";
import type { convertPcmToMp3 } from "@/app/trigger/convert-pcm-to-mp3";
import { useEffect } from "react";

interface Props {
  handleObj: { id: string; publicAccessToken: string };
  handleComplete: (url: string | undefined) => void;
  handleError: (error: string) => void;
}

export default function TaskStatus({
  handleObj,
  handleComplete,
  handleError,
}: Props) {
  const { run, error } = useRealtimeRun<typeof convertPcmToMp3>(handleObj.id, {
    accessToken: handleObj.publicAccessToken,
  });

  useEffect(() => {
    if (run?.status === "COMPLETED") {
      console.log("completed run", run);
      handleComplete(run.output?.url);
    }
  }, [run?.status]);

  if (error) {
    return handleError(error.message || "An unknown error occurred");
  }

  return <></>;
}

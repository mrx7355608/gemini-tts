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
      handleComplete(run.output?.url);
    }
  }, [run?.status]);

  if (error) {
    console.log(error);
    handleError("An error occurred while converting audio to mp3");
  }

  return <div className="hidden"></div>;
}

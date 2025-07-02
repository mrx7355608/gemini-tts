import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { tasks } from "@trigger.dev/sdk/v3";
import type { convertPcmToMp3 } from "@/app/trigger/convert-pcm-to-mp3";

export const runtime = "nodejs";

export async function POST() {
  const oneSecondPcmBase64 = await fs.readFile(
    path.join(__dirname, "..", "..", "..", "..", "..", "input.pcm")
  );

  const handler = await tasks.trigger<typeof convertPcmToMp3>(
    "convert-pcm-to-mp3",
    {
      pcm: oneSecondPcmBase64.toString("base64"),
    }
  );

  return NextResponse.json(handler);
}

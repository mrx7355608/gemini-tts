import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

export async function POST() {
  const oneSecondPcmBase64 = await fs.readFile(
    path.join(__dirname, "..", "..", "..", "..", "..", "input.pcm")
  );

  return NextResponse.json(
    {
      audio: oneSecondPcmBase64.toString("base64"),
    },
    { status: 200 }
  );
}

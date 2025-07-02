import { GoogleGenAI } from "@google/genai";
import { tasks } from "@trigger.dev/sdk/v3";
import { NextRequest, NextResponse } from "next/server";
import type { convertPcmToMp3 } from "@/app/trigger/convert-pcm-to-mp3";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key not found" }, { status: 500 });
  }

  const body = await req.json();
  const { text, voice, temperature, model, styleInstructions } = body;

  // Generate audio
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: `${styleInstructions} ${text}` }] }],
      config: {
        temperature: temperature,
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const data =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!data) {
      return NextResponse.json({ error: "No data received" }, { status: 500 });
    }

    const handler = await tasks.trigger<typeof convertPcmToMp3>(
      "convert-pcm-to-mp3",
      {
        pcm: data,
      }
    );

    return NextResponse.json(handler, { status: 200 });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: "Error generating audio" },
      { status: 500 }
    );
  }
}

import { GoogleGenAI } from "@google/genai";
import wav from "wav";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key not found" }, { status: 500 });
  }

  const body = await req.json();
  const { text, voice, temperature, model, styleInstructions } = body;

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

  const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!data) {
    return NextResponse.json({ error: "No data received" }, { status: 500 });
  }

  const audioBuffer = Buffer.from(data, "base64");
  const fileName = "out.wav";
  await saveWaveFile(fileName, audioBuffer);

  return NextResponse.json({ ok: true }, { status: 200 });
}

async function saveWaveFile(
  filename: string,
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
) {
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter(filename, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    writer.on("finish", resolve);
    writer.on("error", reject);

    writer.write(pcmData);
    writer.end();
  });
}

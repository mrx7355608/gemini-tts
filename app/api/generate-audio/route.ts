import { supabase } from "@/app/supabaseClient";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import wav from "wav";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key not found" }, { status: 500 });
  }

  const body = await req.json();
  const { text, voice, temperature, model, styleInstructions } = body;

  try {
    // Generate audio
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

    const audioBuffer = Buffer.from(data, "base64");
    const fileName = "out.wav";
    await saveWaveFile(fileName, audioBuffer);

    // Save mp3 buffer as file in supabase storage
    const fileBuffer = await fs.readFile(fileName);
    const { data: uploadedFile, error } = await supabase.storage
      .from("audio-files")
      .upload(`${Date.now()}.wav`, fileBuffer, {
        contentType: "audio/wav",
      });

    if (error) {
      console.error("Error uploading file: ", error);
      return NextResponse.json(
        { error: "Error uploading file" },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("audio-files").getPublicUrl(uploadedFile.path);

    console.log(uploadedFile);
    console.log(publicUrl);
    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (error) {
    console.error("Error generating audio: ", error);
    return NextResponse.json(
      { error: "Error generating audio" },
      { status: 500 }
    );
  }
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

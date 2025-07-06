import { GoogleGenAI } from "@google/genai";
import { tasks } from "@trigger.dev/sdk/v3";
import { NextRequest, NextResponse } from "next/server";
import type { convertPcmToMp3 } from "@/app/trigger/convert-pcm-to-mp3";
import { splitPrompt } from "@/lib/split-prompt";
import wav from "wav";
import { createClient } from "@/lib/supabase/server"


export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key not found" }, { status: 500 });
  }

  const body = await req.json();
  const { text, voice, temperature, model, styleInstructions } = body;

  // Split prompt into subclips to avoid gemini text limit
  const subclips = splitPrompt(text, 1000);
  console.log("Total subclips: ", subclips.length);

  try {
    // Generate audio for each subclip
    console.log("Generating audio...");
    const ai = new GoogleGenAI({ apiKey });
    const promises = subclips.map(async (subclip) => {
      return ai.models.generateContent({
        model: model,
        contents: [{ parts: [{ text: `${styleInstructions} ${subclip}` }] }],
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
    });
    const responses = await Promise.all(promises);
    console.log("Total responses: ", responses.length);
    
    const filteredResponses = responses.filter((response) => {
      const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
      return data !== undefined;
    });
    console.log("Total filtered responses: ", filteredResponses.length);

    const pcmStrings: string[] = filteredResponses.map(
      (response) =>
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || ""
    );
    console.log("Total PCM strings: ", pcmStrings.length);
    
    // Convert PCM strings to buffers
    const filteredPcmStrings = pcmStrings.filter((pcmString) => pcmString !== "");
    console.log("Total PCM strings (filtered): ", filteredPcmStrings.length);

    const buffers = filteredPcmStrings.map((pcmString) =>
      Buffer.from(pcmString, "base64")
    );
    if (buffers.length === 0) {
      return NextResponse.json({ error: "No data received" }, { status: 500 });
    }

    // Upload each pcm buffer to supabase to avoid upload limit
    console.log("Uploading to supabase...");
    const uploadPromises = buffers.map((buffer) => {
      return supabase.storage
        .from("audio-files")
        .upload(`${Date.now()}.pcm`, buffer, {
          contentType: "audio/pcm",
        });
    });

    const uploadResponses = await Promise.all(uploadPromises);
    console.log("Upload responses: ", uploadResponses);

    // Save file locally on filesystem for testing purposes
    console.log("Saving file locally...");
    const combinedBuffer = Buffer.concat(buffers);
    await saveWaveFile("test2.wav", combinedBuffer);

    // Convert PCM to MP3 using trigger.dev
    const pcmFilePaths = uploadResponses.map((response) => response.data?.path);
    const handler = await tasks.trigger<typeof convertPcmToMp3>(
      "convert-pcm-to-mp3",
      {
        audioUrl: pcmFilePaths,
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

async function saveWaveFile(
  filename: string,
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2,
) {
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter(filename, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    writer.on('finish', resolve);
    writer.on('error', reject);

    writer.write(pcmData);
    writer.end();
  });
}

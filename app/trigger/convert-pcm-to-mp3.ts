import ffmpeg from "fluent-ffmpeg";
import { logger, task } from "@trigger.dev/sdk/v3";
import { Readable } from "stream";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export const convertPcmToMp3 = task({
  id: "convert-pcm-to-mp3",
  run: async (payload: { audioUrl: (string | undefined)[] }) => {
    const { audioUrl } = payload;

    if (audioUrl.length === 0) {
      return { message: "No audio URLs provided" };
    }


    const filteredUrls = audioUrl.filter((path) => path !== undefined);
    const downloadPromises = filteredUrls.map((path) => {
      return supabase.storage
        .from("audio-files")
        .download(path);
    });

    const downloadResponses = await Promise.all(downloadPromises);
    const pcmBuffers: Buffer[] = [];

    for (const response of downloadResponses) {
      const data = await response.data?.arrayBuffer();
      pcmBuffers.push(Buffer.from(data!));
    }

    const mainBuffer = Buffer.concat(pcmBuffers);

    logger.info("Converting....");
    const tempDirectory = os.tmpdir();
    const filename = `output_${Date.now()}.mp3`; 
    const outputPath = path.join(tempDirectory, filename);

    await new Promise((resolve, reject) => {
      const inputStream = Readable.from([mainBuffer]);

      ffmpeg(inputStream)
        .inputOptions([
          "-f",
          "s16le", // raw PCM format
          "-ar",
          "24000", // sample rate: 24kHz
          "-ac",
          "1", // mono
        ])
        .outputOptions([
          "-ar",
          "24000", // preserve 24kHz output (optional but recommended)
          "-acodec",
          "libmp3lame", // MP3 encoder
          "-b:a",
          "96k", // optional: set bitrate
        ])
        .output(outputPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    logger.log(`Converted to mp3`);
    const mp3File = await fs.readFile(outputPath);

    // Save to supabase
    logger.log("Saving to supabase...");
    const { error } = await supabase.storage
      .from("audio-files")
      .upload(filename, mp3File, {
        contentType: "audio/mpeg",
      });

    if (error) throw new Error("Supabase upload failed: " + error.message);
    logger.log("Uploaded to supabase successully");

    // Delete the temporary compressed video file
    await fs.unlink(outputPath);
    logger.log("Deleted temporary file");

    // Get the public url
    const publicUrl = supabase.storage
      .from("audio-files")
      .getPublicUrl(filename).data.publicUrl;

    return {
      url: publicUrl,
    };
  },
});

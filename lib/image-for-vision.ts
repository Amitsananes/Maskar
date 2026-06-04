import fs from "fs/promises";
import path from "path";
import type Anthropic from "@anthropic-ai/sdk";
import { isLocalImageUrl, localPathFromImageUrl } from "@/lib/storage";

async function readLocalImageBlock(
  imageUrl: string
): Promise<Anthropic.Messages.ImageBlockParam> {
  const filePath = localPathFromImageUrl(imageUrl);
  if (!filePath) {
    throw new Error(`Cannot resolve local image path: ${imageUrl}`);
  }

  const data = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const media_type =
    ext === ".png"
      ? "image/png"
      : ext === ".webp"
        ? "image/webp"
        : "image/jpeg";

  return {
    type: "image",
    source: {
      type: "base64",
      media_type,
      data: data.toString("base64"),
    },
  };
}

/** Build Claude Vision image block — base64 for local files, URL for Cloudinary. */
export async function imageUrlToVisionBlock(
  imageUrl: string
): Promise<Anthropic.Messages.ImageBlockParam> {
  if (isLocalImageUrl(imageUrl)) {
    return readLocalImageBlock(imageUrl);
  }

  return {
    type: "image",
    source: { type: "url", url: imageUrl },
  };
}

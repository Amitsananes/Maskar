import fs from "fs/promises";
import path from "path";
import { uploadVisitImageCloudinary } from "@/lib/cloudinary";

export type UploadResult = {
  url: string;
  publicId: string;
  storage: "cloudinary" | "local";
};

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export function getAppBaseUrl(): string {
  return (
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function extensionFromMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

async function uploadVisitImageLocal(
  file: Buffer,
  folder: string,
  publicId: string,
  mimeType: string
): Promise<UploadResult> {
  const ext = extensionFromMime(mimeType);
  const dir = path.join(UPLOAD_ROOT, folder);
  await fs.mkdir(dir, { recursive: true });

  const filename = `${publicId}.${ext}`;
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, file);

  const urlPath = `/uploads/${folder}/${filename}`.replace(/\\/g, "/");
  const url = `${getAppBaseUrl()}${urlPath}`;

  console.info("[storage] Saved local upload:", urlPath);

  return {
    url,
    publicId: `local/${folder}/${filename}`,
    storage: "local",
  };
}

/** Upload visit image — Cloudinary when configured, otherwise local disk. */
export async function uploadVisitImage(
  file: Buffer,
  folder: string,
  publicId: string,
  mimeType = "image/jpeg"
): Promise<UploadResult> {
  if (isCloudinaryConfigured()) {
    const result = await uploadVisitImageCloudinary(file, folder, publicId);
    return { ...result, storage: "cloudinary" };
  }

  console.info(
    "[storage] Cloudinary not configured — using local upload fallback"
  );
  return uploadVisitImageLocal(file, folder, publicId, mimeType);
}

/** Resolve a stored image URL to an absolute filesystem path (local uploads only). */
export function localPathFromImageUrl(imageUrl: string): string | null {
  try {
    const pathname = imageUrl.startsWith("http")
      ? new URL(imageUrl).pathname
      : imageUrl;
    const prefix = "/uploads/";
    if (!pathname.startsWith(prefix)) return null;
    return path.join(process.cwd(), "public", pathname);
  } catch {
    const prefix = "/uploads/";
    if (!imageUrl.includes(prefix)) return null;
    const idx = imageUrl.indexOf(prefix);
    return path.join(process.cwd(), "public", imageUrl.slice(idx));
  }
}

export function isLocalImageUrl(imageUrl: string): boolean {
  return (
    imageUrl.includes("/uploads/") ||
    imageUrl.startsWith(getAppBaseUrl() + "/uploads/")
  );
}

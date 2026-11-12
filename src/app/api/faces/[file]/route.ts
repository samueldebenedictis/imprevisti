import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { FACES_ACCESS_COOKIE } from "@/lib/faces";
import { readFacesImage } from "@/lib/faces-storage";
import { hasFacesAccess } from "@/lib/session-store";
import {
  EMOTION_VIDEO_PLACEHOLDER_URL,
  emotionVideoFiles,
} from "@/model/deck/emotion-video";
import { faceEmotionFiles } from "@/model/deck/face-emotion";

const IMAGE_PLACEHOLDER_PATH = "/images/face-placeholder.svg";

/** File FACES che si possono chiedere: le foto e le clip dei due mazzi. */
const isFacesFile = (file: string) =>
  faceEmotionFiles.has(file) || emotionVideoFiles.has(file);

/**
 * Restituisce una fotografia FACES ("Indovina l'emozione") o una clip
 * Dynamic FACES ("Emozioni in movimento").
 * Solo ai dispositivi che hanno accettato il disclaimer, e senza cache:
 * la foto non resta salvata né nel browser né nelle cache intermedie.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  if (!isFacesFile(file))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const token = (await cookies()).get(FACES_ACCESS_COOKIE)?.value;
  if (!token || !(await hasFacesAccess(token)))
    return NextResponse.json(
      { error: "Disclaimer not accepted" },
      { status: 403 },
    );

  const image = await readFacesImage(file);
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const video = file.endsWith(".mp4");
  if (image.kind === "placeholder")
    return NextResponse.redirect(
      new URL(
        video ? EMOTION_VIDEO_PLACEHOLDER_URL : IMAGE_PLACEHOLDER_PATH,
        req.url,
      ),
      307,
    );

  return new Response(image.body as BodyInit, {
    headers: {
      "Content-Type": video ? "video/mp4" : "image/jpeg",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, noimageindex",
    },
  });
}

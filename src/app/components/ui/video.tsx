"use client";

import { imagePrefix } from "@/app/image-prefix";

export function Video(props: { src: string; text: string }) {
  return (
    <div className="my-4">
      <div className="flex flex-col items-center border-2 border-sky-600 border-solid">
        <video
          controls
          muted
          preload="metadata"
          className="h-auto w-full"
          poster={`${imagePrefix}/videos/poster.png`}
        >
          <source src={`${props.src}`} type="video/webm" />
        </video>
      </div>
      <p className="ui-text-dark mt-2">{props.text}</p>
    </div>
  );
}

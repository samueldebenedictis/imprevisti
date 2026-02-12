"use client";

export function Video(props: { src: string }) {
  return (
    <div className="border-2 border-sky-600 border-solid">
      <video controls muted preload="auto">
        <source src={props.src} type="video/webm" />
      </video>
    </div>
  );
}

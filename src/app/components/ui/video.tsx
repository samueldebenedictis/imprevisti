"use client";

export function Video(props: { src: string; text: string }) {
  return (
    <div className="my-4">
      <div className="flex flex-col items-center border-2 border-sky-600 border-solid">
        <video controls muted preload="auto" className="h-auto w-full">
          <source src={props.src} type="video/webm" />
        </video>
      </div>
      <p className="ui-text-dark mt-2">{props.text}</p>
    </div>
  );
}

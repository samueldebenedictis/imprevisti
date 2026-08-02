// Mock for next/image — the real component resolves to Next.js's image
// optimization API route (/_next/image), which only exists inside an actual
// Next.js server. Storybook's standalone webpack5 server doesn't have that
// route, so every <Image> 404s and silently renders nothing. This renders a
// plain <img> instead, forwarding the plain-<img>-compatible props this
// project actually passes (width, height, src, alt, className, style,
// onError) and dropping Next-only props (priority, fill, sizes, quality,
// loader, placeholder, blurDataURL, unoptimized).
const React = require("react");

const PASSTHROUGH_PROPS = [
  "width",
  "height",
  "src",
  "alt",
  "className",
  "style",
  "onError",
  "onLoad",
  "key",
];

function Image(props) {
  const imgProps = {};
  for (const key of PASSTHROUGH_PROPS) {
    if (key in props) imgProps[key] = props[key];
  }
  return React.createElement("img", imgProps);
}

module.exports = Image;
module.exports.default = Image;

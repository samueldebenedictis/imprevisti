// Mock for next/font/google — not available outside Next.js runtime
const fontFactory = () => ({ variable: "", className: "" });
module.exports = new Proxy({}, { get: () => fontFactory });

export function debugLog(message?: string, ...optionalParams: any[]) {
  const _devMode = process.env.NODE_ENV === "development";
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  // const label = caller? `[${now} - ${caller}]` : `[${now}]`
  // console.log(arguments.callee)
  console.log(`${now} ${message}`, optionalParams);
}

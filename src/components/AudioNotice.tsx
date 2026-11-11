import { useEffect, useState } from "react";
export default function AudioNotice() {
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handle = (event: Event) => { setNotice((event as CustomEvent<string>).detail); clearTimeout(timer); timer = setTimeout(() => setNotice(""), 4500); };
    const clear = () => { clearTimeout(timer); setNotice(""); };
    window.addEventListener("study-audio-error", handle);
    window.addEventListener("study-audio-start", clear);
    return () => { clearTimeout(timer); window.removeEventListener("study-audio-error", handle); window.removeEventListener("study-audio-start", clear); };
  }, []);
  return notice ? <div className="audio-notice" role="status">{notice}</div> : null;
}

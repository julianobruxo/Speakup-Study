import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { cancelPronunciation } from "../services/audio/pronunciation";
const activities = ["home", "flash", "memory", "gaps", "time", "writing", "test"];
export default function PastStudioPage() {
  const { activity = "home" } = useParams();
  const section = activities.includes(activity) ? activity : "home";
  const navigate = useNavigate();
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(850);
  const initial = useRef(section);
  useEffect(() => {
    cancelPronunciation();
    frame.current?.contentWindow?.postMessage({ type: "past-navigate", route: section }, window.location.origin);
    return cancelPronunciation;
  }, [section]);
  useEffect(() => {
    const handle = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === "past-height" && Number.isFinite(event.data.height)) setHeight(Math.max(400, Math.min(event.data.height, 20000)));
      if (event.data?.type === "past-progress") window.dispatchEvent(new CustomEvent("past-progress"));
      if (event.data?.type === "past-route" && activities.includes(event.data.route)) navigate(`/passado/${event.data.route}`, { replace: true });
    };
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, [navigate]);
  return <AppShell activeNav="study" className="standard-page past-integration"><iframe ref={frame} title="Atividades de Simple Past" src={`/past/index.html?embedded=1&section=${initial.current}`} style={{ width: "100%", height, border: 0, display: "block" }} allow="autoplay" /></AppShell>;
}

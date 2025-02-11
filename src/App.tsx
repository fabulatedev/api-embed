import "./App.css";
import { getMarkdown } from "./service";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import { sendMessage } from 'promise-postmessage';

export default function App() {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    function fetchAndRenderMarkdown(payload) {
      let _markdown = "";
      getMarkdown(payload, (mdown) => {
        _markdown += mdown;
        setMarkdown(_markdown);
      });
    }

    if (window.parent === window) {
      const params = new URLSearchParams(window.location.search);
      const payload = JSON.parse(params.get("payload") || "{}");
      if (Object.keys(payload).length > 0) {
        fetchAndRenderMarkdown(payload);        
      } else {
        setMarkdown("No payload found");
      }
    } else {
      sendMessage(window.parent, {
        type: "ready",
      }).then(payload => {
        fetchAndRenderMarkdown(payload);
      });
    }
  }, []);
  return (
    <div className="App">
      <Markdown rehypePlugins={[rehypeRaw]}>{markdown}</Markdown>
    </div>
  );
}

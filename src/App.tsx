import "./App.css";
import { getExplanationMarkdown } from "./service";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";

const urlParams = new URLSearchParams(window.location.search);
const codeFiles = JSON.parse(urlParams.get("codefiles"));

export default function App() {
  const [markdown, setMarkdown] = useState("");
  useEffect(() => {
    let _markdown = "";
    getExplanationMarkdown(codeFiles, (mdown) => {
      _markdown += mdown;
      setMarkdown(_markdown);
    });
  }, []);
  return (
    <div className="App">
      <Markdown>{markdown}</Markdown>
    </div>
  );
}

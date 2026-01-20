import { useState } from "react";
import "./App.css";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import rust from "highlight.js/lib/languages/rust";
import typescript from "highlight.js/lib/languages/typescript";
import Markdown from "marked-react";
import Lowlight from "react-lowlight";
import "highlight.js/styles/night-owl.css";

Lowlight.registerLanguage("js", javascript);
Lowlight.registerLanguage("javascript", javascript);
Lowlight.registerLanguage("ts", typescript);
Lowlight.registerLanguage("typescript", typescript);
Lowlight.registerLanguage("bash", bash);
Lowlight.registerLanguage("rust", rust);

const renderer = {
  code(snippet, lang) {
    const usedLang = Lowlight.hasLanguage() ? lang : "bash";
    return <Lowlight key={this.elementId} language={usedLang} value={snippet} />;
  },
};

function App() {
  // # State Management with useState
  // * Each useState call creates an independent state variable that triggers re-renders when updated
  // * setPrompt, setChatId, etc. are setter functions - calling them updates state AND re-renders the component
  // ! State updates are asynchronous - don't read state immediately after calling setState!
  const [prompt, setPrompt] = useState("");
  const [chatId, setChatId] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [pending, setPending] = useState(false);
  const [isImageGen, setIsImageGen] = useState(false);
  const [base64img, setBase64img] = useState(null);

  // # Async API Calls with Fetch
  // * async/await allows handling asynchronous operations (API calls) without blocking the UI
  // * try/catch/finally ensures errors are caught and cleanup (setPending) always runs
  // ! Always use finally to reset loading states - even if the request fails!
  const handleImageGen = async () => {
    // Todo: Handle image gen
    setPending(true);

    try {
      setAiResponse("");
      setBase64img("");

      const res = await fetch("http://localhost:8080/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      setBase64img(data.result.data[0].b64_json);
    } catch (error) {
      console.error("Error in image generation: ", error);
    } finally {
      setPending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAiResponse("");
    if (isImageGen) {
      handleImageGen();
      return;
    }

    try {
      setPending(true);

      // Todo: handle chat completions without streaming hassle
      // const res = await fetch("http://localhost:8080/messages", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ prompt, chatId }),
      // });

      // const data = await res.json();
      // setAiResponse(data.result);
      // setChatId(data.chatId);

      // # Server-Sent Events (SSE) Streaming
      // * res.body is a ReadableStream - we read chunks incrementally instead of waiting for the full response
      // * getReader() gives us control to read data piece by piece as it arrives from the server
      // * decoder.decode() converts binary chunks to text, which we then parse line by line
      // ! SSE format: "data: <content>\n\n" - each message ends with double newline!
      const res = await fetch("http://localhost:8080/messages/streaming", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, chatId }),
      });

      // console.log(res);

      if (!res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      // * Loop reads chunks until done=true - this allows real-time updates as data streams in
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        // * Process each SSE message line - "data:" contains AI text, "chat:" contains session ID
        for (let line of lines) {
          if (line.startsWith("data: ")) {
            line = line.slice(6);
            const parsedText = JSON.parse(line);
            // * Functional setState: (p) => p + parsedText uses previous state to append new text
            // ! This pattern is essential when state updates depend on previous state!
            setAiResponse((p) => p + parsedText);
          } else if (line.startsWith("chat: ")) {
            line = line.slice(6);
            const parsedText = JSON.parse(line);
            setChatId(parsedText);
          }
        }
      }
    } catch (error) {
      console.error("Error ", error);
    } finally {
      setPending(false);
    }
  };

  const reset = () => {
    setAiResponse("");
    setPrompt("");
  };

  return (
    <main className="h-screen p-2 mx-auto w-5xl flex flex-col items-center">
      {/* # Controlled Components */}
      {/* * value={prompt} + onChange makes this a controlled component - React controls its value */}
      {/* * The input's value is always synced with state, enabling programmatic control */}
      <form onSubmit={handleSubmit} className="flex w-full gap-2 items-end" inert={pending}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={isImageGen ? "Prompt your image..." : "State your question..."}
          className="textarea textarea-primary flex-10/12 h-40 resize-none"
        />
        <div className="flex-2/12 flex flex-col gap-2">
          <label className="label">
            {/* * Functional setState with toggle: (p) => !p flips boolean state */}
            <input
              type="checkbox"
              checked={isImageGen}
              onChange={() => setIsImageGen((p) => !p)}
              className="checkbox"
            />
            Image Generation
          </label>
          <button type="submit" className="btn btn-primary " disabled={pending}>
            {pending ?
              <span className="loading loading-spinner" />
            : <span>Send</span>}
          </button>
          <button className="btn btn-secondary" type="reset" onClick={reset}>
            Clear
          </button>
        </div>
      </form>
      {/* # Conditional Rendering */}
      {/* * JSX expressions like {condition && <Component />} render conditionally based on state */}
      {/* * Multiple conditions can chain: isImageGen && !base64img && pending shows loading skeleton */}
      {/* ! React renders false/null/undefined as nothing - use && for conditional rendering! */}
      <div className="mockup-window border  w-full my-4 flex-1 overflow-y-auto text-start px-4 ">
        {isImageGen && !base64img && pending && (
          <div className="skeleton mask mask-squircle w-72 aspect-square" />
        )}
        {base64img && (
          <div className="mask mask-squircle w-72">
            <a
              href={`data:image/png;base64,${base64img}`}
              download={`${Date.now()}.png`}
              title="Download"
            >
              <img
                src={`data:image/png;base64,${base64img}`}
                alt={`AI generation based on prompt: ${prompt}`}
              />
            </a>
          </div>
        )}
        <Markdown value={aiResponse} renderer={renderer} />
      </div>
    </main>
  );
}

export default App;

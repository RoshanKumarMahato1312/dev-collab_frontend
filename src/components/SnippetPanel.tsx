"use client";

import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { api } from "@/lib/api";
import type { Snippet } from "@/lib/types";

interface SnippetPanelProps {
  projectId: string;
}

export default function SnippetPanel({ projectId }: SnippetPanelProps) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [explanationBySnippet, setExplanationBySnippet] = useState<Record<string, string>>({});
  const [explainingId, setExplainingId] = useState<string>("");

  const loadSnippets = async () => {
    const response = await api.get(`/snippets/${projectId}`);
    setSnippets(response.data.snippets ?? []);
  };

  useEffect(() => {
    loadSnippets().catch(() => undefined);
  }, [projectId]);

  const saveSnippet = async () => {
    if (!code.trim()) return;
    await api.post(`/snippets/${projectId}`, { code, language });
    setCode("");
    await loadSnippets();
  };

  const explainSnippet = async (snippet: Snippet) => {
    setExplainingId(snippet._id);
    try {
      const response = await api.post("/ai/explain", {
        code: snippet.code,
        language: snippet.language
      });
      setExplanationBySnippet((prev) => ({
        ...prev,
        [snippet._id]: response.data.explanation ?? "No explanation available"
      }));
    } catch (error: any) {
      setExplanationBySnippet((prev) => ({
        ...prev,
        [snippet._id]: error?.response?.data?.message ?? "Failed to generate explanation"
      }));
    } finally {
      setExplainingId("");
    }
  };

  const generateFromPrompt = async () => {
    if (!prompt.trim()) return;

    setGenerateError("");
    setIsGenerating(true);
    try {
      const response = await api.post("/ai/generate", {
        prompt,
        language
      });
      setCode(response.data.code ?? "");
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Failed to generate code";
      const detail = error?.response?.data?.error;
      setGenerateError(detail ? `${message}: ${detail}` : message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-300 bg-white p-4 shadow-md shadow-zinc-300/30">
      <h3 className="mb-2 text-lg font-semibold text-zinc-950">Code Snippets</h3>
      <div className="mb-3 grid gap-2">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe what you want AI to build..."
          className="min-h-20 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm"
        />
        <button
          onClick={generateFromPrompt}
          className="w-fit rounded-lg border border-zinc-400 bg-white px-3 py-2 text-sm font-medium text-zinc-900"
        >
          {isGenerating ? "Generating..." : "Generate with AI"}
        </button>
        {generateError && <p className="text-sm text-red-600">{generateError}</p>}
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="rounded-lg border border-zinc-300 bg-zinc-50 px-2 py-2 text-sm"
        >
          <option value="typescript">TypeScript</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Paste your snippet or generate code from prompt"
          className="min-h-24 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 font-mono text-sm"
        />
        <button onClick={saveSnippet} className="w-fit rounded-lg bg-zinc-950 px-3 py-2 text-sm font-medium text-white">
          Save Snippet
        </button>
      </div>

      <div className="space-y-3">
        {snippets.map((snippet) => (
          <div key={snippet._id} className="rounded-lg border border-zinc-300">
            <div className="flex items-center justify-between border-b border-zinc-300 px-3 py-2 text-xs text-zinc-700">
              <span>{snippet.language}</span>
              <button
                onClick={() => navigator.clipboard.writeText(snippet.code)}
                className="rounded border border-zinc-400 bg-white px-2 py-1 font-medium"
              >
                Copy
              </button>
              <button
                onClick={() => explainSnippet(snippet)}
                className="ml-2 rounded border border-zinc-400 bg-white px-2 py-1 font-medium"
              >
                {explainingId === snippet._id ? "Explaining..." : "Explain with AI"}
              </button>
            </div>
            <SyntaxHighlighter language={snippet.language} style={oneDark} customStyle={{ margin: 0 }}>
              {snippet.code}
            </SyntaxHighlighter>
            {explanationBySnippet[snippet._id] && (
              <div className="border-t border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-800">
                <p className="mb-1 font-semibold text-zinc-950">AI Explanation</p>
                <p className="whitespace-pre-wrap">{explanationBySnippet[snippet._id]}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

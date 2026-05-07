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
    <div className="surface-panel fade-in rounded-2xl p-4">
      <h3 className="heading-font mb-2 text-lg font-semibold text-slate-900">Code Snippets</h3>
      <p className="mb-4 text-xs text-slate-500">Generate, store, and explain snippets with syntax highlighting.</p>
      <div className="mb-3 grid gap-2">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe what you want AI to build..."
          className="glow-input min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400"
        />
        <button
          onClick={generateFromPrompt}
          className="w-fit rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
        >
          {isGenerating ? "Generating..." : "Generate with AI"}
        </button>
        {generateError && <p className="text-sm text-red-500">{generateError}</p>}
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="glow-input rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
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
          className="glow-input min-h-28 rounded-xl border border-slate-200 bg-slate-950 px-3 py-3 font-mono text-sm text-slate-100 placeholder:text-slate-400"
        />
        <button onClick={saveSnippet} className="w-fit rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-200">
          Save Snippet
        </button>
      </div>

      <div className="space-y-3">
        {snippets.map((snippet) => (
          <div key={snippet._id} className="card-hover overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 text-xs text-slate-500">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 font-mono uppercase tracking-[0.2em] text-slate-500">
                {snippet.language}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(snippet.code)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-600"
                >
                  Copy
                </button>
                <button
                  onClick={() => explainSnippet(snippet)}
                  className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 font-medium text-sky-700"
                >
                  {explainingId === snippet._id ? "Explaining..." : "Explain"}
                </button>
              </div>
            </div>
            <SyntaxHighlighter language={snippet.language} style={oneDark} customStyle={{ margin: 0 }}>
              {snippet.code}
            </SyntaxHighlighter>
            {explanationBySnippet[snippet._id] && (
              <div className="border-t border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">AI Explanation</p>
                <p className="whitespace-pre-wrap leading-6">{explanationBySnippet[snippet._id]}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

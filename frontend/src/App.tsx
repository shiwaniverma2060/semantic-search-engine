import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
const API_URL = "https://semantic-search-engine-production-c615.up.railway.app";

interface SearchResult {
  id: string;
  score: number;
  text: string;
  title: string;
  source: string;
}

interface Stats {
  total_documents: number;
  dimensions: number;
  model: string;
  search_type: string;
}

const EXAMPLES = [
  "how do neural networks learn",
  "javascript UI library",
  "storing and retrieving data",
  "AI and machine learning",
];

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [typed, setTyped] = useState("");
  const [heroComplete, setHeroComplete] = useState(false);
  const [showIngest, setShowIngest] = useState(false);
  const [uploadTab, setUploadTab] = useState("text");
  const [iTitle, setITitle] = useState("");
  const [iText, setIText] = useState("");
  const [iSource, setISource] = useState("");
  const [iLoading, setILoading] = useState(false);
  const [iMsg, setIMsg] = useState("");
  const [iProgress, setIProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragover, setDragover] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_documents: 0, dimensions: 384,
    model: "MiniLM", search_type: "Semantic"
  });

  const hero = "Search that understands meaning.";

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setTyped(hero.slice(0, i));
      i++;
      if (i > hero.length) { clearInterval(t); setHeroComplete(true); }
    }, 45);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/stats`).then(r => setStats(r.data)).catch(() => {});
  }, []);

  const doSearch = async (q?: string) => {
    const sq = q || query;
    if (!sq.trim()) return;
    if (q) setQuery(q);
    setLoading(true); setError(""); setSearched(true); setResults([]);
    const t0 = Date.now();
    try {
      const r = await axios.get(`${API_URL}/search`, { params: { query: sq, top_k: 10 } });

      setHistory(prev => {
        const updated = [sq, ...prev.filter(h => h !== sq)].slice(0, 8);
        return updated;
      });
      setResults(r.data.results);
      setSearchTime(Date.now() - t0);
    } catch {
      setError("Backend not running. Start with: uvicorn app.main:app --reload");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    if (!iTitle) setITitle(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const doIngest = async () => {
    if (uploadTab === "file") {
      if (!selectedFile) return;
      setILoading(true); setIMsg(""); setIProgress(0);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("title", iTitle || selectedFile.name);
        formData.append("source", iSource);
        setIProgress(30);
        await axios.post(`${API_URL}/ingest-file`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (e.total) setIProgress(Math.round((e.loaded / e.total) * 60));
          }
        });
        setIProgress(100);
        setIMsg("ok");
        setSelectedFile(null); setITitle(""); setISource("");
        const r = await axios.get(`${API_URL}/stats`);
        setStats(r.data);
      } catch {
        setIMsg("fail");
      } finally {
        setILoading(false);
      }
    } else {
      if (!iTitle.trim() || !iText.trim()) return;
      setILoading(true); setIMsg(""); setIProgress(0);
      try {
        setIProgress(40);
        await axios.post(`${API_URL}/ingest`, { title: iTitle, text: iText, source: iSource });
        setIProgress(100);
        setIMsg("ok");
        setITitle(""); setIText(""); setISource("");
        const r = await axios.get(`${API_URL}/stats`);
        setStats(r.data);
      } catch {
        setIMsg("fail");
      } finally {
        setILoading(false);
      }
    }
  };

  const scoreColor = (s: number) => s >= 0.7 ? "#10b981" : s >= 0.5 ? "#f59e0b" : "#64748b";
  const scoreLabel = (s: number) => s >= 0.7 ? "High" : s >= 0.5 ? "Med" : "Low";
  const formatSize = (b: number) => b < 1024*1024 ? `${(b/1024).toFixed(1)} KB` : `${(b/(1024*1024)).toFixed(1)} MB`;

  const STATS = [
    { key: "Indexed", val: String(stats.total_documents) },
    { key: "Model", val: stats.model },
    { key: "Dimensions", val: String(stats.dimensions) },
    { key: "Search", val: stats.search_type },
  ];

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <div className="nav-logo">S</div>
          <span className="nav-title">SemanticSearch</span>
          <span className="nav-badge">AI</span>
        </div>
        <div className="nav-center">
          <button className={!showIngest ? "nav-tab active" : "nav-tab"} onClick={() => setShowIngest(false)}>Search</button>
          <button className={showIngest ? "nav-tab active" : "nav-tab"} onClick={() => setShowIngest(true)}>Index</button>
        </div>
        <div className="nav-right">
          <button className="nav-add-btn" onClick={() => setShowIngest(true)}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            Add Document
          </button>
        </div>
      </nav>

      {!showIngest ? (
        <div>
          <div className="hero">
            <div className="hero-pill">
              <span className="pill-dot" />
              sentence-transformers + Pinecone vector search
            </div>
            <h1 className="hero-h1">
              {typed}{!heroComplete && <span className="cursor">|</span>}
            </h1>
            <p className="hero-sub">
              Vector embeddings find what you mean, not just what you type.
              Built with FastAPI, Pinecone, React and TypeScript.
            </p>
            <div className="stats-grid">
              {STATS.map((s) => (
                <div key={s.key} className="stat-item">
                  <span className="stat-val">{s.val}</span>
                  <span className="stat-key">{s.key}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="search-zone">
            <div className="search-wrap">
              <div className="s-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <input
                className="s-input" type="text"
                placeholder="Ask anything in natural language..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && doSearch()}
              />
              <button className="s-btn" onClick={() => doSearch()} disabled={loading}>
                {loading ? <div className="spin" /> : "Search"}
              </button>
            </div>

            {history.length > 0 && (
              <div className="history-wrap">
                <span className="history-lbl">Recent:</span>
                {history.map((h, i) => (
                  <button key={i} className="history-chip" onClick={() => doSearch(h)}>
                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                    </svg>
                    {h}
                  </button>
                ))}
              </div>
            )}
            <div className="chips">
              <span className="chips-lbl">Try:</span>
              {EXAMPLES.map((q) => (
                <button key={q} className="chip" onClick={() => doSearch(q)}>{q}</button>
              ))}
            </div>
          </div>

          <div className="results-zone">
            {error && <div className="err"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>{error}</div>}

            {searched && !loading && !error && (
              <div className="meta">
                <span className="meta-txt">
                  {results.length > 0
                    ? <>{results.length} results for <strong>"{query}"</strong></>
                    : <>No results found for "{query}"</>}
                </span>
                {results.length > 0 && <span className="meta-badge"><span className="badge-dot" />{searchTime}ms</span>}
              </div>
            )}

            {loading && (
              <div className="skeleton-list">
                {[1,2,3].map(i => (
                  <div key={i} className="skeleton-card">
                    <div className="sk-line sk-title" />
                    <div className="sk-line sk-body1" />
                    <div className="sk-line sk-body2" />
                  </div>
                ))}
              </div>
            )}

            {!searched && !loading && (
              <div className="empty">
                <div className="empty-svg-wrap">
                  <svg width="28" height="28" fill="none" stroke="#818cf8" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"/>
                  </svg>
                </div>
                <h3>AI-Powered Semantic Search</h3>
                <p>This engine understands <em>meaning</em>, not just keywords. Try a question in plain English.</p>
              </div>
            )}

            <div className="cards">
              {results.map((r, i) => (
                <div key={r.id} className="card" style={{ animationDelay: `${i * 55}ms` }}>
                  <div className="card-top">
                    <div className="c-num">{i + 1}</div>
                    <h3 className="c-title">{r.title}</h3>
                    <div className="c-score" style={{ color: scoreColor(r.score) }}>
                      <div className="score-track">
                        <div className="score-fill" style={{ width: `${r.score * 100}%`, background: scoreColor(r.score) }} />
                      </div>
                      {scoreLabel(r.score)} {Math.round(r.score * 100)}%
                    </div>
                  </div>
                  <p className="c-body">{r.text}</p>
                  {r.source && (
                    <div className="c-foot">
                      <span className="c-dot" />
                      <span className="c-src">{r.source}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="ingest-wrap">
          <div className="ingest-card">
            <div className="ingest-icon-wrap">
              <svg width="18" height="18" fill="none" stroke="#818cf8" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8-4-4m0 0L8 8m4-4v12"/>
              </svg>
            </div>
            <h2 className="ingest-h">Add Document to Index</h2>
            <p className="ingest-p">Upload a PDF, Word doc, or paste text. It becomes instantly searchable using AI.</p>

            <div className="upload-tabs">
              <button className={uploadTab === "text" ? "upload-tab active" : "upload-tab"} onClick={() => setUploadTab("text")}>Paste Text</button>
              <button className={uploadTab === "file" ? "upload-tab active" : "upload-tab"} onClick={() => setUploadTab("file")}>Upload PDF / DOCX</button>
            </div>

            {uploadTab === "file" ? (
              <div>
                {!selectedFile ? (
                  <div
                    className={dragover ? "upload-drop dragover" : "upload-drop"}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
                    onDragLeave={() => setDragover(false)}
                    onDrop={handleDrop}
                  >
                    <div className="upload-icon">
                      <svg width="18" height="18" fill="none" stroke="#818cf8" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8-4-4m0 0L8 8m4-4v12"/>
                      </svg>
                    </div>
                    <p>Drop your file here or <em>click to browse</em></p>
                    <span>Supports PDF, DOCX, TXT — up to 10MB</span>
                    <input
                      ref={fileRef} type="file" style={{ display: "none" }}
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                  </div>
                ) : (
                  <div className="file-selected">
                    <div className="file-icon">
                      <svg width="16" height="16" fill="none" stroke="#818cf8" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
                      </svg>
                    </div>
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">{formatSize(selectedFile.size)}</span>
                    <button className="file-remove" onClick={() => setSelectedFile(null)}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="field">
                <label>Content</label>
                <textarea placeholder="Paste your document content here..." value={iText} onChange={(e) => setIText(e.target.value)} rows={6} />
              </div>
            )}

            <div className="field">
              <label>Title</label>
              <input type="text" placeholder="e.g. Research Paper on Transformers" value={iTitle} onChange={(e) => setITitle(e.target.value)} />
            </div>
            <div className="field">
              <label>Source URL (optional)</label>
              <input type="text" placeholder="https://arxiv.org/abs/..." value={iSource} onChange={(e) => setISource(e.target.value)} />
            </div>

            {iLoading && iProgress > 0 && (
              <div className="progress-wrap">
                <div className="progress-label">
                  <span>Indexing document...</span>
                  <span>{iProgress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${iProgress}%` }} />
                </div>
              </div>
            )}

            {iMsg === "ok" && <div className="i-msg ok">Document indexed successfully. It is now searchable.</div>}
            {iMsg === "fail" && <div className="i-msg fail">Failed to index. Make sure the backend is running.</div>}

            <button
              className="i-btn" onClick={doIngest}
              disabled={iLoading || (uploadTab === "file" ? !selectedFile : (!iTitle || !iText))}
            >
              {iLoading ? "Indexing document..." : "Index Document"}
            </button>
          </div>
        </div>
      )}

      <footer>Built with FastAPI · Pinecone · sentence-transformers · React · TypeScript</footer>
    </div>
  );
}

export default App;

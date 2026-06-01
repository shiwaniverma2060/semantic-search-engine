tsx = open('App.tsx', 'r').read()

history_state = '''
  const [history, setHistory] = useState<string[]>([]);
'''

history_search = '''
      setHistory(prev => {
        const updated = [sq, ...prev.filter(h => h !== sq)].slice(0, 8);
        return updated;
      });
'''

history_ui = '''
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
'''

css_history = '''
.history-wrap {
  display: flex; flex-wrap: wrap; align-items: center;
  gap: 7px; margin-top: 10px; padding: 0 2px;
}

.history-lbl { font-size: 11px; color: #1e293b; font-weight: 500; }

.history-chip {
  display: flex; align-items: center; gap: 5px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.05);
  color: #1e293b; padding: 4px 11px; border-radius: 100px;
  font-size: 11px; cursor: pointer; transition: all 0.2s;
  font-family: inherit;
}

.history-chip:hover {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.1);
  color: #475569;
}

.history-chip svg { flex-shrink: 0; opacity: 0.5; }
'''

tsx = tsx.replace(
    '  const [stats, setStats] = useState<Stats>({',
    history_state + '  const [stats, setStats] = useState<Stats>({'
)

tsx = tsx.replace(
    '      setResults(r.data.results);',
    history_search + '      setResults(r.data.results);'
)

tsx = tsx.replace(
    '''            <div className="chips">''',
    history_ui + '''            <div className="chips">'''
)

with open('App.tsx', 'w') as f:
    f.write(tsx)
print("App.tsx updated!")

css = open('App.css', 'r').read()
css = css + css_history
with open('App.css', 'w') as f:
    f.write(css)
print("App.css updated!")
print("Done! Search history added.")
'use client';

import { Logic } from './page.logic';
import { Request } from '../types';

function renderHeader(url: string, copy: () => void, copied: boolean, count: number) {
  return (
    <header>
      <div className="flex items-center justify-between mb-[10px]">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-accent m-0">Developer Tool</p>
        {count > 0 && (
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted m-0 flex items-center gap-2">
            <span className="w-[6px] h-[6px] rounded-full bg-accent animate-pulse"></span>
            Live Listening
          </p>
        )}
      </div>
      <h1 className="text-[34px] font-semibold tracking-tight mb-[12px] text-balance">Webhook Catcher</h1>
      <p className="max-w-[64ch] text-muted m-0">
        Copy your unique URL below and paste it into any service to instantly inspect incoming webhook payloads in real-time.
      </p>
    </header>
  );
}

function renderUrl(url: string, copy: () => void, copied: boolean) {
  return (
    <section>
      <h2 className="text-[13px] font-mono font-semibold tracking-[0.1em] uppercase text-muted m-0 mb-[16px] pb-[8px] border-b border-line">Your URL</h2>
      <div className="bg-surface border border-line rounded-[3px] p-[16px] md:p-[18px]">
        <div className="flex items-center gap-[16px]">
          <code className="font-mono text-[15px] flex-1 text-ink select-all overflow-x-auto m-0 p-0 bg-transparent border-0">{url || 'Generating...'}</code>
          <button onClick={copy} className="bg-accent text-surface px-[16px] py-[6px] rounded-[3px] font-medium text-[14px] hover:opacity-90 transition-opacity flex items-center gap-[4px] whitespace-nowrap min-w-[110px] justify-center">
            {copied ? (
              <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>Copied!</>
            ) : (
              <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>Copy URL</>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function renderItem(req: Request) {
  return (
    <div key={req.id} className="bg-surface border border-line rounded-[3px] overflow-hidden">
      <div className="bg-surface-2 border-b border-line px-[16px] py-[12px] flex items-center justify-between font-mono text-[12px]">
        <div className="flex items-center gap-[12px]">
          <span className={`px-[6px] py-[2px] rounded-[2px] font-bold ${req.method === 'POST' ? 'bg-accent-soft text-accent' : req.method === 'GET' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-line text-ink'}`}>{req.method}</span>
          <span className="text-muted">{new Date(req.timestamp * 1000).toLocaleTimeString()}</span>
        </div>
        <span className="text-faint truncate max-w-[200px]" title={req.url}>{req.url}</span>
      </div>
      <div className="p-[16px] flex flex-col gap-[16px]">
        <div>
          <h3 className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted mb-[8px] m-0">Headers</h3>
          <div className="bg-surface-2 border border-line rounded-[3px] p-[12px] overflow-x-auto">
            <pre className="font-mono text-[13px] text-ink m-0">{JSON.stringify(req.headers, null, 2)}</pre>
          </div>
        </div>
        {req.body_str && (
          <div>
            <h3 className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted mb-[8px] m-0">Body</h3>
            <div className="bg-ink border border-line rounded-[3px] p-[12px] overflow-x-auto">
              <pre className="font-mono text-[13px] text-surface m-0">{req.body_json ? JSON.stringify(req.body_json, null, 2) : req.body_str}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderList(items: Request[]) {
  return (
    <section>
      <h2 className="text-[13px] font-mono font-semibold tracking-[0.1em] uppercase text-muted m-0 mb-[16px] pb-[8px] border-b border-line flex justify-between items-end">
        <span>Caught Requests ({items.length})</span>
        {items.length === 0 && <span className="text-[11px] text-accent flex items-center gap-[4px]"><span className="w-[6px] h-[6px] rounded-full bg-accent animate-pulse"></span>Waiting for data...</span>}
      </h2>
      <div className="flex flex-col gap-[2px]">
        {items.length === 0 ? (
          <div className="bg-surface border border-line rounded-[3px] p-[32px] text-center"><p className="text-muted text-[14px] m-0 font-mono">No requests caught yet. Send a POST request to your URL!</p></div>
        ) : items.map(renderItem)}
      </div>
    </section>
  );
}

function view() {
  const { url, copy, copied, items } = Logic.get();
  return (
    <div className="max-w-[1180px] mx-auto px-[28px] py-[56px] pb-[96px] flex flex-col gap-[44px]">
      {renderHeader(url, copy, copied, items.length)}
      {renderUrl(url, copy, copied)}
      {renderList(items)}
    </div>
  );
}

export default view;

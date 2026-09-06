import { useState, useEffect } from 'react';
import { Request, State } from '../types';

function get(): State {
  const [id, setId] = useState<string>('');
  const [items, setItems] = useState<Request[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(function init() {
    setId(Math.random().toString(36).substring(2, 10));
  }, []);

  useEffect(function start() {
    if (!id) return;

    function poll() {
      fetch(`/api/webhook/${id}/history`)
        .then(function parse(res: Response) {
          if (!res.ok) throw new Error('Fetch failed');
          return res.json();
        })
        .then(function update(data: { data: Request[] }) {
          if (data.data) setItems(data.data);
        })
        .catch(function log(err: unknown) {
          console.error(err);
        });
    }

    const interval = setInterval(poll, 2000);
    return function stop() {
      clearInterval(interval);
    };
  }, [id]);

  const url = typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/${id}` : '';

  function copy(): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url);
    } else {
      const area = document.createElement("textarea");
      area.value = url;
      area.style.position = "absolute";
      area.style.left = "-999999px";
      document.body.prepend(area);
      area.select();
      try { document.execCommand('copy'); } catch (e) { console.error(e); }
      area.remove();
    }
    setCopied(true);
    setTimeout(function reset() {
      setCopied(false);
    }, 2000);
  }

  return { id, items, copied, copy, url };
}

const Logic = { get };
export { Logic };

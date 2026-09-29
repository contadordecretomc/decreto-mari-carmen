import { useState } from 'react';

// mailto: links don't open for every viewer (embedded frames, no mail client
// configured), so every card also lets people copy the address and the text.
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle');

  function copy() {
    navigator.clipboard
      .writeText(text)
      .then(() => setState('ok'))
      .catch(() => setState('fail'))
      .finally(() => setTimeout(() => setState('idle'), 1800));
  }

  return (
    <button type="button" className="copy-btn" onClick={copy}>
      {state === 'ok' ? 'Copiado' : state === 'fail' ? 'Selecciónalo a mano' : label}
    </button>
  );
}

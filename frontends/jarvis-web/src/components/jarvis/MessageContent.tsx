'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

interface MessageContentProps {
  content: string;
}

interface ParsedBlock {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

function parseMessageBlocks(content: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const regex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    blocks.push({
      type: 'code',
      language: match[1] || undefined,
      content: match[2].replace(/\n$/, ''),
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    blocks.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return blocks.length ? blocks : [{ type: 'text', content }];
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [code]);

  return (
    <div className="mt-2 rounded-lg overflow-hidden border border-white/10 bg-black/40">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-white/[0.03]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="flex items-center gap-1 text-[10px] font-mono text-jarvis-cyan/80 hover:text-jarvis-cyan transition-colors px-2 py-0.5 rounded"
          aria-label="Copiar código"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-xs sm:text-sm leading-relaxed font-mono text-gray-200 hud-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TextBlock({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const pathMatch = line.match(/^###\s+📁\s+`([^`]+)`/);
        const purposeMatch = line.match(/^\*\*Propósito:\*\*\s*(.+)/);

        if (pathMatch) {
          return (
            <p key={i} className="mt-3 first:mt-0 flex items-center gap-2 text-sm font-mono text-jarvis-gold/90">
              <span aria-hidden="true">📁</span>
              <span className="text-jarvis-cyan">{pathMatch[1]}</span>
            </p>
          );
        }

        if (purposeMatch) {
          return (
            <p key={i} className="text-xs text-gray-400 italic">
              {purposeMatch[1]}
            </p>
          );
        }

        if (line.startsWith('```') || line.trim() === '---') return null;

        return (
          <p key={i} className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {line || '\u00A0'}
          </p>
        );
      })}
    </div>
  );
}

export function MessageContent({ content }: MessageContentProps) {
  const blocks = parseMessageBlocks(content);
  const hasCode = blocks.some((b) => b.type === 'code');

  if (!hasCode) {
    return <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div className="space-y-1">
      {blocks.map((block, i) =>
        block.type === 'code' ? (
          <CodeBlock key={i} code={block.content} language={block.language} />
        ) : (
          <TextBlock key={i} text={block.content} />
        ),
      )}
    </div>
  );
}

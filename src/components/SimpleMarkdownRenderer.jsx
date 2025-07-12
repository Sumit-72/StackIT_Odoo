import React from 'react';

const renderWithMarkdown = (text) => {
  // Regex for underline (double underscore or <u>text</u>)
  const underlineRegex = /(__)([^_]+?)\1|<u>(.+?)<\/u>/g;
  // Regex for bold (**text**)
  const boldRegex = /(\*\*)([^*]+?)\1/g;
  // Regex for italic (*text*)
  const italicRegex = /(\*)([^*]+?)\1/g;

  // First, handle underline
  let elements = [];
  let lastIndex = 0;
  let match;
  let input = text;

  // Underline
  while ((match = underlineRegex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      elements.push(input.slice(lastIndex, match.index));
    }
    const underlineText = match[2] || match[3];
    elements.push(<u key={match.index} className="underline">{underlineText}</u>);
    lastIndex = underlineRegex.lastIndex;
  }
  if (lastIndex < input.length) {
    elements.push(input.slice(lastIndex));
  }

  // Now, for each element, handle bold and italic
  elements = elements.flatMap((el, i) => {
    if (typeof el !== 'string') return el;
    // Bold
    let boldParts = [];
    let lastBold = 0;
    let boldMatch;
    while ((boldMatch = boldRegex.exec(el)) !== null) {
      if (boldMatch.index > lastBold) {
        boldParts.push(el.slice(lastBold, boldMatch.index));
      }
      boldParts.push(<strong key={`b${i}-${boldMatch.index}`} className="font-semibold">{boldMatch[2]}</strong>);
      lastBold = boldRegex.lastIndex;
    }
    if (lastBold < el.length) {
      boldParts.push(el.slice(lastBold));
    }
    // Italic
    let italicParts = [];
    boldParts.forEach((part, j) => {
      if (typeof part !== 'string') {
        italicParts.push(part);
        return;
      }
      let lastItalic = 0;
      let italicMatch;
      while ((italicMatch = italicRegex.exec(part)) !== null) {
        if (italicMatch.index > lastItalic) {
          italicParts.push(part.slice(lastItalic, italicMatch.index));
        }
        italicParts.push(<em key={`i${i}-${j}-${italicMatch.index}`} className="italic">{italicMatch[2]}</em>);
        lastItalic = italicRegex.lastIndex;
      }
      if (lastItalic < part.length) {
        italicParts.push(part.slice(lastItalic));
      }
    });
    return italicParts;
  });

  return elements;
};

const SimpleMarkdownRenderer = ({ content }) => {
  if (!content) return null;

  const convertHtmlToText = (htmlContent) => {
    if (typeof htmlContent !== 'string') return htmlContent;
    let text = htmlContent
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<br\s*\/?/g, '\n')
      .replace(/<strong>/g, '**')
      .replace(/<\/strong>/g, '**')
      .replace(/<b>/g, '**')
      .replace(/<\/b>/g, '**')
      .replace(/<em>/g, '*')
      .replace(/<\/em>/g, '*')
      .replace(/<i>/g, '*')
      .replace(/<\/i>/g, '*')
      .replace(/<u>/g, '__')
      .replace(/<\/u>/g, '__')
      .replace(/<h1>/g, '\n# ')
      .replace(/<\/h1>/g, '\n')
      .replace(/<h2>/g, '\n## ')
      .replace(/<\/h2>/g, '\n')
      .replace(/<h3>/g, '\n### ')
      .replace(/<\/h3>/g, '\n')
      .replace(/<ul>/g, '\n')
      .replace(/<\/ul>/g, '\n')
      .replace(/<ol>/g, '\n')
      .replace(/<\/ol>/g, '\n')
      .replace(/<li>/g, '• ')
      .replace(/<\/li>/g, '\n')
      .replace(/<code>/g, '`')
      .replace(/<\/code>/g, '`')
      .replace(/<pre>/g, '\n```\n')
      .replace(/<\/pre>/g, '\n```\n')
      .replace(/<a\s+href="([^"]*)"[^>]*>/g, '[$1](')
      .replace(/<\/a>/g, ')')
      .replace(/<[^>]*>/g, '');
    text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
    text = text.trim();
    return text;
  };

  const cleanText = convertHtmlToText(content);
  const lines = cleanText.split('\n');

  // Group lines into blocks: paragraphs, ordered lists, unordered lists
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Ordered list: 1. text, 2. text, ...
    if (/^\d+\.\s+/.test(line)) {
      const olItems = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        olItems.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items: olItems });
      continue;
    }
    // Unordered list: - text, * text, • text
    if (/^([-*•])\s+/.test(line)) {
      const ulItems = [];
      while (i < lines.length && /^([-*•])\s+/.test(lines[i])) {
        ulItems.push(lines[i].replace(/^([-*•])\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items: ulItems });
      continue;
    }
    // Paragraph or other
    blocks.push({ type: 'p', text: line });
    i++;
  }

  return (
    <div className="text-gray-600 leading-relaxed overflow-hidden">
      {blocks.map((block, idx) => {
        if (block.type === 'ol') {
          return (
            <ol key={idx} className="list-decimal list-inside mb-3 ml-6">
              {block.items.map((item, i) => (
                <li key={i}>{renderWithMarkdown(item)}</li>
              ))}
            </ol>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={idx} className="list-disc list-inside mb-3 ml-6">
              {block.items.map((item, i) => (
                <li key={i}>{renderWithMarkdown(item)}</li>
              ))}
            </ul>
          );
        }
        // Paragraph, heading, code, etc.
        const line = block.text;
        if (line.trim() === '') {
          return <br key={idx} />;
        }
        if (line.startsWith('# ')) {
          return <h1 key={idx} className="text-xl font-bold text-black mb-2">{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-lg font-semibold text-black mb-2">{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={idx} className="text-base font-semibold text-black mb-1">{line.substring(4)}</h3>;
        }
        if (line.startsWith('```')) {
          return <div key={idx} className="bg-gray-100 p-2 rounded my-2 font-mono text-sm">{line.substring(3)}</div>;
        }
        return <p key={idx} className="mb-2">{renderWithMarkdown(line)}</p>;
      })}
    </div>
  );
};

export default SimpleMarkdownRenderer; 
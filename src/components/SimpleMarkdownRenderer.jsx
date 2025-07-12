import React from 'react';

const SimpleMarkdownRenderer = ({ content }) => {
  if (!content) return null;

  const convertHtmlToText = (htmlContent) => {
    if (typeof htmlContent !== 'string') return htmlContent;
    
    let text = htmlContent
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<strong>/g, '**')
      .replace(/<\/strong>/g, '**')
      .replace(/<b>/g, '**')
      .replace(/<\/b>/g, '**')
      .replace(/<em>/g, '*')
      .replace(/<\/em>/g, '*')
      .replace(/<i>/g, '*')
      .replace(/<\/i>/g, '*')
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
    
    text = text
      .replace(/\*\s+/g, '*')
      .replace(/\s+\*/g, '*')
      .replace(/\*\*\s+/g, '**')
      .replace(/\s+\*\*/g, '**');
    
    return text;
  };

  const cleanText = convertHtmlToText(content);

  return (
    <div className="text-gray-600 leading-relaxed overflow-hidden">
      {cleanText.split('\n').map((line, index) => {
        if (line.trim() === '') {
          return <br key={index} />;
        }
        
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-xl font-bold text-black mb-2">{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-lg font-semibold text-black mb-2">{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-base font-semibold text-black mb-1">{line.substring(4)}</h3>;
        }
        
        if (line.includes('**')) {
          const parts = line.split('**');
          if (parts.length > 2 && parts.length % 2 === 1) {
            return (
              <p key={index} className="mb-2">
                {parts.map((part, partIndex) => 
                  partIndex % 2 === 1 ? 
                    <strong key={partIndex} className="font-semibold">{part}</strong> : 
                    part
                )}
              </p>
            );
          }
        }
        
        if (line.includes('*') && !line.includes('**')) {
          const parts = line.split('*');
          if (parts.length > 2 && parts.length % 2 === 1) {
            return (
              <p key={index} className="mb-2">
                {parts.map((part, partIndex) => 
                  partIndex % 2 === 1 ? 
                    <em key={partIndex} className="italic">{part}</em> : 
                    part
                )}
              </p>
            );
          }
        }
        
        if (line.startsWith('```')) {
          return <div key={index} className="bg-gray-100 p-2 rounded my-2 font-mono text-sm">{line.substring(3)}</div>;
        }
        
        if (line.includes('`')) {
          const parts = line.split('`');
          return (
            <p key={index} className="mb-2">
              {parts.map((part, partIndex) => 
                partIndex % 2 === 1 ? 
                  <code key={partIndex} className="bg-gray-100 px-1 rounded text-sm font-mono">{part}</code> : 
                  part
              )}
            </p>
          );
        }
        
        if (line.startsWith('• ')) {
          return <p key={index} className="mb-1 ml-4">• {line.substring(2)}</p>;
        }
        
        const cleanLine = line.replace(/\*([^*]+)\*/g, '$1');
        return <p key={index} className="mb-2">{cleanLine}</p>;
      })}
    </div>
  );
};

export default SimpleMarkdownRenderer; 
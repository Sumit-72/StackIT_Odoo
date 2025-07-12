import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize heading styles
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 text-foreground">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base font-semibold mb-2 text-foreground">{children}</h4>,
          h5: ({ children }) => <h5 className="text-sm font-semibold mb-1 text-foreground">{children}</h5>,
          h6: ({ children }) => <h6 className="text-xs font-semibold mb-1 text-foreground">{children}</h6>,
          
          // Customize paragraph styles
          p: ({ children }) => <p className="mb-3 text-foreground leading-relaxed">{children}</p>,
          
          // Customize list styles
          ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-foreground">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-foreground">{children}</ol>,
          li: ({ children }) => <li className="text-foreground">{children}</li>,
          
          // Customize code styles
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>;
            }
            return <code className={className}>{children}</code>;
          },
          pre: ({ children }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-3 border">
              {children}
            </pre>
          ),
          
          // Customize blockquote styles
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-muted-foreground pl-4 italic text-muted-foreground mb-3">
              {children}
            </blockquote>
          ),
          
          // Customize link styles
          a: ({ children, href }) => (
            <a 
              href={href} 
              className="text-primary underline hover:text-primary/80 transition-colors"
              target="_blank" 
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          
          // Customize table styles
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border-collapse border border-border">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
          th: ({ children }) => <th className="border border-border px-3 py-2 text-left font-semibold text-foreground">{children}</th>,
          td: ({ children }) => <td className="border border-border px-3 py-2 text-foreground">{children}</td>,
          
          // Customize horizontal rule
          hr: () => <hr className="border-t border-border my-4" />,
          
          // Customize strong and emphasis
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-foreground">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer; 
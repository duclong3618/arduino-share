"use client";

import { useEffect, useRef } from "react";
import Prism from "prismjs";

// Load arduino language chain: clike → cpp → arduino
import "prismjs/components/prism-clike";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-arduino";

interface ArduinoCodeBlockProps {
  code: string;
  className?: string;
}

export function ArduinoCodeBlock({ code, className = "" }: ArduinoCodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code]);

  return (
    <pre
      className={`overflow-x-auto rounded-lg border border-border p-4 text-sm bg-[hsl(240,10%,5.5%)] ${className}`}
      style={{ margin: 0 }}
    >
      <code ref={codeRef} className="language-arduino font-mono text-sm">
        {code}
      </code>
    </pre>
  );
}

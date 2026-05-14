"use client";
import { useEffect, useRef, useState } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

const IFRAME_CSS = `
  * { box-sizing: border-box; }
  body {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    color: #111;
    overflow: hidden;
  }
  h1, h2, h3, h4 { font-weight: 600; margin: 0.75em 0 0.25em; }
  h1 { font-size: 1.4em; }
  h2 { font-size: 1.15em; }
  h3 { font-size: 1em; }
  p { margin: 0.4em 0; }
  ul, ol { padding-left: 1.4em; margin: 0.4em 0; }
  li { margin: 0.15em 0; }
  strong { font-weight: 600; }
  code {
    background: #f0f0f0;
    padding: 0.1em 0.35em;
    border-radius: 3px;
    font-family: ui-monospace, monospace;
    font-size: 0.875em;
  }
  pre {
    background: #f5f5f5;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    padding: 0.75em 1em;
    overflow-x: auto;
    margin: 0.5em 0;
  }
  pre code { background: none; padding: 0; font-size: 0.85em; }
  .callout {
    padding: 0.6em 1em;
    border-radius: 6px;
    border-left: 3px solid;
    margin: 0.5em 0;
    font-size: 0.9em;
  }
  .callout-info    { background: #eff6ff; border-color: #3b82f6; }
  .callout-warning { background: #fffbeb; border-color: #f59e0b; }
  .callout-error   { background: #fef2f2; border-color: #ef4444; }
  .callout-success { background: #f0fdf4; border-color: #22c55e; }
  blockquote {
    border-left: 3px solid #d1d5db;
    margin: 0.5em 0;
    padding-left: 1em;
    color: #555;
  }
  a { color: #2563eb; }
  hr { border: none; border-top: 1px solid #e5e5e5; margin: 0.75em 0; }
  table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
  th, td { border: 1px solid #e5e5e5; padding: 0.3em 0.6em; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }
`;

function preprocessMdx(content: string): string {
	return content.replace(
		/<Callout\s+type="([^"]+)">([\s\S]*?)<\/Callout>/g,
		(_, type, inner) =>
			`<div class="callout callout-${type}">${inner.trim()}</div>`
	);
}

async function toHtml(content: string): Promise<string> {
	const preprocessed = preprocessMdx(content);
	const result = await unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeRaw)
		.use(rehypeStringify)
		.process(preprocessed);
	return String(result);
}

function buildSrcdoc(html: string): string {
	return `<!doctype html><html><head><meta charset="utf-8"><style>${IFRAME_CSS}</style></head><body>${html}</body></html>`;
}

export function MdxFrame({ content }: { content: string }) {
	const [srcdoc, setSrcdoc] = useState("");
	const [height, setHeight] = useState(0);
	const iframeRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		toHtml(content).then((html) => setSrcdoc(buildSrcdoc(html)));
	}, [content]);

	function handleLoad() {
		const doc = iframeRef.current?.contentDocument;
		if (doc) setHeight(doc.body.scrollHeight + 16);
	}

	if (!srcdoc) return null;

	return (
		<iframe
			ref={iframeRef}
			srcDoc={srcdoc}
			sandbox="allow-same-origin"
			onLoad={handleLoad}
			style={{
				border: "none",
				width: "100%",
				height: height || "auto",
				display: "block",
				minHeight: 24
			}}
		/>
	);
}

import React from 'react'

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g

export function renderMarkdownText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let last = 0, key = 0, m: RegExpExecArray | null
  LINK_RE.lastIndex = 0
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const href = m[2].trimStart()
    if (!href.toLowerCase().startsWith('javascript:'))
      parts.push(React.createElement('a', { key: key++, href, target:"_blank" }, m[1]))
    else
      parts.push(m[1])
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length ? parts : text
}

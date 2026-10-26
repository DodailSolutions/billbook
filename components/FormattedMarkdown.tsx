'use client'

import React from 'react'

interface FormattedMarkdownProps {
  content: string
}

export function FormattedMarkdown({ content }: FormattedMarkdownProps) {
  // Split into blocks by double newlines or table boundaries
  const lines = content.split('\n')
  const blocks: React.ReactNode[] = []
  
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // Check for markdown table (line starts and ends with |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }

      if (tableLines.length >= 2) {
        const headerRow = tableLines[0]
        const dataRows = tableLines.filter((_, idx) => idx !== 1) // skip the separator row (|---|---|)
        const headers = headerRow.split('|').filter(c => c.trim().length > 0).map(c => c.trim())

        blocks.push(
          <div key={`table-${key++}`} className="my-3 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">
                      {renderInlineText(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {dataRows.slice(1).map((row, rIdx) => {
                  const cells = row.split('|').filter((_, cIdx, arr) => cIdx > 0 && cIdx < arr.length - 1).map(c => c.trim())
                  return (
                    <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-gray-800 dark:text-gray-300 whitespace-nowrap">
                          {renderInlineText(cell)}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
        continue
      }
    }

    // Headers
    if (line.startsWith('#### ')) {
      blocks.push(
        <h4 key={`h4-${key++}`} className="font-bold text-gray-900 dark:text-white text-sm sm:text-base mt-3 mb-1">
          {renderInlineText(line.replace('#### ', ''))}
        </h4>
      )
      i++
      continue
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${key++}`} className="font-bold text-gray-900 dark:text-white text-base sm:text-lg mt-3 mb-1.5 flex items-center gap-1.5">
          {renderInlineText(line.replace('### ', ''))}
        </h3>
      )
      i++
      continue
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${key++}`} className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl mt-4 mb-2">
          {renderInlineText(line.replace('## ', ''))}
        </h2>
      )
      i++
      continue
    }

    // Unordered lists (- or *)
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const listItems: string[] = []
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        listItems.push(lines[i].trim().replace(/^[-*]\s+/, ''))
        i++
      }

      blocks.push(
        <ul key={`ul-${key++}`} className="list-disc list-inside space-y-1 my-2 text-xs sm:text-sm text-gray-800 dark:text-gray-200">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineText(item)}
            </li>
          ))}
        </ul>
      )
      continue
    }

    // Numbered lists (1. , 2. )
    if (/^\d+\.\s+/.test(line.trim())) {
      const listItems: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i++
      }

      blocks.push(
        <ol key={`ol-${key++}`} className="list-decimal list-inside space-y-1 my-2 text-xs sm:text-sm text-gray-800 dark:text-gray-200">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineText(item)}
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Empty lines
    if (!line.trim()) {
      i++
      continue
    }

    // Normal paragraph
    blocks.push(
      <p key={`p-${key++}`} className="text-xs sm:text-sm my-1.5 leading-relaxed text-gray-800 dark:text-gray-200">
        {renderInlineText(line)}
      </p>
    )
    i++
  }

  return <div className="space-y-1">{blocks}</div>
}

/**
 * Parses bold, backticks, and links inside text strings safely
 */
function renderInlineText(text: string): React.ReactNode {
  // Split on bold (**text**) and code (`text`) tokens
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-gray-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px] font-mono text-blue-600 dark:text-blue-400">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

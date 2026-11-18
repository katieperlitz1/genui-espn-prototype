interface StatTableProps {
  title: string
  headers: string[]
  rows: string[][]
}

export function StatTable({ title, headers, rows }: StatTableProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] overflow-hidden">
      <div className="bg-[#1a1a1a] px-3 py-2">
        <h3 className="text-xs font-black text-white uppercase tracking-widest">{title}</h3>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#f0f0f0] border-b border-[#e5e5e5]">
            {headers.map((h, i) => (
              <th
                key={i}
                className={`px-3 py-1.5 text-[10px] font-black text-gray-500 uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-right'}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b border-[#f0f0f0] ${i % 2 === 0 ? 'bg-white' : 'bg-[#f7f7f7]'}`}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-3 py-2 text-[#1a1a1a] ${j === 0 ? 'font-bold text-left' : 'text-right text-gray-600 tabular-nums'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Komponen grafik ringan berbasis SVG (tanpa library tambahan)
// Dipakai di dashboard administrator, admin, dan penyewa.

// Format angka singkat: 1.250.000 -> "1,3 jt", 45.000 -> "45 rb"
export const formatShort = (n) => {
  const v = Number(n || 0);
  if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  if (Math.abs(v) >= 1_000) return `${Math.round(v / 1_000)} rb`;
  return String(Math.round(v));
};

// Kunci & label 6 bulan terakhir (termasuk bulan ini)
export const lastMonths = (count = 6) => {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("id-ID", { month: "short" }),
    };
  });
};

// Jumlahkan nilai per bulan berdasarkan field tanggal
export const sumByMonth = (items, months, dateGetter, valueGetter) =>
  months.map((m) =>
    items
      .filter((it) => String(dateGetter(it) || "").substring(0, 7) === m.key)
      .reduce((s, it) => s + Number(valueGetter(it) || 0), 0)
  );

const polar = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

// ===== PIE CHART (irisan pertama sedikit "keluar" seperti referensi) =====
export function PieChart({ data, size = 150 }) {
  const total = data.reduce((s, d) => s + Number(d.value || 0), 0);

  if (!total) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full bg-gray-100 border-4 border-white shadow-inner flex items-center justify-center text-[11px] text-gray-400 text-center p-4"
      >
        Belum ada data
      </div>
    );
  }

  const cx = 50;
  const cy = 50;
  const r = 42;
  const slices = data.reduce((acc, d) => {
    const start = acc.length ? acc[acc.length - 1].end : -Math.PI / 2;
    const frac = Number(d.value || 0) / total;
    acc.push({ ...d, frac, start, end: start + frac * Math.PI * 2 });
    return acc;
  }, []);

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-sm">
      {slices.map((s, i) => {
        if (!s.frac) return null;
        const mid = (s.start + s.end) / 2;
        const off = i === slices.length - 1 && slices.length > 1 ? 4 : 0;
        const [lx, ly] = polar(cx, cy, r * 0.6, mid);
        let shape;
        if (s.frac >= 0.9999) {
          shape = <circle cx={cx} cy={cy} r={r} fill={s.color} />;
        } else {
          const [x1, y1] = polar(cx, cy, r, s.start);
          const [x2, y2] = polar(cx, cy, r, s.end);
          shape = (
            <path
              d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${s.frac > 0.5 ? 1 : 0} 1 ${x2},${y2} Z`}
              fill={s.color}
              stroke="#fff"
              strokeWidth="1.2"
            />
          );
        }
        return (
          <g key={i} transform={`translate(${Math.cos(mid) * off},${Math.sin(mid) * off})`}>
            {shape}
            {s.frac > 0.07 && (
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fontWeight="700"
                fill={s.textColor || "#fff"}
              >
                {Math.round(s.frac * 100)}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Legend untuk pie chart
export function ChartLegend({ items }) {
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2.5 text-xs sm:text-sm">
          <span className="w-4 h-4 rounded-[4px] flex-shrink-0" style={{ background: it.color }} />
          <span className="text-gray-700 font-medium">{it.label}</span>
          {it.value !== undefined && (
            <span className="ml-auto font-bold text-gray-900">{it.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ===== LINE / AREA CHART (dua seri, seperti "Expense vs Profit") =====
export function LineChart({ labels, series, formatValue = formatShort }) {
  const W = 600;
  const H = 230;
  const padL = 56;
  const padR = 20;
  const padT = 34;
  const padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const allValues = series.flatMap((s) => s.values);
  const maxVal = Math.max(...allValues, 0);
  const top = maxVal > 0 ? maxVal * 1.2 : 4;
  const ticks = [0, 1, 2, 3, 4].map((i) => (top / 4) * i);
  const n = labels.length;

  const xAt = (i) => padL + (n <= 1 ? innerW / 2 : (i * innerW) / (n - 1));
  const yAt = (v) => padT + innerH - (v / top) * innerH;

  const buildPath = (values) =>
    values.reduce((d, v, i) => {
      const x = xAt(i);
      const y = yAt(v);
      if (i === 0) return `M${x},${y}`;
      const px = xAt(i - 1);
      const py = yAt(values[i - 1]);
      const cx = (px + x) / 2;
      return `${d} C${cx},${py} ${cx},${y} ${x},${y}`;
    }, "");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid & label sumbu Y */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={padL}
            x2={W - padR}
            y1={yAt(t)}
            y2={yAt(t)}
            stroke="#e5e7eb"
            strokeDasharray={i === 0 ? "0" : "4 4"}
          />
          <text x={padL - 10} y={yAt(t)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#6b7280" fontWeight="600">
            {formatValue(t)}
          </text>
        </g>
      ))}

      {/* Label sumbu X */}
      {labels.map((l, i) => (
        <text key={l + i} x={xAt(i)} y={H - 8} textAnchor="middle" fontSize="12" fill="#374151" fontWeight="600">
          {l}
        </text>
      ))}

      {/* Seri data */}
      {series.map((s) => {
        const line = buildPath(s.values);
        const area = `${line} L${xAt(n - 1)},${yAt(0)} L${xAt(0)},${yAt(0)} Z`;
        const maxIdx = s.values.indexOf(Math.max(...s.values));
        const hasData = s.values.some((v) => v > 0);
        return (
          <g key={s.label}>
            <path d={area} fill={s.color} fillOpacity="0.14" />
            <path d={line} fill="none" stroke={s.color} strokeWidth="2.6" strokeLinecap="round" />
            {s.values.map((v, i) => (
              <circle key={i} cx={xAt(i)} cy={yAt(v)} r="3" fill="#fff" stroke={s.color} strokeWidth="2" />
            ))}
            {hasData && (
              <g>
                <line x1={xAt(maxIdx)} x2={xAt(maxIdx)} y1={yAt(s.values[maxIdx])} y2={yAt(0)} stroke={s.color} strokeDasharray="3 3" strokeOpacity="0.6" />
                <rect x={xAt(maxIdx) - 48} y={yAt(s.values[maxIdx]) - 26} width="96" height="18" rx="4" fill={s.color} />
                <text x={xAt(maxIdx)} y={yAt(s.values[maxIdx]) - 14} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
                  {s.label} Tertinggi
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ===== BAR HORIZONTAL (seperti "Top 10 Stores by sales") =====
export function HBarList({ items, color = "#3b6e38", emptyText = "Belum ada data" }) {
  const max = Math.max(...items.map((i) => Number(i.value || 0)), 0);
  if (!items.length || max === 0) {
    return <p className="text-xs text-gray-400 text-center py-10">{emptyText}</p>;
  }
  return (
    <div className="space-y-3.5">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-3 text-xs sm:text-[13px]">
          <span className="w-[38%] truncate text-gray-700 font-medium" title={it.label}>
            {it.label}
          </span>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.max(4, (Number(it.value) / max) * 100)}%`, background: color }}
              />
            </div>
            <span className="w-14 text-right font-bold text-gray-800 flex-shrink-0">
              {it.display ?? formatShort(it.value)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

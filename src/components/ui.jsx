// Komponen & helper UI yang dipakai bersama di semua halaman (Sesuai Referensi Desain & Warna Landing Page)

// ===== FORMATTER =====
export const formatRupiah = (angka) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(angka || 0));

export const formatTanggal = (tgl, withTime = false) => {
  if (!tgl) return "—";
  const opt = { day: "2-digit", month: "short", year: "numeric" };
  if (withTime) Object.assign(opt, { hour: "2-digit", minute: "2-digit" });
  return new Date(tgl).toLocaleDateString("id-ID", opt);
};

export const toInputDate = (tgl) => (tgl ? String(tgl).substring(0, 10) : "");

export const todayString = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

export const getErrorMessage = (error, fallback = "Terjadi kesalahan") => {
  const msg = error?.response?.data?.message;
  if (!msg) return fallback;
  if (typeof msg === "string") return msg;
  return Object.values(msg).flat().join("\n");
};

// ===== STATUS BADGE =====
const STATUS_STYLE = {
  // kamar
  tersedia: "bg-[#e2f0d9] text-[#264624] border border-[#b7d4a5]",
  terisi: "bg-blue-100 text-blue-800 border border-blue-200",
  perbaikan: "bg-amber-100 text-amber-800 border border-amber-200",
  nonaktif: "bg-gray-200 text-gray-700",
  // akun
  aktif: "bg-[#e2f0d9] text-[#264624] border border-[#b7d4a5]",
  // kontrak
  menunggu: "bg-amber-100 text-amber-800 border border-amber-300",
  selesai: "bg-gray-200 text-gray-700",
  dibatalkan: "bg-red-100 text-red-700",
  // tagihan
  belum_bayar: "bg-red-100 text-red-700 border border-red-200",
  sebagian: "bg-amber-100 text-amber-800 border border-amber-200",
  lunas: "bg-[#e2f0d9] text-[#264624] border border-[#b7d4a5]",
  // pembayaran
  menunggu_verifikasi: "bg-amber-100 text-amber-800 border border-amber-300",
  diterima: "bg-[#e2f0d9] text-[#264624] border border-[#b7d4a5]",
  ditolak: "bg-red-100 text-red-700",
  // laporan
  diproses: "bg-blue-100 text-blue-800",
  // publikasi
  draft: "bg-gray-200 text-gray-700",
  terbit: "bg-[#e2f0d9] text-[#264624]",
  arsip: "bg-slate-200 text-slate-700",
  // role
  administrator: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  penyewa: "bg-[#e2f0d9] text-[#264624]",
  // fasilitas
  kamar: "bg-sky-100 text-sky-800",
  umum: "bg-teal-100 text-teal-800",
};

export function StatusBadge({ status }) {
  if (!status) return <span className="text-gray-400">—</span>;
  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full capitalize whitespace-nowrap ${
        STATUS_STYLE[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {String(status).replace(/_/g, " ")}
    </span>
  );
}

// ===== LAYOUT HALAMAN =====
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e3a1c] tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </div>
  );
}

export function Loading({ text = "Memuat data..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-4 border-[#264624] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-600 font-medium">{text}</p>
    </div>
  );
}

export function EmptyState({ text = "Belum ada data" }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-gray-400">
      <svg
        className="w-12 h-12 mb-3 text-[#3b6e38]/40"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = "Cari data..." }) {
  return (
    <div className="relative w-full sm:w-72">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3b6e38] shadow-2xs"
      />
    </div>
  );
}

// ===== FORM =====
export const inputClass =
  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#3b6e38] focus:border-[#3b6e38] focus:outline-none block w-full p-2.5 transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500";

export function Field({ label, hint, required, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export function FormActions({ onCancel, saving, submitText = "Simpan" }) {
  return (
    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#f4f7f1] border-t border-gray-200 rounded-b-2xl">
      <button
        type="button"
        onClick={onCancel}
        className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
      >
        Batal
      </button>
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#264624] rounded-xl hover:bg-[#3b6e38] disabled:opacity-60 cursor-pointer shadow-xs"
      >
        {saving && (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {saving ? "Menyimpan..." : submitText}
      </button>
    </div>
  );
}

// ===== BUTTON =====
export function ButtonLink({
  children,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
}) {
  const styles = {
    primary: "text-white bg-[#264624] hover:bg-[#3b6e38] shadow-xs",
    secondary: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50",
    danger: "text-white bg-red-600 hover:bg-red-700",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function IconButton({ onClick, title, color = "green", children }) {
  const colors = {
    green: "text-[#264624] hover:bg-[#e9f2e1]",
    blue: "text-blue-600 hover:bg-blue-50",
    red: "text-red-600 hover:bg-red-50",
    amber: "text-amber-600 hover:bg-amber-50",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-xl transition-colors cursor-pointer ${colors[color]}`}
    >
      {children}
    </button>
  );
}

export const Icons = {
  plus: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  ),
  edit: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  trash: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  eye: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  money: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  back: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  download: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
};

// ===== MODAL =====
export function Modal({ open, onClose, title, children, size = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-xs"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${size} bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-[#264624] text-white rounded-t-2xl">
          <h3 className="text-base sm:text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ===== TABEL ELEGAN (Sesuai Referensi Gambar "Recent Visitor") =====
export function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs sm:text-sm text-left text-gray-700">
        <thead className="text-[11px] text-[#1e3a1c] uppercase bg-[#eef4ea] border-b border-[#dbe5d4]">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 font-bold tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 [&>tr:hover]:bg-[#f4f8f1] transition-colors">
          {children}
        </tbody>
      </table>
    </div>
  );
}

// ===== STAT CARD DENGAN DEKORASI GELOMBANG (Persis Referensi Gambar) =====
export function DecorativeWave() {
  return (
    <svg
      className="absolute bottom-0 left-0 w-full h-7 pointer-events-none"
      viewBox="0 0 400 45"
      preserveAspectRatio="none"
    >
      <path
        d="M0,25 C80,5 150,42 240,20 C320,2 360,35 400,18 L400,45 L0,45 Z"
        fill="#3b6e38"
        fillOpacity="0.12"
      />
      <path
        d="M0,28 C90,42 170,4 260,26 C330,42 375,12 400,25"
        fill="none"
        stroke="#264624"
        strokeOpacity="0.45"
        strokeWidth="1.6"
      />
      <path
        d="M0,18 C70,2 160,38 250,15 C325,0 370,32 400,14"
        fill="none"
        stroke="#6b9e65"
        strokeOpacity="0.45"
        strokeWidth="1.4"
      />
    </svg>
  );
}

// ===== STAT CARD MINI (gaya "Over View" pada referensi) =====
// tone: "green" (default) | "orange" (perlu perhatian) | "blue" | "slate"
const STAT_TONES = {
  green: {
    box: "bg-white border-[#d6e4c8]",
    icon: "bg-[#e9f2e1] border-[#b7d4a5] text-[#264624]",
  },
  orange: {
    box: "bg-[#fdf1ea] border-[#f3cdb5]",
    icon: "bg-white border-[#f3cdb5] text-[#c2622d]",
  },
  blue: {
    box: "bg-white border-[#cfe0ea]",
    icon: "bg-[#e8f1f7] border-[#bcd5e5] text-[#2f5f7f]",
  },
  slate: {
    box: "bg-white border-gray-200",
    icon: "bg-gray-50 border-gray-200 text-gray-700",
  },
};

export function StatCard({ label, value, icon, small, tone = "green", hint, onClick }) {
  const t = STAT_TONES[tone] || STAT_TONES.green;
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`relative w-full text-left rounded-2xl border px-4 py-3.5 flex items-center gap-3.5 transition-all hover:shadow-md ${t.box} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${t.icon}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`${small ? "text-base sm:text-lg" : "text-xl sm:text-2xl"} font-extrabold text-gray-900 truncate leading-tight`}>
          {value}
        </p>
        <p className="text-xs sm:text-[13px] text-gray-600 font-medium truncate">{label}</p>
      </div>
      {hint && (
        <span
          title={hint}
          className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-gray-800 text-white text-[10px] font-bold flex items-center justify-center shadow"
        >
          i
        </span>
      )}
    </Wrapper>
  );
}

// ===== PANEL (kartu putih berjudul untuk dashboard) =====
export function Panel({ title, action, children, className = "", bodyClassName = "" }) {
  return (
    <section className={`bg-white rounded-2xl border border-[#dbe5d4] shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-4 pb-2">
          {title && <h3 className="text-sm sm:text-base font-bold text-[#1e3a1c]">{title}</h3>}
          {action && <div className="flex items-center gap-2 text-xs">{action}</div>}
        </div>
      )}
      <div className={`px-4 sm:px-5 pb-4 flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

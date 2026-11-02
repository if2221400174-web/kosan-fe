import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicProfilKos } from "../_sevices/publicKos";
import { imageStorage } from "../_api";

const SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=85",
    title: "Karena Tempat Kos Harus Terasa Seperti Rumah Sendiri",
    subtitle:
      "Temukan kenyamanan hunian kos eksklusif untuk menunjang aktivitas kuliah & kerja Anda!",
  },
  {
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85",
    title: "Lingkungan Asri, Aman, & Fasilitas Modern",
    subtitle:
      "Nikmati suasana tenang dengan fasilitas lengkap serta manajemen tagihan digital terpadu.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=85",
    title: "Daftar Praktis, Lengkapi Data Saat Memesan Kamar",
    subtitle:
      "Cukup gunakan akun Google dan buat kata sandi untuk mulai menjelajahi pilihan kamar terbaik.",
  },
];

export function GoogleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.08.72-2.45 1.16-4.22 1.16-3.24 0-5.98-2.18-6.96-5.12H1.04v3.14C3.05 21.16 7.21 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.04 14.03c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.33H1.04C.38 7.65 0 9.14 0 11.75s.38 4.1 1.04 5.42l4-3.14z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.8 0 3.41.62 4.68 1.84l3.51-3.51C18.07 1.19 15.3 0 12 0 7.21 0 3.05 2.84 1.04 6.83l4 3.14c.98-2.94 3.72-5.22 6.96-5.22z"
      />
    </svg>
  );
}

export function GoogleAccountModal({ open, onClose, onSelectAccount, namaKos }) {
  const [customEmail, setCustomEmail] = useState("");
  const [customNama, setCustomNama] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const savedAccounts = (() => {
    try {
      const raw = localStorage.getItem("recentGoogleAccounts");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  const handleUseCustom = (e) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes("@")) {
      setError("Masukkan alamat email Google yang valid (contoh: nama@gmail.com).");
      return;
    }
    const derivedName =
      customNama.trim() ||
      customEmail
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

    const acc = { email: customEmail.trim().toLowerCase(), nama: derivedName };
    try {
      const next = [acc, ...savedAccounts.filter((a) => a.email !== acc.email)].slice(0, 3);
      localStorage.setItem("recentGoogleAccounts", JSON.stringify(next));
    } catch {
      // ignore storage error
    }
    onSelectAccount(acc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn">
        {/* Google Header */}
        <div className="px-6 pt-6 pb-4 text-center border-b border-gray-100">
          <div className="flex justify-center mb-3">
            <GoogleIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Pilih Akun Google</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            untuk melanjutkan ke <span className="font-semibold text-[#264624]">{namaKos}</span>
          </p>
        </div>

        <div className="p-6 space-y-4">
          {savedAccounts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Akun Terakhir Digunakan
              </p>
              {savedAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => onSelectAccount(acc)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#3b6e38] hover:bg-[#f4f8f1] transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-[#264624] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {acc.nama?.charAt(0)?.toUpperCase() || "G"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{acc.nama}</p>
                    <p className="text-xs text-gray-500 truncate">{acc.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleUseCustom} className="space-y-3">
            {error && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Google Anda <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="nama.anda@gmail.com"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6e38]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nama Lengkap (Opsional)
              </label>
              <input
                type="text"
                value={customNama}
                onChange={(e) => setCustomNama(e.target.value)}
                placeholder="Otomatis dari profil Google jika dikosongkan"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6e38]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#264624] hover:bg-[#3b6e38] rounded-xl shadow-sm transition-colors"
              >
                Lanjutkan dengan Akun Ini
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AuthGlassLayout({ children, title, subtitle }) {
  const [profil, setProfil] = useState(null);
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    getPublicProfilKos()
      .then((res) => setProfil(res))
      .catch(() => null);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const namaKos = profil?.nama_kos || "Kos Griya Harmoni";
  const currentSlide = SLIDES[slideIdx];
  const bgImage =
    slideIdx === 0 && profil?.foto_utama
      ? imageStorage(profil.foto_utama)
      : currentSlide.image;

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans py-6 sm:py-10 px-4 sm:px-6 md:px-10 lg:px-16">
      {/* Full-Screen Background Image */}
      <img
        src={bgImage}
        alt={namaKos}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 scale-105"
        onError={(e) => {
          e.target.src = SLIDES[0].image;
        }}
      />
      {/* Subtle Dark & Greenish Warm Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/25 to-[#1e3a1c]/40" />

      {/* Main Split Container (Sesuai Referensi Gambar) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end">
        {/* LEFT COLUMN: Bottom-Left Frosted Quote Card + Pill Dots */}
        <div className="lg:col-span-6 order-2 lg:order-1 flex flex-col items-center lg:items-start pb-2 sm:pb-4">
          <div className="w-full max-w-md backdrop-blur-md bg-black/40 border border-white/30 rounded-2xl px-5 sm:px-7 py-5 sm:py-6 text-white text-center shadow-2xl transition-all duration-500">
            <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-semibold leading-snug tracking-wide drop-shadow">
              {currentSlide.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-100/90 mt-2 leading-relaxed">
              {currentSlide.subtitle}
            </p>
          </div>

          {/* Carousel Indicator Pills (Persis Referensi: 1 Pill Panjang + 2 Bulat) */}
          <div className="flex items-center gap-3 mt-4 sm:mt-5 pl-1">
            {SLIDES.map((_, idx) => {
              const active = idx === slideIdx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSlideIdx(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-3 rounded-full transition-all duration-500 shadow ${
                    active
                      ? "w-20 sm:w-24 bg-white"
                      : "w-3 bg-white/80 hover:bg-white"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Large Frosted Glassmorphism Auth Panel */}
        <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center lg:justify-end">
          <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl backdrop-blur-xl bg-white/65 border border-white/60 rounded-[26px] sm:rounded-[32px] shadow-2xl px-5 sm:px-9 md:px-12 py-7 sm:py-9 md:py-11 text-gray-900">
            {/* Top-Left Brand Pill Badge (Sesuai Referensi Serenique, dengan Warna Proyek) */}
            <div className="flex items-center justify-between gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-[#1e3a1c] hover:bg-[#2c5429] text-white px-4 py-1.5 rounded-full shadow-md transition-all group"
              >
                <svg
                  className="w-4 h-4 text-green-200 transition-transform group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="font-serif italic text-xs sm:text-sm font-semibold tracking-wide">
                  {namaKos}
                </span>
              </Link>

              <Link
                to="/"
                className="text-xs font-medium text-gray-700 hover:text-[#1e3a1c] transition-colors"
              >
                ← Beranda
              </Link>
            </div>

            {/* Serif Heading & Subtitle */}
            <div className="text-center mt-5 sm:mt-6 mb-5 sm:mb-6">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-[34px] font-medium text-gray-900 leading-tight">
                {title || `Selamat Datang di ${namaKos}`}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1.5">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Form Content */}
            {typeof children === "function" ? children({ namaKos }) : children}
          </div>
        </div>
      </div>
    </section>
  );
}

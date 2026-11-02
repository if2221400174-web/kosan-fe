import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  getPublicProfilKos,
  getPublicKamar,
  getPublicFasilitas,
  getPublicGaleri,
} from "../../_sevices/publicKos";
import { getUserInfo } from "../../_sevices/auth";
import { imageStorage } from "../../_api";
import { formatRupiah, StatusBadge } from "../../components/ui";
import BookingKamarModal from "../../components/BookingKamarModal";
import logoKos from "../../assets/logo-kos.svg";

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80";
const FALLBACK_ABOUT =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80";
const FALLBACK_ROOMS = [
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = getUserInfo();
  const [profil, setProfil] = useState(null);
  const [kamarList, setKamarList] = useState([]);
  const [fasilitasList, setFasilitasList] = useState([]);
  const [galeriList, setGaleriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter bar di bawah hero
  const [filterTipe, setFilterTipe] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [searchKamar, setSearchKamar] = useState("");
  const [selectedKamar, setSelectedKamar] = useState(null);
  const [bookingKamar, setBookingKamar] = useState(null);

  const handlePesanKamar = (kamar) => {
    const currentUser = getUserInfo();
    const token = localStorage.getItem("accessToken");
    if (!token || !currentUser?.role) {
      navigate(`/register?kamar_id=${kamar.id}`);
      return;
    }
    if (currentUser.role !== "penyewa") {
      navigate("/admin/kontrak-sewa/create");
      return;
    }
    setSelectedKamar(null);
    setBookingKamar(kamar);
  };

  useEffect(() => {
    Promise.all([
      getPublicProfilKos().catch(() => null),
      getPublicKamar().catch(() => []),
      getPublicFasilitas().catch(() => []),
      getPublicGaleri().catch(() => []),
    ])
      .then(([p, k, f, g]) => {
        setProfil(p);
        const activeRooms = (k || []).filter((x) => x.status_kamar !== "nonaktif");
        setKamarList(activeRooms);
        setFasilitasList(f || []);
        setGaleriList((g || []).filter((x) => x.status_publikasi === "terbit"));

        const pesanKamarId = searchParams.get("pesan_kamar");
        if (pesanKamarId) {
          const target = activeRooms.find((r) => String(r.id) === String(pesanKamarId));
          if (target) {
            setBookingKamar(target);
          }
          setSearchParams({}, { replace: true });
        }
      })
      .finally(() => setLoading(false));
  }, [searchParams, setSearchParams]);

  const namaKos = profil?.nama_kos || "Kos Griya Harmoni";
  const tagline = profil?.tagline || "Hunian Nyaman, Aman, dan Strategis";
  const deskripsi =
    profil?.deskripsi ||
    "Nikmati kenyamanan tempat tinggal kos modern dengan suasana tenang dan asri, fasilitas lengkap, internet cepat, serta keamanan terjamin untuk mendukung aktivitas kuliah maupun kerja Anda setiap hari.";
  const whatsappClean = (profil?.whatsapp || "081234567890").replace(/[^0-9]/g, "");
  const waLink = `https://wa.me/${whatsappClean.startsWith("0") ? "62" + whatsappClean.slice(1) : whatsappClean}`;

  const tipeOptions = Array.from(new Set(kamarList.map((k) => k.tipe_kamar).filter(Boolean)));

  const filteredKamar = kamarList.filter((k) => {
    const matchTipe = filterTipe === "semua" || k.tipe_kamar === filterTipe;
    const matchStatus = filterStatus === "semua" || k.status_kamar === filterStatus;
    const matchSearch =
      !searchKamar ||
      [k.nomor_kamar, k.tipe_kamar, k.deskripsi].some((v) =>
        String(v || "").toLowerCase().includes(searchKamar.toLowerCase())
      );
    return matchTipe && matchStatus && matchSearch;
  });

  const dashboardHref =
    user?.role === "penyewa" ? "/penyewa" : user?.role ? "/admin" : "/login";

  const navItems = [
    { label: "Beranda", href: "#beranda" },
    { label: "Tentang Kos", href: "#tentang" },
    { label: "Pilihan Kamar", href: "#kamar" },
    { label: "Fasilitas", href: "#fasilitas" },
    { label: "Galeri", href: "#galeri" },
    { label: "Kontak", href: "#kontak" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#fafaf5] font-sans text-gray-800 overflow-x-hidden flex flex-col">
      {/* ================= NAVBAR FULL-WIDTH RESPONSIVE ================= */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 py-3 sm:py-4 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <a href="#beranda" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
            <img
              src={profil?.logo ? imageStorage(profil.logo) : logoKos}
              alt={namaKos}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src = logoKos;
              }}
            />
            <span className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-[#3b6e38] truncate">
              {namaKos}
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-gray-600">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-[#3b6e38] transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Actions (Desktop & Tablet) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#kamar"
              className="p-2 text-gray-500 hover:text-[#3b6e38] rounded-full hover:bg-green-50 transition-colors"
              title="Cari Kamar"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </a>

            {user?.role ? (
              <Link
                to={dashboardHref}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#3b6e38] hover:bg-[#2f592d] rounded-full shadow-sm hover:shadow transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Dashboard</span>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/register"
                  className="inline-flex items-center px-3.5 md:px-4 py-2 text-xs sm:text-sm font-semibold text-[#3b6e38] border border-[#3b6e38]/30 hover:bg-[#e9f2e1] rounded-full transition-all duration-200"
                >
                  Daftar
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#3b6e38] hover:bg-[#2f592d] rounded-full shadow-sm hover:shadow transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Masuk Akun</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-[#3b6e38] hover:bg-gray-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden bg-white border-t border-gray-100 px-4 sm:px-6 pb-4"
            >
              <nav className="flex flex-col py-2 space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-[#e9f2e1] hover:text-[#3b6e38] transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              {!user?.role && (
                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2.5 sm:hidden">
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-semibold text-[#3b6e38] border border-[#3b6e38] rounded-full"
                  >
                    Daftar Akun
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-semibold text-white bg-[#3b6e38] rounded-full"
                  >
                    Masuk Akun
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ================= HERO SECTION FULL-WIDTH ================= */}
      <section id="beranda" className="relative w-full">
        <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] lg:h-[580px] overflow-hidden">
          <img
            src={profil?.foto_utama ? imageStorage(profil.foto_utama) : FALLBACK_HERO}
            alt={namaKos}
            className="w-full h-full object-cover scale-105 animate-slowZoom"
            onError={(e) => {
              e.target.src = FALLBACK_HERO;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />

          <div className="absolute inset-0 flex items-center">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="max-w-xl lg:max-w-2xl text-white space-y-3 sm:space-y-4"
              >
                <div className="inline-flex items-center gap-2 bg-white/95 text-[#3b6e38] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shadow">
                  <span className="w-2 h-2 rounded-full bg-[#3b6e38] animate-ping" />
                  <span>Hunian Kos Eksklusif & Nyaman</span>
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-sm">
                  {tagline}
                </h1>

                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-100/95 leading-relaxed line-clamp-3 max-w-lg">
                  {profil?.alamat || "Lokasi strategis, lingkungan asri, dan fasilitas lengkap untuk kenyamanan istirahat Anda."}
                </p>

                <div className="pt-1 sm:pt-3 flex flex-wrap gap-2.5 sm:gap-3.5">
                  <a
                    href="#kamar"
                    className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#3b6e38]/95 hover:bg-[#3b6e38] border border-white/60 text-white text-xs sm:text-sm font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  >
                    Lihat Pilihan Kamar
                  </a>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white/20 hover:bg-white/30 border border-white/50 text-white text-xs sm:text-sm font-semibold backdrop-blur-sm transition-all duration-300"
                  >
                    Hubungi WhatsApp
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating Sage Green Search/Filter Pill Bar */}
        <div className="relative z-20 -mt-8 sm:-mt-12 max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="bg-[#b7cb99] p-3 sm:p-4 rounded-2xl lg:rounded-full shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center gap-3"
          >
            <div className="flex-1 bg-white rounded-xl lg:rounded-full px-3.5 sm:px-5 py-2.5 sm:py-3 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 gap-2.5 sm:gap-0">
              {/* Filter Tipe Kamar */}
              <div className="sm:pr-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#3b6e38] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" />
                </svg>
                <select
                  value={filterTipe}
                  onChange={(e) => setFilterTipe(e.target.value)}
                  className="w-full text-xs sm:text-sm text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="semua">Semua Tipe Kamar</option>
                  {tipeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Filter Status Kamar */}
              <div className="pt-2.5 sm:pt-0 sm:px-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#3b6e38] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full text-xs sm:text-sm text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="semua">Semua Status ({kamarList.length})</option>
                  <option value="tersedia">Kamar Tersedia</option>
                  <option value="terisi">Kamar Terisi</option>
                </select>
              </div>

              {/* Input Cari Kamar */}
              <div className="pt-2.5 sm:pt-0 sm:pl-3 flex items-center gap-2">
                <input
                  type="text"
                  value={searchKamar}
                  onChange={(e) => setSearchKamar(e.target.value)}
                  placeholder="Cari nomor kamar..."
                  className="w-full text-xs sm:text-sm text-gray-700 bg-transparent focus:outline-none"
                />
                <span className="w-6 h-6 rounded-full bg-[#3b6e38] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {filteredKamar.length}
                </span>
              </div>
            </div>

            <a
              href="#kamar"
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl lg:rounded-full bg-[#3b6e38] hover:bg-[#2f592d] text-white text-xs sm:text-sm font-semibold text-center shadow transition-all duration-200 whitespace-nowrap"
            >
              Cari Kamar
            </a>
          </motion.div>
        </div>
      </section>

      {/* ================= WELCOME / ABOUT SECTION ================= */}
      <section id="tentang" className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Image Card with Floating Badges */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="lg:col-span-5 relative mx-auto w-full max-w-md lg:max-w-none"
          >
            {/* Floating Top-Left Green Circle Badge */}
            <div className="absolute -top-4 -left-2 sm:-top-6 sm:-left-4 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#3b6e38] text-white border-4 border-white shadow-lg flex flex-col items-center justify-center text-center p-1.5 sm:p-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[9px] sm:text-[10px] font-bold leading-tight">Kos Pilihan</span>
            </div>

            <div className="bg-white p-2.5 sm:p-3.5 rounded-2xl shadow-md border border-gray-100">
              <img
                src={
                  galeriList[0]?.foto
                    ? imageStorage(galeriList[0].foto)
                    : profil?.foto_utama
                    ? imageStorage(profil.foto_utama)
                    : FALLBACK_ABOUT
                }
                alt="Tentang Kos"
                className="w-full h-52 sm:h-64 md:h-72 lg:h-80 object-cover rounded-xl"
                onError={(e) => {
                  e.target.src = FALLBACK_ABOUT;
                }}
              />
            </div>

            {/* Floating Bottom-Right Badge */}
            <div className="absolute -bottom-4 right-2 sm:-right-3 bg-white p-2 sm:p-2.5 rounded-full shadow-lg border border-gray-100 flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                {kamarList.filter((k) => k.status_kamar === "tersedia").length}
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-700 pr-2">Kamar Kosong</span>
            </div>
          </motion.div>

          {/* Text Description */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={1}
            variants={fadeUp}
            className="lg:col-span-7 space-y-3.5 sm:space-y-4 mt-4 lg:mt-0"
          >
            <span className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#3b6e38] bg-[#e9f2e1] px-3 py-1 rounded-full">
              Selamat Datang
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              Mengapa Memilih {namaKos}?
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed whitespace-pre-line">
              {deskripsi}
            </p>

            {profil?.aturan_kos && (
              <div className="p-3.5 sm:p-4 bg-[#f1f6ec] border border-[#d6e4c8] rounded-xl text-xs sm:text-sm text-gray-700 space-y-1">
                <p className="font-bold text-[#3b6e38]">Tata Tertib & Jam Malam:</p>
                <p className="whitespace-pre-line">{profil.aturan_kos}</p>
                {profil.jam_malam && (
                  <p className="text-xs text-gray-500 pt-1">
                    Batas Jam Malam: <strong>{String(profil.jam_malam).substring(0, 5)} WIB</strong>
                  </p>
                )}
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-[#3b6e38] hover:bg-[#2f592d] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
              >
                Tanya Pengelola
              </a>
              {!user?.role && (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full border border-[#3b6e38] text-[#3b6e38] hover:bg-[#e9f2e1] text-xs sm:text-sm font-semibold transition-all"
                >
                  Daftar Akun Penghuni
                </Link>
              )}
              <a href="#fasilitas" className="text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#3b6e38]">
                Lihat Fasilitas →
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= ROOM CARDS SECTION (Light Sage Background) ================= */}
      <section id="kamar" className="w-full bg-[#e9f2e1] py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#2b4c28]">
              Pilihan Kamar Kos Terbaik
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1.5">
              Pilih kamar yang sesuai dengan kebutuhan dan anggaran Anda
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-sm text-gray-500">Memuat daftar kamar...</div>
          ) : filteredKamar.length === 0 ? (
            <div className="text-center py-12 bg-white/70 rounded-2xl text-sm text-gray-500">
              Tidak ada kamar yang sesuai dengan filter pencarian.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
              {filteredKamar.map((k, idx) => {
                const fallbackImg = FALLBACK_ROOMS[idx % FALLBACK_ROOMS.length];
                return (
                  <motion.div
                    key={k.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    custom={idx % 3}
                    variants={fadeUp}
                    whileHover={{ y: -6 }}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-white"
                  >
                    <div className="relative h-48 sm:h-52 lg:h-56 overflow-hidden bg-gray-100">
                      <img
                        src={k.foto_utama ? imageStorage(k.foto_utama) : fallbackImg}
                        alt={`Kamar ${k.nomor_kamar}`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        onError={(e) => {
                          e.target.src = fallbackImg;
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <StatusBadge status={k.status_kamar} />
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold text-[#3b6e38]">
                        Lantai {k.lantai}
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
                            Kamar {k.nomor_kamar}
                          </h3>
                          <span className="text-[11px] sm:text-xs font-semibold text-[#3b6e38] bg-[#e9f2e1] px-2.5 py-0.5 rounded-full">
                            {k.tipe_kamar}
                          </span>
                        </div>

                        <p className="text-sm sm:text-base font-bold text-[#3b6e38] mt-1">
                          {formatRupiah(k.harga_bulanan)}{" "}
                          <span className="text-xs font-normal text-gray-500">/ bulan</span>
                        </p>

                        <p className="text-xs sm:text-sm text-gray-500 mt-2 line-clamp-2">
                          {k.deskripsi || `Kamar tipe ${k.tipe_kamar} nyaman${k.luas_kamar ? ` dengan luas ${k.luas_kamar}` : ""}.`}
                        </p>

                        {(k.fasilitas || []).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {k.fasilitas.slice(0, 4).map((f) => (
                              <span
                                key={f.id}
                                className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                              >
                                {f.nama_fasilitas}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        {k.status_kamar === "tersedia" && (
                          <button
                            type="button"
                            onClick={() => handlePesanKamar(k)}
                            className="flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-full bg-[#3b6e38] hover:bg-[#2f592d] text-white text-xs font-semibold transition-colors text-center cursor-pointer"
                          >
                            Pesan Kamar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedKamar(k)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-full border border-[#3b6e38] text-[#3b6e38] hover:bg-[#e9f2e1] text-xs font-semibold transition-colors text-center cursor-pointer"
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination Dots Indicator */}
          <div className="flex justify-center items-center gap-2 mt-8 sm:mt-10">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b6e38]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#b7cb99]" />
            <span className="w-2 h-2 rounded-full bg-[#b7cb99]/60" />
          </div>
        </div>
      </section>

      {/* ================= FASILITAS SECTION ================= */}
      <section id="fasilitas" className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 py-12 sm:py-16 lg:py-20 bg-[#fafaf5]">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900">
            Fasilitas Kamar & Umum
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1.5">
            Fasilitas lengkap untuk menunjang kenyamanan aktivitas harian Anda
          </p>
        </div>

        {fasilitasList.length === 0 ? (
          <p className="text-center text-sm text-gray-400">Belum ada data fasilitas</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
            {fasilitasList.map((f, idx) => (
              <motion.div
                key={f.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx % 4}
                variants={fadeUp}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start gap-3.5"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#e9f2e1] text-[#3b6e38] flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  ✓
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">{f.nama_fasilitas}</h3>
                  <span className="text-[10px] sm:text-[11px] uppercase font-semibold text-[#3b6e38]">
                    Fasilitas {f.jenis_fasilitas}
                  </span>
                  {f.deskripsi && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{f.deskripsi}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ================= GALERI SECTION ================= */}
      {galeriList.length > 0 && (
        <section id="galeri" className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 pb-12 sm:pb-16 lg:pb-20 bg-[#fafaf5]">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900">
              Galeri Lingkungan Kos
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1.5">
              Suasana sekitar dan interior kamar {namaKos}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {galeriList.map((g, i) => (
              <motion.div
                key={g.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i % 3}
                variants={fadeUp}
                className="group relative h-52 sm:h-56 lg:h-64 rounded-2xl overflow-hidden shadow-sm bg-gray-200"
              >
                <img
                  src={imageStorage(g.foto)}
                  alt={g.judul}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = FALLBACK_ROOMS[i % FALLBACK_ROOMS.length];
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                  <span className="text-[10px] uppercase tracking-wider bg-[#3b6e38] w-fit px-2 py-0.5 rounded mb-1">
                    {g.kategori}
                  </span>
                  <p className="text-sm sm:text-base font-bold">{g.judul}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ================= FOOTER FULL-WIDTH ================= */}
      <footer id="kontak" className="w-full bg-[#264624] text-green-50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 pt-12 sm:pt-14 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 pb-10 border-b border-white/15">
            {/* Kolom 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <img src={logoKos} alt={namaKos} className="w-8 h-8 rounded-lg" />
                <span className="text-lg font-extrabold text-white">{namaKos}</span>
              </div>
              <p className="text-xs sm:text-sm text-green-100/80 leading-relaxed">
                {tagline}. Dikelola secara profesional dengan sistem tagihan dan layanan penghuni terintegrasi.
              </p>
            </div>

            {/* Kolom 2: Navigasi Cepat */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3">
                Navigasi Cepat
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-green-100/80">
                <li><a href="#beranda" className="hover:text-white">Beranda</a></li>
                <li><a href="#tentang" className="hover:text-white">Tentang & Aturan Kos</a></li>
                <li><a href="#kamar" className="hover:text-white">Daftar Kamar</a></li>
                <li><a href="#fasilitas" className="hover:text-white">Fasilitas</a></li>
                <li><Link to="/login" className="hover:text-white">Masuk Akun Penghuni / Pengelola</Link></li>
                <li><Link to="/register" className="hover:text-white">Pendaftaran Calon Penghuni Baru</Link></li>
              </ul>
            </div>

            {/* Kolom 3: Kontak & Alamat */}
            <div className="space-y-2 text-xs sm:text-sm text-green-100/85 sm:col-span-2 lg:col-span-1">
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3">
                Hubungi Kami
              </h4>
              <p><strong>Alamat:</strong> {profil?.alamat || "Jl. Merdeka No. 45, Kota Bandung"}</p>
              <p><strong>Telepon:</strong> {profil?.telepon || "022-7654321"}</p>
              <p><strong>WhatsApp:</strong> {profil?.whatsapp || "081234567890"}</p>
              {profil?.email && <p><strong>Email:</strong> {profil.email}</p>}
              {profil?.google_maps_url && (
                <div className="pt-2">
                  <a
                    href={profil.google_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors"
                  >
                    Buka Lokasi di Google Maps →
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-green-200/70 text-center sm:text-left">
            <p>© {new Date().getFullYear()} {namaKos}. Seluruh hak cipta dilindungi.</p>
            <p>Sistem Informasi Manajemen Kosan</p>
          </div>
        </div>
      </footer>

      {/* ================= MODAL DETAIL KAMAR ================= */}
      <AnimatePresence>
        {selectedKamar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedKamar(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="relative h-48 sm:h-56 bg-gray-100">
                <img
                  src={selectedKamar.foto_utama ? imageStorage(selectedKamar.foto_utama) : FALLBACK_ROOMS[0]}
                  alt={`Kamar ${selectedKamar.nomor_kamar}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = FALLBACK_ROOMS[0];
                  }}
                />
                <button
                  onClick={() => setSelectedKamar(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  ✕
                </button>
              </div>
              <div className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                    Kamar {selectedKamar.nomor_kamar} ({selectedKamar.tipe_kamar})
                  </h3>
                  <StatusBadge status={selectedKamar.status_kamar} />
                </div>

                <div className="grid grid-cols-2 gap-2.5 p-3 bg-[#f1f6ec] rounded-xl text-xs">
                  <div>
                    <span className="text-gray-500">Harga Bulanan:</span>
                    <p className="text-sm font-bold text-[#3b6e38]">{formatRupiah(selectedKamar.harga_bulanan)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Harga Tahunan:</span>
                    <p className="text-sm font-bold text-gray-800">
                      {selectedKamar.harga_tahunan ? formatRupiah(selectedKamar.harga_tahunan) : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Lantai:</span>
                    <p className="font-semibold">Lantai {selectedKamar.lantai}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Luas Kamar:</span>
                    <p className="font-semibold">{selectedKamar.luas_kamar || "—"}</p>
                  </div>
                </div>

                {selectedKamar.deskripsi && (
                  <p className="text-xs sm:text-sm text-gray-600">{selectedKamar.deskripsi}</p>
                )}

                {(selectedKamar.fasilitas || []).length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-700 mb-1.5">Fasilitas Kamar:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedKamar.fasilitas.map((f) => (
                        <span key={f.id} className="text-xs bg-gray-100 px-2.5 py-1 rounded-md text-gray-700">
                          ✓ {f.nama_fasilitas}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedKamar(null)}
                    className="px-4 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700"
                  >
                    Tutup
                  </button>
                  <a
                    href={`${waLink}?text=${encodeURIComponent(
                      `Halo Pengelola ${namaKos}, saya ingin menanyakan Kamar ${selectedKamar.nomor_kamar} (${selectedKamar.tipe_kamar}).`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-full border border-[#3b6e38] text-[#3b6e38] hover:bg-[#e9f2e1] text-xs font-semibold"
                  >
                    Tanya via WA
                  </a>
                  {selectedKamar.status_kamar === "tersedia" && (
                    <button
                      type="button"
                      onClick={() => handlePesanKamar(selectedKamar)}
                      className="px-5 py-2 rounded-full bg-[#3b6e38] hover:bg-[#2f592d] text-white text-xs font-semibold cursor-pointer"
                    >
                      Pesan Kamar Sekarang
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MODAL PEMESANAN KAMAR (LENGKAPI DATA + BOOKING) ================= */}
      <BookingKamarModal
        open={Boolean(bookingKamar)}
        kamar={bookingKamar}
        onClose={() => setBookingKamar(null)}
      />

      <style>{`
        @keyframes slowZoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        .animate-slowZoom {
          animation: slowZoom 18s ease-in-out infinite;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}

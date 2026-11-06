import { useEffect, useState, useRef, useCallback } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { logout, useDecodeToken } from "../_sevices/auth";
import { fetchSmartNotifications } from "../_sevices/notifikasi";

// Layout bersama untuk administrator, admin, dan penyewa.
// Gaya: sidebar gelap dengan profil di atas + area konten terang dengan sapaan "Selamat Datang".
export default function BaseLayout({ basePath, allowedRoles, menus, title = "Kos Harmoni" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("accessToken");
  const rawUser = localStorage.getItem("userInfo");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  let userInfo;
  try {
    userInfo = rawUser ? JSON.parse(rawUser) : { nama: "", email: "", role: "" };
  } catch {
    userInfo = { nama: "", email: "", role: "" };
  }

  const decodedData = useDecodeToken(token);
  const role = userInfo?.role;
  const firstName = (userInfo?.nama || "").split(" ")[0] || "Pengguna";
  const initials = (userInfo?.nama || "U")
    .split(" ")
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleDisplay =
    role === "administrator" ? "Administrator (Pemilik)" : role === "admin" ? "Admin Pengelola" : "Penghuni Kos";

  // Proteksi halaman: wajib login & role sesuai
  useEffect(() => {
    if (!token || !decodedData || !decodedData.success) {
      navigate("/login");
      return;
    }
    if (!allowedRoles.includes(role)) {
      alert("Akses ditolak. Anda tidak memiliki izin ke halaman ini.");
      navigate("/login");
    }
  }, [token, decodedData, navigate, role, allowedRoles]);

  const loadNotifications = useCallback(() => {
    if (!role) return;
    fetchSmartNotifications(role)
      .then((res) => setNotifications(res.notifications || []))
      .catch(() => {});
  }, [role]);

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 15000);
    return () => clearInterval(timer);
  }, [loadNotifications, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocus(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsNotifOpen(false);
    setSearch("");
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      if (token) await logout(token);
    } catch {
      // token sudah tidak valid, tetap keluar
    }
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === basePath) return location.pathname === basePath;
    return location.pathname.startsWith(path);
  };

  const visibleMenus = menus.filter((m) => !m.roles || m.roles.includes(role));
  const currentMenu = visibleMenus.find((m) => m.to !== basePath && isActive(m.to)) || visibleMenus[0];
  const searchResults = search.trim()
    ? visibleMenus.filter((m) => m.label.toLowerCase().includes(search.toLowerCase()))
    : [];

  const isDashboard = location.pathname === basePath;

  return (
    <div className="min-h-screen w-full bg-[#dfe9d8] p-0 lg:p-4 font-sans text-gray-800">
      <div className="flex min-h-screen lg:min-h-[calc(100vh-2rem)] lg:rounded-[28px] overflow-hidden lg:shadow-xl bg-[#eef3ea]">
        {/* ================= SIDEBAR ================= */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex-shrink-0 bg-[#264624] text-white flex flex-col transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Profil pengguna */}
          <div className="pt-7 pb-5 px-5 flex flex-col items-center text-center border-b border-white/10">
            <button
              type="button"
              onClick={() => navigate(`${basePath}/profile/edit`)}
              className="relative w-20 h-20 rounded-full ring-4 ring-white/90 bg-[#e9f2e1] text-[#264624] text-2xl font-extrabold flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
              title="Pengaturan Profil"
            >
              {initials}
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green-400 ring-2 ring-[#264624]" />
            </button>
            <p className="mt-3 text-sm font-bold leading-tight truncate max-w-full">{userInfo?.nama || "Pengguna"}</p>
            <p className="text-[11px] text-green-100/70 truncate max-w-full">{userInfo?.email}</p>
            <span className="mt-2 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold tracking-wide uppercase">
              {roleDisplay}
            </span>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto py-4 pl-3 sidebar-scroll">
            {visibleMenus.map((menu, idx) => {
              const active = isActive(menu.to);
              return (
                <div key={idx}>
                  {menu.section && (
                    <p className="px-4 pt-4 pb-1.5 text-[10px] font-bold tracking-widest text-green-100/45 uppercase">
                      {menu.section}
                    </p>
                  )}
                  <Link
                    to={menu.to}
                    className={`group relative flex items-center gap-3 pl-4 pr-3 py-2.5 my-0.5 text-[13px] rounded-l-2xl transition-all ${
                      active
                        ? "bg-[#eef3ea] text-[#1e3a1c] font-bold"
                        : "text-white/85 font-medium hover:bg-white/10 hover:text-white mr-3 rounded-r-2xl"
                    }`}
                  >
                    <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menu.icon} />
                    </svg>
                    <span className="truncate">{menu.label}</span>
                    {menu.badgeKey && (
                      <span className="ml-auto px-1.5 min-w-[18px] text-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {menu.badgeKey}
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Bawah sidebar */}
          <div className="px-3 pb-6 pt-3 border-t border-white/10 space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-white/80 hover:bg-white/10 rounded-2xl transition-colors"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Lihat Website Kos
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-white/80 hover:bg-red-500/20 hover:text-red-100 rounded-2xl transition-colors cursor-pointer"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </button>
            <p className="pt-2 text-center font-serif italic text-xs text-green-100/50">{title}</p>
          </div>
        </aside>

        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* ================= KONTEN ================= */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header: sapaan + pencarian + notifikasi */}
          <header className="sticky top-0 z-30 bg-[#eef3ea]/95 backdrop-blur px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-xl text-[#264624] hover:bg-white transition-colors"
              aria-label="Buka menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl lg:text-[28px] font-extrabold text-[#1e3a1c] truncate leading-tight">
                {isDashboard ? `Selamat Datang, ${firstName}!` : currentMenu?.label}
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                {isDashboard
                  ? new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                  : `${title} / ${currentMenu?.label || ""}`}
              </p>
            </div>

            {/* Pencarian menu */}
            <div ref={searchRef} className="relative hidden md:block">
              <div className="flex items-center w-56 lg:w-72 bg-white border border-[#cfdcc6] rounded-full pl-4 pr-1 py-1 focus-within:ring-2 focus-within:ring-[#3b6e38]/40">
                <input
                  type="text"
                  value={search}
                  onFocus={() => setSearchFocus(true)}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari menu..."
                  className="flex-1 min-w-0 text-sm bg-transparent focus:outline-none placeholder-gray-400"
                />
                <span className="w-8 h-8 rounded-full bg-[#e9f2e1] text-[#264624] flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </div>
              {searchFocus && searchResults.length > 0 && (
                <div className="absolute right-0 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50">
                  {searchResults.map((m) => (
                    <Link
                      key={m.to}
                      to={m.to}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-[#f1f6ec]"
                    >
                      <svg className="w-4 h-4 text-[#3b6e38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={m.icon} />
                      </svg>
                      {m.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Notifikasi */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setIsNotifOpen((p) => !p)}
                className="relative w-10 h-10 rounded-full bg-white border border-[#cfdcc6] text-[#264624] flex items-center justify-center hover:bg-[#f6faf3] transition-colors cursor-pointer"
                title="Notifikasi"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#eef3ea]">
                    {notifications.length > 99 ? "99+" : notifications.length}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-[min(92vw,380px)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1e3a1c]">Notifikasi ({notifications.length})</span>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">{roleDisplay}</span>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400">Tidak ada notifikasi baru</div>
                    ) : (
                      notifications.map((n) => {
                        const dot =
                          n.type === "danger"
                            ? "bg-red-500"
                            : n.type === "warning"
                            ? "bg-amber-500"
                            : n.type === "success"
                            ? "bg-green-600"
                            : "bg-sky-500";
                        return (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              setIsNotifOpen(false);
                              if (n.to) navigate(n.to);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-[#f4f8f1] flex items-start gap-3 cursor-pointer"
                          >
                            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dot}`} />
                            <span className="min-w-0">
                              <span className="block text-xs font-bold text-gray-900 leading-snug">{n.title}</span>
                              <span className="block text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.desc}</span>
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 pt-2">
            <Outlet />
          </main>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.18s ease-out; }
        .sidebar-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.2) transparent; }
      `}</style>
    </div>
  );
}

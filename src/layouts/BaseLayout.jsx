import { useEffect, useState, useRef, useCallback } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { logout, useDecodeToken } from "../_sevices/auth";
import { fetchSmartNotifications } from "../_sevices/notifikasi";

// Layout utama bergaya modern sesuai referensi gambar (Header Hijau Tua + Floating Sidebar + Lonceng Notifikasi + Kartu User Putih)
export default function BaseLayout({
  basePath,
  allowedRoles,
  menus,
  title = "Kos Harmoni",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("accessToken");
  const rawUser = localStorage.getItem("userInfo");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [quickSearch, setQuickSearch] = useState("");

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  let userInfo;
  try {
    userInfo = rawUser ? JSON.parse(rawUser) : { nama: "", email: "", role: "" };
  } catch {
    userInfo = { nama: "", email: "", role: "" };
  }

  const decodedData = useDecodeToken(token);
  const role = userInfo?.role;

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
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsNotifOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      if (token) await logout(token);
    } catch {
      // ignore
    }
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === basePath) return location.pathname === basePath;
    return location.pathname.startsWith(path);
  };

  const visibleMenus = menus.filter((m) => !m.roles || m.roles.includes(role));
  const currentMenu =
    visibleMenus.find((m) => isActive(m.to)) || visibleMenus[0];

  const filteredMenus = quickSearch.trim()
    ? visibleMenus.filter((m) =>
        m.label.toLowerCase().includes(quickSearch.toLowerCase())
      )
    : visibleMenus;

  const roleDisplay =
    role === "administrator"
      ? "Administrator"
      : role === "admin"
      ? "Admin Kos"
      : "Penghuni Kos";

  return (
    <div className="min-h-screen w-full bg-[#fafaf5] text-gray-800 p-2 sm:p-3.5 lg:p-5 flex flex-col gap-3 sm:gap-4 font-sans">
      {/* ================= TOP HEADER BAR (Sesuai Referensi Gambar) ================= */}
      <header className="w-full bg-[#264624] text-white rounded-2xl shadow-md pl-4 sm:pl-6 pr-2 sm:pr-3 py-2 sm:py-2.5 flex items-center justify-between gap-3 z-40">
        {/* Left: Hamburger + 4-Square Grid Icon + Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link to={basePath} className="flex items-center gap-2.5 min-w-0">
            <div className="grid grid-cols-2 gap-0.5 w-5 h-5 flex-shrink-0">
              <span className="bg-white rounded-[2px]" />
              <span className="bg-white/80 rounded-[2px]" />
              <span className="bg-white/80 rounded-[2px]" />
              <span className="bg-white rounded-[2px]" />
            </div>
            <span className="text-base sm:text-xl font-extrabold tracking-wide truncate">
              {currentMenu?.label || "Dashboard"}
            </span>
          </Link>

          <Link
            to="/"
            className="hidden md:inline-flex items-center gap-1 ml-3 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-xs font-medium text-green-50 transition-colors"
          >
            🌐 Lihat Landing Page
          </Link>
        </div>

        {/* Right: Pill Search + Notification Bell with Red Counter + White User Profile Card */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Pill Search */}
          <div className="hidden md:flex items-center bg-white rounded-full px-4 py-1.5 w-52 lg:w-64 shadow-inner">
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Cari menu..."
              className="w-full text-xs sm:text-sm text-gray-800 bg-transparent focus:outline-none placeholder-gray-400"
            />
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Notification Bell with Red Badge */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className="relative p-2 rounded-full hover:bg-white/15 transition-colors cursor-pointer"
              title="Notifikasi Sistem"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                <div className="px-4 py-3 bg-[#264624] text-white flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold">
                    Notifikasi & Pengingat ({notifications.length})
                  </span>
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">
                    {roleDisplay}
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      Tidak ada notifikasi baru saat ini
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const dotColor =
                        n.type === "danger"
                          ? "bg-red-500"
                          : n.type === "warning"
                          ? "bg-amber-500"
                          : n.type === "success"
                          ? "bg-green-600"
                          : "bg-blue-500";
                      return (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => {
                            setIsNotifOpen(false);
                            if (n.to) navigate(n.to);
                          }}
                          className="w-full p-3.5 text-left hover:bg-[#f1f6ec] transition-colors flex items-start gap-3 cursor-pointer"
                        >
                          <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-900 leading-snug">
                              {n.title}
                            </p>
                            <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">
                              {n.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* White Rounded User Profile Card (Persis Referensi Gambar) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="bg-white text-gray-900 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm flex items-center gap-2.5 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#264624] text-white flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="hidden sm:block text-left max-w-[160px]">
                <p className="text-xs font-extrabold text-gray-900 truncate leading-tight">
                  {userInfo?.nama || roleDisplay}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  Id: {userInfo?.email || "-"}
                </p>
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                <div className="px-4 py-3.5 bg-[#264624] text-white">
                  <p className="text-sm font-bold truncate">{userInfo?.nama}</p>
                  <p className="text-xs text-green-100 truncate">{userInfo?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-white/20 rounded-full">
                    {roleDisplay}
                  </span>
                </div>
                <div className="p-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate(`${basePath}/profile/edit`);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-[#f1f6ec] rounded-xl cursor-pointer"
                  >
                    <span>⚙️ Pengaturan Akun & Password</span>
                  </button>
                  <Link
                    to="/"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-[#f1f6ec] rounded-xl"
                  >
                    <span>🏠 Ke Beranda Publik</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                  >
                    <span>🚪 Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= BODY: FLOATING LEFT SIDEBAR + MAIN CONTENT ================= */}
      <div className="flex-1 flex gap-4 relative">
        {/* Floating Rounded Dark-Green Sidebar */}
        <aside
          className={`fixed lg:static top-0 left-0 z-40 h-full lg:h-auto w-64 bg-[#264624] text-white lg:rounded-[26px] shadow-xl flex flex-col justify-between transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div>
            {/* Cursive / Serif Brand Title (Sesuai Referensi Gambar "visitor") */}
            <div className="py-5 px-6 text-center border-b border-white/10">
              <Link
                to={basePath}
                className="font-serif italic text-2xl sm:text-3xl font-bold tracking-wider text-white drop-shadow-xs"
              >
                {title}
              </Link>
              <p className="text-[11px] text-green-200/80 mt-0.5 uppercase tracking-widest">
                {roleDisplay}
              </p>
            </div>

            {/* Menu List */}
            <div className="p-3.5 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin">
              {filteredMenus.map((menu, idx) => {
                const active = isActive(menu.to);
                return (
                  <div key={idx}>
                    {menu.section && (
                      <p className="px-3 pt-3 pb-1 text-[10px] font-bold tracking-widest text-green-200/60 uppercase">
                        {menu.section}
                      </p>
                    )}
                    <Link
                      to={menu.to}
                      className={`flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl transition-all duration-200 ${
                        active
                          ? "bg-white text-[#264624] font-extrabold shadow-md"
                          : "text-white/90 font-semibold hover:bg-white/10"
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 flex-shrink-0 ${
                          active ? "text-[#264624]" : "text-white"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={menu.icon}
                        />
                      </svg>
                      <span className="truncate">{menu.label}</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Sidebar: Setting & Login/Logout (Persis Referensi Gambar) */}
          <div className="p-3.5 border-t border-white/10 space-y-1">
            <Link
              to={`${basePath}/profile/edit`}
              className={`flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl transition-all ${
                location.pathname.includes("/profile/edit")
                  ? "bg-white text-[#264624] font-extrabold shadow"
                  : "text-white/90 font-semibold hover:bg-white/10"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Pengaturan Akun</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white/90 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-xs"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Rounded Container (Sesuai Referensi Gambar) */}
        <main className="flex-1 min-w-0 bg-[#ecf1e8] rounded-[26px] p-4 sm:p-6 lg:p-7 shadow-inner border border-[#dce6d5]">
          <Outlet />
        </main>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .scrollbar-thin { scrollbar-width: thin; }
      `}</style>
    </div>
  );
}

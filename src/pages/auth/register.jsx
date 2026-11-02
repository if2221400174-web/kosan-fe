import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { register, googleAuth, getUserInfo } from "../../_sevices/auth";
import AuthGlassLayout, {
  GoogleIcon,
  GoogleAccountModal,
} from "../../components/AuthGlassLayout";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const kamarId = searchParams.get("kamar_id") || "";
  const initialGoogleEmail = searchParams.get("google_email") || "";
  const initialGoogleNama = searchParams.get("google_nama") || "";

  const [formData, setFormData] = useState({
    nama: initialGoogleNama,
    email: initialGoogleEmail,
    password: "",
    password_confirmation: "",
  });

  const [isGoogleConnected, setIsGoogleConnected] = useState(
    Boolean(initialGoogleEmail)
  );
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = getUserInfo();
    if (token && user?.role) {
      if (user.role === "penyewa" && kamarId) {
        navigate(`/?pesan_kamar=${kamarId}`);
      } else {
        navigate(user.role === "penyewa" ? "/penyewa" : "/admin");
      }
    }
  }, [navigate, kamarId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleSelect = async ({ email, nama }) => {
    setGoogleModalOpen(false);
    setError(null);
    setLoading(true);
    try {
      // Cek apakah akun Google tersebut sudah pernah terdaftar
      const check = await googleAuth({ email, nama });
      if (check.action === "login" && check.token) {
        // Jika sudah punya akun, langsung masuk!
        localStorage.setItem("accessToken", check.token);
        localStorage.setItem("userInfo", JSON.stringify(check.user));
        navigate(kamarId ? `/?pesan_kamar=${kamarId}` : "/penyewa");
        return;
      }

      // Jika belum punya akun, isi email & nama otomatis, pengunjung cukup buat password saja
      setFormData((prev) => ({
        ...prev,
        email: check.email || email,
        nama: check.nama || nama,
      }));
      setIsGoogleConnected(true);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Gagal menghubungkan akun Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email.trim()) {
      setError("Silakan pilih akun Google atau masukkan alamat email Anda.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Kata sandi minimal harus terdiri dari 8 karakter.");
      return;
    }
    if (formData.password !== formData.password_confirmation) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const res = isGoogleConnected
        ? await googleAuth({
            email: formData.email,
            nama: formData.nama,
            password: formData.password,
          })
        : await register({
            nama: formData.nama,
            email: formData.email,
            password: formData.password,
          });

      localStorage.setItem("accessToken", res.token);
      localStorage.setItem("userInfo", JSON.stringify(res.user));

      if (kamarId) {
        navigate(`/?pesan_kamar=${kamarId}`);
      } else {
        navigate("/penyewa");
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(
        typeof msg === "string"
          ? msg
          : "Gagal mendaftarkan akun. Periksa kembali data Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGlassLayout
      title="Daftar Akun Penghuni"
      subtitle="Daftar praktis dengan Google & cukup buat kata sandi. Data diri lainnya dilengkapi nanti saat memesan kamar."
    >
      {({ namaKos }) => (
        <>
          {/* Tombol Utama Daftar Cepat dengan Google */}
          <div className="mb-4">
            {isGoogleConnected ? (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#e9f2e1]/90 border border-[#3b6e38]/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <GoogleIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1e3a1c] truncate">
                      Terhubung: {formData.nama || formData.email}
                    </p>
                    <p className="text-[11px] text-gray-700 truncate">
                      {formData.email} • Cukup buat kata sandi di bawah
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(true)}
                  className="text-xs font-semibold text-[#1e3a1c] hover:underline flex-shrink-0"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setGoogleModalOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/80 hover:bg-white border border-white shadow-sm text-xs sm:text-sm font-semibold text-gray-900 transition-all cursor-pointer"
              >
                <GoogleIcon className="w-5 h-5 flex-shrink-0" />
                <span>Daftar Cepat dengan Akun Google</span>
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 bg-red-50/90 border border-red-300 text-red-800 text-xs sm:text-sm rounded-xl px-4 py-2.5">
              <svg
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isGoogleConnected && (
              <>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                    Alamat Email Google
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nama@gmail.com"
                    required
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white/45 hover:bg-white/65 focus:bg-white/90 border border-gray-700/60 focus:border-[#1e3a1c] rounded-lg text-gray-900 placeholder-gray-600/80 focus:outline-none focus:ring-2 focus:ring-[#3b6e38]/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                    Nama Panggilan / Lengkap (Opsional)
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Masukkan nama Anda"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white/45 hover:bg-white/65 focus:bg-white/90 border border-gray-700/60 focus:border-[#1e3a1c] rounded-lg text-gray-900 placeholder-gray-600/80 focus:outline-none focus:ring-2 focus:ring-[#3b6e38]/30 transition-all"
                  />
                </div>
              </>
            )}

            {/* Buat Kata Sandi */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                Buat Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 8 karakter"
                  required
                  className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm bg-white/45 hover:bg-white/65 focus:bg-white/90 border border-gray-700/60 focus:border-[#1e3a1c] rounded-lg text-gray-900 placeholder-gray-600/80 focus:outline-none focus:ring-2 focus:ring-[#3b6e38]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-700 hover:text-[#1e3a1c]"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Konfirmasi Kata Sandi */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                Konfirmasi Kata Sandi
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Ketik ulang kata sandi Anda"
                required
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white/45 hover:bg-white/65 focus:bg-white/90 border border-gray-700/60 focus:border-[#1e3a1c] rounded-lg text-gray-900 placeholder-gray-600/80 focus:outline-none focus:ring-2 focus:ring-[#3b6e38]/30 transition-all"
              />
            </div>

            {/* Catatan Ramah Pengunjung */}
            <div className="p-2.5 rounded-lg bg-white/45 border border-gray-600/30 text-[11px] sm:text-xs text-gray-800 leading-relaxed">
              ✨ <strong>Mudah & Cepat:</strong> Data identitas (KTP, nomor WhatsApp, & alamat asal) tidak perlu diisi sekarang dan bisa dilengkapi nanti saat Anda memesan kamar.
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 px-5 bg-[#1e3a1c] hover:bg-[#2c5429] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Mendaftarkan Akun..." : "Buat Akun Sekarang"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-4 border-t border-gray-600/35" />

          {/* Bottom Link to Login */}
          <p className="text-center text-xs sm:text-sm text-gray-800">
            Sudah memiliki akun?{" "}
            <Link
              to={`/login${kamarId ? `?kamar_id=${kamarId}` : ""}`}
              className="font-bold text-[#1e3a1c] hover:underline"
            >
              Masuk di sini
            </Link>
          </p>

          <GoogleAccountModal
            open={googleModalOpen}
            onClose={() => setGoogleModalOpen(false)}
            onSelectAccount={handleGoogleSelect}
            namaKos={namaKos}
          />
        </>
      )}
    </AuthGlassLayout>
  );
}

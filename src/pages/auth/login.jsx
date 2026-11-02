import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login, googleAuth, getUserInfo } from "../../_sevices/auth";
import AuthGlassLayout, {
  GoogleIcon,
  GoogleAccountModal,
} from "../../components/AuthGlassLayout";

const redirectAfterAuth = (role, navigate, kamarId) => {
  if (role === "administrator" || role === "admin") {
    navigate("/admin");
  } else if (role === "penyewa") {
    if (kamarId) {
      navigate(`/?pesan_kamar=${kamarId}`);
    } else {
      navigate("/penyewa");
    }
  }
};

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const kamarId = searchParams.get("kamar_id") || "";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = getUserInfo();
    if (token && user?.role) {
      redirectAfterAuth(user.role, navigate, kamarId);
    }
  }, [navigate, kamarId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await login(formData);
      localStorage.setItem("accessToken", response.token);
      localStorage.setItem("userInfo", JSON.stringify(response.user));
      redirectAfterAuth(response.user.role, navigate, kamarId);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Email atau kata sandi salah.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSelect = async ({ email, nama }) => {
    setGoogleModalOpen(false);
    setLoading(true);
    setError(null);
    try {
      const res = await googleAuth({ email, nama });
      if (res.needs_password) {
        // Akun Google belum terdaftar -> arahkan ke halaman Register (cukup buat password)
        const params = new URLSearchParams({
          google_email: res.email,
          google_nama: res.nama || "",
        });
        if (kamarId) params.set("kamar_id", kamarId);
        navigate(`/register?${params.toString()}`);
        return;
      }

      localStorage.setItem("accessToken", res.token);
      localStorage.setItem("userInfo", JSON.stringify(res.user));
      redirectAfterAuth(res.user.role, navigate, kamarId);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Gagal masuk dengan Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGlassLayout subtitle="Masuk ke akun Anda untuk mengelola kos atau memantau sewa kamar">
      {({ namaKos }) => (
        <>
          {error && (
            <div className="mb-4 flex items-start gap-2 bg-red-50/90 border border-red-300 text-red-800 text-xs sm:text-sm rounded-xl px-4 py-3">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1.5"
              >
                Alamat Email Anda
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Masukkan alamat email Anda di sini"
                required
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white/45 hover:bg-white/65 focus:bg-white/90 border border-gray-700/60 focus:border-[#1e3a1c] rounded-lg text-gray-900 placeholder-gray-600/80 focus:outline-none focus:ring-2 focus:ring-[#3b6e38]/30 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1.5"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Masukkan kata sandi Anda di sini"
                  required
                  className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm bg-white/45 hover:bg-white/65 focus:bg-white/90 border border-gray-700/60 focus:border-[#1e3a1c] rounded-lg text-gray-900 placeholder-gray-600/80 focus:outline-none focus:ring-2 focus:ring-[#3b6e38]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-700 hover:text-[#1e3a1c]"
                  aria-label="Tampilkan kata sandi"
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

            {/* Remember me & Info */}
            <div className="flex items-center justify-between text-xs text-gray-800 pt-0.5">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-600 text-[#1e3a1c] focus:ring-[#3b6e38]"
                />
                <span>Ingat saya</span>
              </label>
              <Link
                to={`/register${kamarId ? `?kamar_id=${kamarId}` : ""}`}
                className="font-medium text-gray-800 hover:text-[#1e3a1c] hover:underline"
              >
                Belum punya akun?
              </Link>
            </div>

            {/* Submit Button (Project Dark Green) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 px-5 bg-[#1e3a1c] hover:bg-[#2c5429] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 border-t border-gray-600/35" />

          {/* Social Login Row (Sesuai Referensi Gambar) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setGoogleModalOpen(true)}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/65 hover:bg-white/90 border border-white/80 shadow-xs text-xs sm:text-sm font-medium text-gray-900 transition-all cursor-pointer"
            >
              <GoogleIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>Lanjutkan dengan Google</span>
            </button>
          </div>

          {/* Bottom Register Link */}
          <p className="text-center text-xs sm:text-sm text-gray-800 mt-5">
            Belum memiliki akun penghuni?{" "}
            <Link
              to={`/register${kamarId ? `?kamar_id=${kamarId}` : ""}`}
              className="font-bold text-[#1e3a1c] hover:underline"
            >
              Daftar Sekarang
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

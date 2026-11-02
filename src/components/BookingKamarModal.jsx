import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, getUserInfo } from "../_sevices/auth";
import { getPublicProfilKos } from "../_sevices/publicKos";
import { createPenyewa, updatePenyewa } from "../_sevices/penyewa";
import { createKontrakSewa } from "../_sevices/kontrakSewa";
import { formatRupiah, getErrorMessage, todayString } from "./ui";

const addMonths = (dateStr, months) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + Number(months));
  return d.toISOString().split("T")[0];
};

export default function BookingKamarModal({ open, kamar, onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Lengkapi Identitas, 2 = Detail Booking & Pembayaran
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [existingPenyewaId, setExistingPenyewaId] = useState(null);
  const [profilKos, setProfilKos] = useState(null);

  const [identitas, setIdentitas] = useState({
    nama: "",
    nomor_telepon: "",
    nik: "",
    jenis_kelamin: "laki-laki",
    pekerjaan: "",
    alamat_asal: "",
    nama_kontak_darurat: "",
    nomor_kontak_darurat: "",
    foto_ktp: null,
  });

  const [booking, setBooking] = useState({
    tipe_sewa: "bulanan",
    durasi_bulan: 1,
    tanggal_mulai: todayString(),
    tanggal_selesai: addMonths(todayString(), 1),
    metode_pembayaran: "transfer",
    bukti_bayar: null,
    catatan: "",
  });

  useEffect(() => {
    if (!open || !kamar) return;
    setError(null);
    setLoadingProfile(true);

    const localUser = getUserInfo();
    Promise.all([
      getProfile().catch(() => null),
      getPublicProfilKos().catch(() => null),
    ])
      .then(([freshUser, pKos]) => {
        setProfilKos(pKos);
        const u = freshUser || localUser || {};
        if (freshUser) {
          localStorage.setItem("userInfo", JSON.stringify(freshUser));
        }
        const p = u.penyewa;
        setIdentitas({
          nama: u.nama || "",
          nomor_telepon:
            u.nomor_telepon && u.nomor_telepon !== "-" ? u.nomor_telepon : "",
          nik: p?.nik || "",
          jenis_kelamin: p?.jenis_kelamin || "laki-laki",
          pekerjaan: p?.pekerjaan || "",
          alamat_asal: p?.alamat_asal || "",
          nama_kontak_darurat: p?.nama_kontak_darurat || "",
          nomor_kontak_darurat: p?.nomor_kontak_darurat || "",
          foto_ktp: null,
        });

        if (p?.id && p?.nik && p?.alamat_asal) {
          setExistingPenyewaId(p.id);
          setStep(2); // Sudah lengkap -> langsung ke form booking & pembayaran
        } else {
          setExistingPenyewaId(p?.id || null);
          setStep(1); // Belum lengkap -> minta lengkapi data diri dulu
        }
      })
      .finally(() => setLoadingProfile(false));
  }, [open, kamar]);

  if (!open || !kamar) return null;

  const handleIdentitasChange = (e) => {
    const { name, value } = e.target;
    if (name === "nik") {
      setIdentitas((prev) => ({
        ...prev,
        nik: value.replace(/\D/g, "").slice(0, 16),
      }));
      return;
    }
    setIdentitas((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveIdentitas = async (e) => {
    e.preventDefault();
    setError(null);

    if (!identitas.nama.trim() || !identitas.nomor_telepon.trim()) {
      setError("Mohon isi nama lengkap dan nomor WhatsApp aktif Anda.");
      return;
    }
    if (identitas.nik.length !== 16) {
      setError("NIK harus berjumlah tepat 16 digit angka sesuai KTP.");
      return;
    }
    if (!identitas.alamat_asal.trim()) {
      setError("Mohon isi alamat asal sesuai KTP Anda.");
      return;
    }

    setSaving(true);
    try {
      const res = existingPenyewaId
        ? await updatePenyewa(existingPenyewaId, identitas)
        : await createPenyewa(identitas);

      const savedPenyewa = res?.data;
      if (savedPenyewa?.id) {
        setExistingPenyewaId(savedPenyewa.id);
      }

      const updatedUser = await getProfile().catch(() => null);
      if (updatedUser) {
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      }

      setStep(2);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal menyimpan data identitas penghuni."));
    } finally {
      setSaving(false);
    }
  };

  const handleBookingChange = (field, value) => {
    setBooking((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "tipe_sewa") {
        const months = value === "tahunan" ? 12 : prev.durasi_bulan;
        next.durasi_bulan = months;
        next.tanggal_selesai = addMonths(next.tanggal_mulai, months);
      } else if (field === "durasi_bulan") {
        next.tanggal_selesai = addMonths(next.tanggal_mulai, value);
      } else if (field === "tanggal_mulai") {
        next.tanggal_selesai = addMonths(value, next.durasi_bulan);
      }
      return next;
    });
  };

  const totalEstimasi =
    booking.tipe_sewa === "tahunan" && kamar.harga_tahunan
      ? Number(kamar.harga_tahunan)
      : Number(kamar.harga_bulanan) * Number(booking.durasi_bulan || 1);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createKontrakSewa({
        penyewa_id: existingPenyewaId,
        kamar_id: kamar.id,
        tanggal_mulai: booking.tanggal_mulai,
        tanggal_selesai: booking.tanggal_selesai,
        tipe_sewa: booking.tipe_sewa,
        harga_sewa: totalEstimasi,
        metode_pembayaran: booking.metode_pembayaran,
        bukti_bayar: booking.bukti_bayar,
        catatan: booking.catatan,
      });

      onClose();
      navigate("/penyewa/kontrak-sewa");
    } catch (err) {
      setError(getErrorMessage(err, "Gagal mengajukan pemesanan kamar."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100">
        {/* Header Modal */}
        <div className="bg-[#264624] text-white px-5 sm:px-7 py-5 flex items-start justify-between gap-3">
          <div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full mb-1">
              Booking Kamar & Pembayaran
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold">
              Kamar {kamar.nomor_kamar} ({kamar.tipe_kamar})
            </h3>
            <p className="text-xs text-green-100/90 mt-0.5">
              {formatRupiah(kamar.harga_bulanan)} / bulan • Lantai {kamar.lantai}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Stepper Bar */}
        <div className="bg-[#f1f6ec] px-5 sm:px-7 py-3 border-b border-[#d6e4c8] flex items-center justify-between text-xs font-semibold">
          <div
            className={`flex items-center gap-2 ${
              step === 1 ? "text-[#264624] font-bold" : "text-gray-500"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                step === 1
                  ? "bg-[#264624] text-white"
                  : "bg-green-200 text-[#264624]"
              }`}
            >
              {existingPenyewaId && step === 2 ? "✓" : "1"}
            </span>
            <span>1. Data Diri Pemesan</span>
          </div>

          <div className="w-8 sm:w-14 h-0.5 bg-gray-300" />

          <div
            className={`flex items-center gap-2 ${
              step === 2 ? "text-[#264624] font-bold" : "text-gray-400"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                step === 2
                  ? "bg-[#264624] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </span>
            <span>2. Jadwal & Pembayaran</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-7">
          {loadingProfile ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Memeriksa kelengkapan data akun Anda...
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleSaveIdentitas} className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                    Sebelum melanjutkan booking <strong>Kamar {kamar.nomor_kamar}</strong>, silakan lengkapi data identitas penghuni Anda terlebih dahulu (cukup diisi satu kali).
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nama Lengkap (Sesuai KTP) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nama"
                        value={identitas.nama}
                        onChange={handleIdentitasChange}
                        required
                        className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6e38]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="nomor_telepon"
                        value={identitas.nomor_telepon}
                        onChange={handleIdentitasChange}
                        placeholder="0812xxxxxxxx"
                        required
                        className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6e38]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        NIK (16 Digit KTP) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nik"
                        value={identitas.nik}
                        onChange={handleIdentitasChange}
                        maxLength={16}
                        placeholder="16 digit NIK KTP"
                        required
                        className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6e38]"
                      />
                      <span className="text-[11px] text-gray-400">
                        {identitas.nik.length}/16 digit
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Jenis Kelamin <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="jenis_kelamin"
                        value={identitas.jenis_kelamin}
                        onChange={handleIdentitasChange}
                        className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6e38]"
                      >
                        <option value="laki-laki">Laki-laki</option>
                        <option value="perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Pekerjaan / Kampus
                      </label>
                      <input
                        type="text"
                        name="pekerjaan"
                        value={identitas.pekerjaan}
                        onChange={handleIdentitasChange}
                        placeholder="Mahasiswa / Karyawan"
                        className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6e38]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Upload Foto KTP (Opsional)
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) =>
                          setIdentitas((prev) => ({
                            ...prev,
                            foto_ktp: e.target.files?.[0] || null,
                          }))
                        }
                        className="w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#e9f2e1] file:text-[#264624]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Alamat Asal Sesuai KTP <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="alamat_asal"
                      rows={2}
                      value={identitas.alamat_asal}
                      onChange={handleIdentitasChange}
                      placeholder="Jl. Contoh No. 10, Kelurahan, Kecamatan, Kota"
                      required
                      className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6e38]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nama Kontak Darurat (Orang Tua/Wali)
                      </label>
                      <input
                        type="text"
                        name="nama_kontak_darurat"
                        value={identitas.nama_kontak_darurat}
                        onChange={handleIdentitasChange}
                        placeholder="Nama Orang Tua / Wali"
                        className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6e38]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        No. Telepon Kontak Darurat
                      </label>
                      <input
                        type="tel"
                        name="nomor_kontak_darurat"
                        value={identitas.nomor_kontak_darurat}
                        onChange={handleIdentitasChange}
                        placeholder="0813xxxxxxxx"
                        className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6e38]"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#264624] hover:bg-[#3b6e38] rounded-xl shadow-sm disabled:opacity-60"
                    >
                      {saving ? "Menyimpan..." : "Simpan & Lanjut ke Pembayaran →"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  {/* Ringkasan Identitas Pemesan */}
                  <div className="p-3.5 bg-[#f1f6ec] border border-[#d6e4c8] rounded-xl flex items-center justify-between gap-3">
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-[#264624]">
                        Pemesan: {identitas.nama} (NIK: {identitas.nik})
                      </p>
                      <p className="text-gray-600">
                        WhatsApp: {identitas.nomor_telepon} • {identitas.alamat_asal}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-semibold text-[#264624] hover:underline flex-shrink-0"
                    >
                      Ubah Data
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Tipe Sewa <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={booking.tipe_sewa}
                        onChange={(e) => handleBookingChange("tipe_sewa", e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6e38]"
                      >
                        <option value="bulanan">
                          Bulanan ({formatRupiah(kamar.harga_bulanan)} / bln)
                        </option>
                        {kamar.harga_tahunan && (
                          <option value="tahunan">
                            Tahunan ({formatRupiah(kamar.harga_tahunan)} / thn)
                          </option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Durasi Sewa
                      </label>
                      <select
                        value={booking.durasi_bulan}
                        onChange={(e) =>
                          handleBookingChange("durasi_bulan", Number(e.target.value))
                        }
                        disabled={booking.tipe_sewa === "tahunan"}
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6e38] disabled:bg-gray-100"
                      >
                        <option value={1}>1 Bulan</option>
                        <option value={3}>3 Bulan</option>
                        <option value={6}>6 Bulan</option>
                        <option value={12}>12 Bulan (1 Tahun)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Tanggal Mulai Masuk Kos <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={booking.tanggal_mulai}
                        onChange={(e) =>
                          handleBookingChange("tanggal_mulai", e.target.value)
                        }
                        required
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6e38]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Tanggal Selesai Kontrak <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={booking.tanggal_selesai}
                        onChange={(e) =>
                          setBooking((prev) => ({
                            ...prev,
                            tanggal_selesai: e.target.value,
                          }))
                        }
                        required
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6e38]"
                      />
                    </div>
                  </div>

                  {/* Pilihan Opsi Pembayaran Booking (Cash / Transfer / QRIS) */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Opsi Pembayaran Booking
                      </span>
                      <span className="text-sm font-extrabold text-[#264624]">
                        Total: {formatRupiah(totalEstimasi)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "tunai", label: "💵 Cash / Tunai" },
                        { id: "transfer", label: "🏦 Transfer Bank" },
                        { id: "qris", label: "📱 QRIS" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setBooking((prev) => ({
                              ...prev,
                              metode_pembayaran: opt.id,
                            }))
                          }
                          className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            booking.metode_pembayaran === opt.id
                              ? "bg-[#264624] text-white border-[#264624] shadow-xs"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {booking.metode_pembayaran === "tunai" ? (
                      <p className="text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200">
                        💡 Anda memilih <strong>Cash / Tunai</strong>. Silakan ajukan booking ini, lalu bayar langsung kepada Admin saat check-in / survei lokasi untuk dikonfirmasi.
                      </p>
                    ) : (
                      <div className="space-y-2.5 bg-white p-3 rounded-lg border border-gray-200 text-xs">
                        <div>
                          <p className="text-gray-500">Transfer ke Rekening Resmi Kos:</p>
                          <p className="font-bold text-gray-900 text-sm">
                            {profilKos?.nama_bank || "BCA"} —{" "}
                            {profilKos?.nomor_rekening || "1234567890"}
                          </p>
                          <p className="text-gray-600">
                            a.n. {profilKos?.atas_nama_rekening || profilKos?.nama_kos || "Pengelola Kos"}
                          </p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700 mb-1">
                            Upload Bukti Transfer / QRIS (Bisa menyusul di menu Tagihan)
                          </label>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={(e) =>
                              setBooking((prev) => ({
                                ...prev,
                                bukti_bayar: e.target.files?.[0] || null,
                              }))
                            }
                            className="w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#e9f2e1] file:text-[#264624]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Catatan untuk Admin (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={booking.catatan}
                      onChange={(e) =>
                        setBooking((prev) => ({ ...prev, catatan: e.target.value }))
                      }
                      placeholder="Contoh: Rencana masuk kos hari Sabtu pukul 10.00 WIB"
                      className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6e38]"
                    />
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate("/penyewa/chat");
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#264624] bg-[#e9f2e1] hover:bg-[#d8e8c8] rounded-xl transition-colors cursor-pointer"
                    >
                      💬 Chat Admin Dulu
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#264624] hover:bg-[#3b6e38] rounded-xl shadow-sm disabled:opacity-60 cursor-pointer"
                      >
                        {saving ? "Memproses..." : "Ajukan Booking Kamar"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

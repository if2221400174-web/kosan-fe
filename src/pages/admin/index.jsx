import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getKamar } from "../../_sevices/kamar";
import { getPenyewa } from "../../_sevices/penyewa";
import { getKontrakSewa, updateKontrakSewa } from "../../_sevices/kontrakSewa";
import { getTagihan } from "../../_sevices/tagihan";
import { getPembayaran } from "../../_sevices/pembayaran";
import { getPengeluaran } from "../../_sevices/pengeluaran";
import { getLaporan } from "../../_sevices/laporan";
import { fetchSmartNotifications } from "../../_sevices/notifikasi";
import { getUserInfo } from "../../_sevices/auth";
import {
  DecorativeWave,
  Loading,
  StatCard,
  StatusBadge,
  formatRupiah,
  formatTanggal,
} from "../../components/ui";

export default function Dashboard() {
  const user = getUserInfo();
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState("Bulan");
  const [searchTable, setSearchTable] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);

  const [data, setData] = useState({
    kamar: [],
    penyewa: [],
    kontrak: [],
    tagihan: [],
    pembayaran: [],
    pengeluaran: [],
    laporan: [],
    notifications: [],
    activities: [],
  });

  const loadDashboard = async () => {
    try {
      const [
        kamar,
        penyewa,
        kontrak,
        tagihan,
        pembayaran,
        pengeluaran,
        laporan,
        notifData,
      ] = await Promise.all([
        getKamar().catch(() => []),
        getPenyewa().catch(() => []),
        getKontrakSewa().catch(() => []),
        getTagihan().catch(() => []),
        getPembayaran().catch(() => []),
        getPengeluaran().catch(() => []),
        getLaporan().catch(() => []),
        fetchSmartNotifications(user?.role || "admin").catch(() => ({
          notifications: [],
          activities: [],
        })),
      ]);
      setData({
        kamar: kamar || [],
        penyewa: penyewa || [],
        kontrak: kontrak || [],
        tagihan: tagihan || [],
        pembayaran: pembayaran || [],
        pengeluaran: pengeluaran || [],
        laporan: laporan || [],
        notifications: notifData.notifications || [],
        activities: notifData.activities || [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickConfirmBooking = async (kontrak) => {
    if (
      !window.confirm(
        `Konfirmasi booking ${kontrak.kode_kontrak} untuk ${
          kontrak.penyewa?.user?.nama || "Penyewa"
        } di Kamar ${kontrak.kamar?.nomor_kamar}? Status kamar akan otomatis menjadi Terisi.`
      )
    )
      return;

    setConfirmingId(kontrak.id);
    try {
      await updateKontrakSewa(kontrak.id, {
        penyewa_id: kontrak.penyewa_id,
        kamar_id: kontrak.kamar_id,
        tanggal_mulai: String(kontrak.tanggal_mulai).substring(0, 10),
        tanggal_selesai: String(kontrak.tanggal_selesai).substring(0, 10),
        tipe_sewa: kontrak.tipe_sewa,
        harga_sewa: kontrak.harga_sewa,
        status_kontrak: "aktif",
        catatan: kontrak.catatan,
      });
      await loadDashboard();
    } catch (err) {
      alert("Gagal mengonfirmasi booking: " + (err?.response?.data?.message || err.message));
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) return <Loading text="Memuat Dashboard Kosan..." />;

  const kamarTersedia = data.kamar.filter((k) => k.status_kamar === "tersedia").length;
  const kamarTerisi = data.kamar.filter((k) => k.status_kamar === "terisi").length;
  const kamarPerbaikan = data.kamar.filter((k) => k.status_kamar === "perbaikan").length;
  const bookingMenunggu = data.kontrak.filter((k) => k.status_kontrak === "menunggu");
  const pembayaranMenunggu = data.pembayaran.filter(
    (p) => p.status_pembayaran === "menunggu_verifikasi"
  );
  const laporanMenunggu = data.laporan.filter((l) => l.status === "menunggu");

  const totalPemasukan = data.pembayaran
    .filter((p) => p.status_pembayaran === "diterima")
    .reduce((sum, p) => sum + Number(p.jumlah_bayar || 0), 0);
  const totalPengeluaran = data.pengeluaran.reduce(
    (sum, p) => sum + Number(p.jumlah || 0),
    0
  );

  // Data Bar Chart
  const barStats = [
    { label: "Kamar", val: data.kamar.length || 1, max: Math.max(data.kamar.length, 10) },
    { label: "Penyewa", val: data.penyewa.length || 1, max: Math.max(data.kamar.length, 10) },
    { label: "Booking", val: bookingMenunggu.length, max: Math.max(data.kamar.length, 10) },
    { label: "Kontrak", val: data.kontrak.length || 1, max: Math.max(data.kamar.length, 10) },
    { label: "Lunas", val: data.tagihan.filter((t) => t.status_tagihan === "lunas").length, max: Math.max(data.kamar.length, 10) },
  ];

  // Filter Tabel Kontrak/Booking
  const filteredKontrak = data.kontrak.filter((k) => {
    const matchStatus = filterStatus === "semua" || k.status_kontrak === filterStatus;
    const matchSearch =
      !searchTable ||
      [
        k.kode_kontrak,
        k.penyewa?.user?.nama,
        k.penyewa?.user?.email,
        k.kamar?.nomor_kamar,
      ].some((v) => String(v || "").toLowerCase().includes(searchTable.toLowerCase()));
    const matchFrom =
      !dateFrom || String(k.tanggal_mulai).substring(0, 10) >= dateFrom;
    const matchTo =
      !dateTo || String(k.tanggal_selesai).substring(0, 10) <= dateTo;
    return matchStatus && matchSearch && matchFrom && matchTo;
  });

  const totalKamar = Math.max(data.kamar.length, 1);
  const pctTerisi = Math.round((kamarTerisi / totalKamar) * 100);
  const pctTersedia = Math.round((kamarTersedia / totalKamar) * 100);

  return (
    <div className="space-y-5">
      {/* ================= BARIS FILTER TANGGAL & RINGKASANKEUANGAN (Sesuai Referensi) ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 bg-[#f9e1e0] text-[#9b3b3b] px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs border border-[#f2c6c4]">
            <span>📅</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            />
          </div>
          <span className="text-gray-500 font-bold">—</span>
          <div className="inline-flex items-center gap-2 bg-[#f9e1e0] text-[#9b3b3b] px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs border border-[#f2c6c4]">
            <span>📅</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="px-4 py-1.5 rounded-xl bg-[#264624] hover:bg-[#3b6e38] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 font-bold text-[#264624]">
            Pemasukan: {formatRupiah(totalPemasukan)}
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 font-bold text-red-600">
            Pengeluaran: {formatRupiah(totalPengeluaran)}
          </span>
        </div>
      </div>

      {/* ================= 4 STAT CARDS DENGAN GELOMBANG (Persis Referensi Gambar) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Penyewa"
          value={data.penyewa.length}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Kamar Terisi (Check-In)"
          value={kamarTerisi}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          label="Kamar Tersedia"
          value={kamarTersedia}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Butuh Konfirmasi"
          value={
            bookingMenunggu.length +
            pembayaranMenunggu.length +
            laporanMenunggu.length
          }
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
        />
      </div>

      {/* ================= BANNER PERINGATAN & KONFIRMASI CEPAT ADMIN ================= */}
      {(bookingMenunggu.length > 0 ||
        pembayaranMenunggu.length > 0 ||
        laporanMenunggu.length > 0) && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border-l-4 border-amber-500 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <span>🔔 Pengingat Tindakan Admin Pengelola</span>
            </h3>
            <p className="text-xs text-gray-600">
              Terdapat{" "}
              <strong>{bookingMenunggu.length} booking kamar baru</strong>,{" "}
              <strong>{pembayaranMenunggu.length} pembayaran menunggu verifikasi</strong>, dan{" "}
              <strong>{laporanMenunggu.length} laporan keluhan baru</strong> yang memerlukan konfirmasi Anda.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {bookingMenunggu.length > 0 && (
              <Link
                to="/admin/kontrak-sewa"
                className="px-3.5 py-2 rounded-xl bg-[#264624] hover:bg-[#3b6e38] text-white text-xs font-bold"
              >
                Konfirmasi Booking ({bookingMenunggu.length})
              </Link>
            )}
            {pembayaranMenunggu.length > 0 && (
              <Link
                to="/admin/pembayaran"
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
              >
                Verifikasi Bayar ({pembayaranMenunggu.length})
              </Link>
            )}
            <Link
              to="/admin/chat"
              className="px-3.5 py-2 rounded-xl border border-[#264624] text-[#264624] hover:bg-[#e9f2e1] text-xs font-bold"
            >
              💬 Buka Ruang Chat
            </Link>
          </div>
        </div>
      )}

      {/* ================= BARIS GRAFIK: BAR CHART & DONUT CHART (Persis Referensi Gambar) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Kiri: Bar Chart Statistik Kosan */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900">
                Statistik Hunian & Transaksi
              </h3>
              <p className="text-xs text-gray-500">
                Perbandingan kamar, penyewa, booking, dan tagihan lunas
              </p>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
              {["Minggu", "Bulan", "Tahun"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setChartPeriod(p)}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    chartPeriod === p
                      ? "bg-[#3b6e38] text-white shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Grafik Batang dengan Sumbu X & Y */}
          <div className="relative pt-4 pb-2 px-4 sm:px-8 border-l-2 border-b-2 border-gray-800 h-52 flex items-end justify-around gap-4">
            {barStats.map((b, i) => {
              const heightPct = Math.max(
                18,
                Math.min(100, Math.round((b.val / b.max) * 100))
              );
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end h-full group"
                >
                  <span className="text-[11px] font-bold text-gray-700 mb-1">
                    {b.val}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[46px] rounded-t-md bg-gradient-to-t from-[#264624] via-[#3b6e38] to-[#8ab881] transition-all duration-500 group-hover:opacity-90 shadow-xs"
                  />
                  <span className="text-[11px] font-semibold text-gray-600 mt-2">
                    {b.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kanan: Donut Chart Komposisi Kamar & Booking */}
        <div className="lg:col-span-5 relative bg-white rounded-2xl p-5 sm:p-6 pb-10 shadow-sm border border-gray-200/80 overflow-hidden flex flex-col justify-between">
          <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900 mb-3">
            Komposisi Kamar & Booking
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center my-auto">
            {/* Legend */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-xs bg-[#264624] flex-shrink-0" />
                <span className="text-gray-700 font-medium">
                  Terisi ({kamarTerisi} Kamar)
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-xs bg-[#6ca368] flex-shrink-0" />
                <span className="text-gray-700 font-medium">
                  Tersedia ({kamarTersedia} Kamar)
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-xs bg-[#f59e0b] flex-shrink-0" />
                <span className="text-gray-700 font-medium">
                  Booking Menunggu ({bookingMenunggu.length})
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-xs bg-gray-300 flex-shrink-0" />
                <span className="text-gray-700 font-medium">
                  Perbaikan ({kamarPerbaikan})
                </span>
              </div>
            </div>

            {/* SVG Donut Ring */}
            <div className="flex justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="5.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#6ca368"
                    strokeWidth="5.5"
                    strokeDasharray={`${pctTersedia + pctTerisi} 100`}
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#264624"
                    strokeWidth="5.5"
                    strokeDasharray={`${pctTerisi} 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-extrabold text-[#264624]">
                    {pctTerisi}%
                  </span>
                  <span className="text-[10px] text-gray-500 font-semibold">
                    Okupansi
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DecorativeWave />
        </div>
      </div>

      {/* ================= BARIS BAWAH: TABEL BOOKING/PENYEWA & LOG AKTIVITAS ROLE (Persis Referensi) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Kiri (8 Kolom): Tabel Booking & Penghuni Kos Terbaru */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
          {/* Header Bar Hijau Tua + Search Pill + Filter Dropdown */}
          <div className="bg-[#264624] text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-serif text-base sm:text-lg font-bold tracking-wide">
              Daftar Booking & Kontrak Penghuni
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white rounded-full px-3.5 py-1 text-gray-800 w-44 sm:w-52">
                <input
                  type="text"
                  value={searchTable}
                  onChange={(e) => setSearchTable(e.target.value)}
                  placeholder="Cari penyewa / kamar..."
                  className="w-full text-xs bg-transparent focus:outline-none"
                />
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#3b6e38] text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/20 focus:outline-none cursor-pointer"
              >
                <option value="semua">Semua Status</option>
                <option value="menunggu">Menunggu Konfirmasi</option>
                <option value="aktif">Aktif</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
          </div>

          {/* Isi Tabel */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left text-gray-700">
              <thead className="text-xs font-serif font-bold text-gray-900 border-b border-gray-200 bg-white">
                <tr>
                  <th className="px-4 py-3">Penyewa</th>
                  <th className="px-4 py-3">Kamar</th>
                  <th className="px-4 py-3">Mulai Sewa</th>
                  <th className="px-4 py-3">Selesai Sewa</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 [&>tr:nth-child(odd)]:bg-[#cfe2c8]/55 [&>tr:hover]:bg-[#bdd7b3]/60 transition-colors">
                {filteredKontrak.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-gray-400">
                      Belum ada data booking / kontrak sewa yang sesuai
                    </td>
                  </tr>
                ) : (
                  filteredKontrak.slice(0, 7).map((k) => (
                    <tr key={k.id}>
                      <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2.5 whitespace-nowrap">
                        <span className="w-7 h-7 rounded-full bg-[#264624] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {k.penyewa?.user?.nama?.charAt(0)?.toUpperCase() || "P"}
                        </span>
                        <div>
                          <p className="font-bold leading-tight">
                            {k.penyewa?.user?.nama || "Penyewa"}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {k.penyewa?.user?.nomor_telepon || k.kode_kontrak}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#264624] whitespace-nowrap">
                        Kamar {k.kamar?.nomor_kamar || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                        {formatTanggal(k.tanggal_mulai)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                        {formatTanggal(k.tanggal_selesai)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={k.status_kontrak} />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {k.status_kontrak === "menunggu" ? (
                          <button
                            type="button"
                            disabled={confirmingId === k.id}
                            onClick={() => handleQuickConfirmBooking(k)}
                            className="px-3 py-1 rounded-lg bg-[#264624] hover:bg-[#3b6e38] text-white text-xs font-bold shadow-2xs cursor-pointer disabled:opacity-50"
                          >
                            {confirmingId === k.id ? "..." : "✓ Konfirmasi"}
                          </button>
                        ) : (
                          <Link
                            to={`/admin/kontrak-sewa/edit/${k.id}`}
                            className="text-xs font-bold text-[#264624] hover:underline"
                          >
                            Detail
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kanan (4 Kolom): Monitoring Aktivitas Role (Penyewa & Admin) — Persis Kartu Kanan Bawah di Referensi */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden flex flex-col">
          <div className="bg-[#b7d4a8] text-[#1e3a1c] px-4 py-3 flex items-center justify-between">
            <span className="font-serif text-xs sm:text-sm font-extrabold">
              Aktivitas Role (Admin & Penyewa)
            </span>
            <span className="text-[11px] font-bold bg-white/70 px-2 py-0.5 rounded-full">
              Live Log
            </span>
          </div>

          <div className="p-3.5 space-y-2.5 flex-1 overflow-y-auto max-h-80">
            {data.activities.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">
                Belum ada aktivitas tercatat
              </p>
            ) : (
              data.activities.slice(0, 8).map((act) => (
                <div
                  key={act.id}
                  className="flex items-start justify-between gap-2.5 p-2.5 rounded-xl bg-[#f4f8f1] hover:bg-[#e6f0e0] transition-colors border border-[#dfecd8]"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#264624] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {act.actorName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {act.actorName}
                      </p>
                      <p className="text-[11px] text-gray-600 leading-snug">
                        {act.action}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${
                      act.actorRole === "penyewa"
                        ? "bg-green-100 text-[#264624]"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {act.actorRole}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

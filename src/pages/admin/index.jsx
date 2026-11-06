import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getKamar } from "../../_sevices/kamar";
import { getPenyewa } from "../../_sevices/penyewa";
import { getKontrakSewa, updateKontrakSewa } from "../../_sevices/kontrakSewa";
import { getTagihan } from "../../_sevices/tagihan";
import { getPembayaran } from "../../_sevices/pembayaran";
import { getPengeluaran } from "../../_sevices/pengeluaran";
import { getLaporan } from "../../_sevices/laporan";
import { fetchSmartNotifications } from "../../_sevices/notifikasi";
import { getUserInfo } from "../../_sevices/auth";
import { Loading, Panel, StatCard, StatusBadge, formatRupiah, formatTanggal, getErrorMessage } from "../../components/ui";
import { ChartLegend, HBarList, LineChart, PieChart, lastMonths, sumByMonth } from "../../components/charts";

const ICON = {
  kamar: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  booking: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  key: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
  bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  users: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
};

const Svg = ({ d, className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  </svg>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUserInfo();
  const isAdministrator = user?.role === "administrator";

  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("menunggu");
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
      const [kamar, penyewa, kontrak, tagihan, pembayaran, pengeluaran, laporan, notif] = await Promise.all([
        getKamar().catch(() => []),
        getPenyewa().catch(() => []),
        getKontrakSewa().catch(() => []),
        getTagihan().catch(() => []),
        getPembayaran().catch(() => []),
        getPengeluaran().catch(() => []),
        getLaporan().catch(() => []),
        fetchSmartNotifications(user?.role || "admin").catch(() => ({ notifications: [], activities: [] })),
      ]);
      setData({
        kamar: kamar || [],
        penyewa: penyewa || [],
        kontrak: kontrak || [],
        tagihan: tagihan || [],
        pembayaran: pembayaran || [],
        pengeluaran: pengeluaran || [],
        laporan: laporan || [],
        notifications: notif.notifications || [],
        activities: notif.activities || [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== Olah data untuk grafik ======
  const months = useMemo(() => lastMonths(6), []);

  const pemasukanBulanan = useMemo(
    () =>
      sumByMonth(
        data.pembayaran.filter((p) => p.status_pembayaran === "diterima"),
        months,
        (p) => p.tanggal_bayar || p.created_at,
        (p) => p.jumlah_bayar
      ),
    [data.pembayaran, months]
  );

  const pengeluaranBulanan = useMemo(
    () => sumByMonth(data.pengeluaran, months, (e) => e.tanggal_pengeluaran || e.created_at, (e) => e.jumlah),
    [data.pengeluaran, months]
  );

  const pendapatanPerKamar = useMemo(() => {
    const map = {};
    data.pembayaran
      .filter((p) => p.status_pembayaran === "diterima")
      .forEach((p) => {
        const no = p.tagihan?.kontrak_sewa?.kamar?.nomor_kamar;
        if (!no) return;
        const key = `Kamar ${no}`;
        map[key] = (map[key] || 0) + Number(p.jumlah_bayar || 0);
      });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [data.pembayaran]);

  if (loading) return <Loading text="Memuat dashboard..." />;

  const kamarTersedia = data.kamar.filter((k) => k.status_kamar === "tersedia").length;
  const kamarTerisi = data.kamar.filter((k) => k.status_kamar === "terisi").length;
  const kamarPerbaikan = data.kamar.filter((k) => ["perbaikan", "nonaktif"].includes(k.status_kamar)).length;
  const kontrakAktif = data.kontrak.filter((k) => k.status_kontrak === "aktif");
  const bookingMenunggu = data.kontrak.filter((k) => k.status_kontrak === "menunggu");
  const bayarMenunggu = data.pembayaran.filter((p) => p.status_pembayaran === "menunggu_verifikasi");
  const laporanBaru = data.laporan.filter((l) => l.status === "menunggu");
  const butuhTindakan = bookingMenunggu.length + bayarMenunggu.length + laporanBaru.length;

  const totalPemasukan = pemasukanBulanan.reduce((s, v) => s + v, 0);
  const totalPengeluaran = pengeluaranBulanan.reduce((s, v) => s + v, 0);

  const kontrakTampil = data.kontrak
    .filter((k) => filterStatus === "semua" || k.status_kontrak === filterStatus)
    .filter((k) =>
      [k.kode_kontrak, k.penyewa?.user?.nama, k.kamar?.nomor_kamar].some((v) =>
        String(v || "").toLowerCase().includes(search.toLowerCase())
      )
    );

  const handleConfirm = async (k) => {
    if (
      !window.confirm(
        `Konfirmasi booking ${k.kode_kontrak} untuk ${k.penyewa?.user?.nama || "penyewa"} di Kamar ${k.kamar?.nomor_kamar}?`
      )
    )
      return;
    setConfirmingId(k.id);
    try {
      await updateKontrakSewa(k.id, {
        penyewa_id: k.penyewa_id,
        kamar_id: k.kamar_id,
        tanggal_mulai: String(k.tanggal_mulai).substring(0, 10),
        tanggal_selesai: String(k.tanggal_selesai).substring(0, 10),
        tipe_sewa: k.tipe_sewa,
        harga_sewa: k.harga_sewa,
        status_kontrak: "aktif",
        catatan: k.catatan,
      });
      await loadDashboard();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal mengonfirmasi booking"));
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* ================= RINGKASAN (Over View) ================= */}
      <Panel title="Ringkasan">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 pt-1">
          <StatCard label="Total Kamar" value={data.kamar.length} icon={<Svg d={ICON.kamar} />} onClick={() => navigate("/admin/kamar")} />
          <StatCard label="Kontrak Aktif" value={kontrakAktif.length} icon={<Svg d={ICON.booking} />} onClick={() => navigate("/admin/kontrak-sewa")} />
          <StatCard label="Kamar Tersedia" value={kamarTersedia} icon={<Svg d={ICON.key} />} onClick={() => navigate("/admin/kamar")} />
          <StatCard
            label="Butuh Konfirmasi"
            value={butuhTindakan}
            tone={butuhTindakan > 0 ? "orange" : "green"}
            icon={<Svg d={ICON.bell} />}
            hint={`${bookingMenunggu.length} booking, ${bayarMenunggu.length} pembayaran, ${laporanBaru.length} laporan`}
            onClick={() => navigate(bookingMenunggu.length ? "/admin/kontrak-sewa" : bayarMenunggu.length ? "/admin/pembayaran" : "/admin/laporan")}
          />
        </div>
      </Panel>

      {/* ================= BARIS GRAFIK ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Jumlah penghuni */}
        <Panel
          title="Jumlah Penghuni"
          className="lg:col-span-3"
          action={
            <Link to="/admin/penyewa" className="text-gray-400 hover:text-[#264624] text-lg leading-none" title="Lihat penyewa">
              ⋮
            </Link>
          }
        >
          <div className="flex flex-col justify-center h-full gap-3 py-2">
            <div className="w-12 h-12 rounded-xl bg-[#e9f2e1] border border-[#b7d4a5] text-[#264624] flex items-center justify-center">
              <Svg d={ICON.users} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900 leading-none">{kontrakAktif.length}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Penghuni aktif</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
              <div>
                <p className="font-bold text-gray-900">{data.penyewa.length}</p>
                <p className="text-gray-500">Akun penyewa</p>
              </div>
              <div>
                <p className="font-bold text-amber-600">{bookingMenunggu.length}</p>
                <p className="text-gray-500">Calon penyewa</p>
              </div>
            </div>
          </div>
        </Panel>

        {/* Okupansi kamar (pie) */}
        <Panel title="Okupansi Kamar" className="lg:col-span-5">
          <div className="flex flex-col sm:flex-row items-center justify-around gap-5 py-2 h-full">
            <PieChart
              size={160}
              data={[
                { label: "Terisi", value: kamarTerisi, color: "#264624" },
                { label: "Perbaikan", value: kamarPerbaikan, color: "#d1d5db", textColor: "#374151" },
                { label: "Tersedia", value: kamarTersedia, color: "#a9c99a", textColor: "#1e3a1c" },
              ]}
            />
            <ChartLegend
              items={[
                { label: "Kamar terisi", value: kamarTerisi, color: "#264624" },
                { label: "Kamar tersedia", value: kamarTersedia, color: "#a9c99a" },
                { label: "Perbaikan / nonaktif", value: kamarPerbaikan, color: "#d1d5db" },
              ]}
            />
          </div>
        </Panel>

        {/* Pendapatan per kamar (bar horizontal) */}
        <Panel title="Pendapatan per Kamar" className="lg:col-span-4 lg:row-span-2" action={<span className="text-gray-500">Top 10</span>}>
          <div className="pt-2">
            <HBarList items={pendapatanPerKamar} color="#3b6e38" emptyText="Belum ada pembayaran yang diterima" />
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-[#f1f6ec] p-3">
              <p className="text-gray-500">Pemasukan 6 bln</p>
              <p className="text-sm font-extrabold text-[#264624] mt-0.5">{formatRupiah(totalPemasukan)}</p>
            </div>
            <div className="rounded-xl bg-[#fdf1ea] p-3">
              <p className="text-gray-500">Pengeluaran 6 bln</p>
              <p className="text-sm font-extrabold text-[#c2622d] mt-0.5">{formatRupiah(totalPengeluaran)}</p>
            </div>
          </div>
        </Panel>

        {/* Pemasukan vs Pengeluaran */}
        <Panel title="Pemasukan vs Pengeluaran" className="lg:col-span-8" action={<span className="text-gray-500 font-medium">6 bulan terakhir</span>}>
          <div className="flex items-center gap-4 text-xs pb-1">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#3b6e38]" />Pemasukan</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#c2622d]" />Pengeluaran</span>
          </div>
          <LineChart
            labels={months.map((m) => m.label)}
            series={[
              { label: "Pengeluaran", color: "#c2622d", values: pengeluaranBulanan },
              { label: "Pemasukan", color: "#3b6e38", values: pemasukanBulanan },
            ]}
          />
        </Panel>
      </div>

      {/* ================= BOOKING & AKTIVITAS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Panel
          title="Booking & Kontrak"
          className="lg:col-span-8"
          bodyClassName="px-0 sm:px-0"
          action={
            <>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari..."
                className="hidden sm:block w-36 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3b6e38]/30"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-full border border-gray-200 bg-white font-semibold text-[#264624] focus:outline-none cursor-pointer"
              >
                <option value="menunggu">Menunggu ({bookingMenunggu.length})</option>
                <option value="aktif">Aktif</option>
                <option value="selesai">Selesai</option>
                <option value="semua">Semua</option>
              </select>
            </>
          }
        >
          {kontrakTampil.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-10">Tidak ada data untuk filter ini</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {kontrakTampil.slice(0, 6).map((k) => (
                <li key={k.id} className="px-4 sm:px-5 py-3 flex flex-wrap sm:flex-nowrap items-center gap-3 hover:bg-[#f7faf5]">
                  <span className="w-9 h-9 rounded-full bg-[#e9f2e1] text-[#264624] text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {k.penyewa?.user?.nama?.charAt(0)?.toUpperCase() || "P"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{k.penyewa?.user?.nama || "Penyewa"}</p>
                    <p className="text-[11px] text-gray-500 truncate">
                      Kamar {k.kamar?.nomor_kamar || "-"} · {formatTanggal(k.tanggal_mulai)} – {formatTanggal(k.tanggal_selesai)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#264624] whitespace-nowrap">{formatRupiah(k.harga_sewa)}</span>
                  <StatusBadge status={k.status_kontrak} />
                  <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                    {k.status_kontrak === "menunggu" && (
                      <button
                        type="button"
                        disabled={confirmingId === k.id}
                        onClick={() => handleConfirm(k)}
                        className="px-3 py-1.5 rounded-lg bg-[#264624] hover:bg-[#3b6e38] text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                      >
                        {confirmingId === k.id ? "..." : "Konfirmasi"}
                      </button>
                    )}
                    {k.penyewa?.user_id && (
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/chat?user=${k.penyewa.user_id}`)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#eef4ea] hover:bg-[#dfeccf] text-[#264624] text-xs font-semibold cursor-pointer"
                        title="Chat"
                      >
                        Chat
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="px-5 pt-3">
            <Link to="/admin/kontrak-sewa" className="text-xs font-semibold text-[#264624] hover:underline">
              Lihat semua booking & kontrak →
            </Link>
          </div>
        </Panel>

        {isAdministrator ? (
          <Panel title="Aktivitas Admin & Penyewa" className="lg:col-span-4" action={<span className="text-gray-500">Terbaru</span>}>
            {data.activities.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-10">Belum ada aktivitas</p>
            ) : (
              <ol className="relative border-l-2 border-[#dbe5d4] ml-2 space-y-4 pt-1 max-h-[380px] overflow-y-auto pr-1">
                {data.activities.slice(0, 10).map((a) => (
                  <li key={a.id} className="ml-4">
                    <span
                      className={`absolute -left-[7px] mt-1 w-3 h-3 rounded-full ring-2 ring-white ${
                        a.actorRole === "penyewa" ? "bg-[#a9c99a]" : "bg-[#264624]"
                      }`}
                    />
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-gray-900 truncate">{a.actorName}</p>
                      <span className="text-[10px] uppercase font-semibold text-gray-400">{a.actorRole}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-snug">{a.action}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatTanggal(a.time, true)}</p>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        ) : (
          <Panel title="Perlu Tindakan" className="lg:col-span-4" action={<span className="text-gray-500">{data.notifications.length} item</span>}>
            {data.notifications.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-10">Semua beres, tidak ada yang perlu ditindaklanjuti</p>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {data.notifications.slice(0, 8).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => n.to && navigate(n.to)}
                    className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-[#b7d4a5] hover:bg-[#f7faf5] transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-bold text-gray-900 leading-snug">{n.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.desc}</p>
                  </button>
                ))}
              </div>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}

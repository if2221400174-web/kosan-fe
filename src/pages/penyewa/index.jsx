import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getKamar } from "../../_sevices/kamar";
import { getKontrakSewa } from "../../_sevices/kontrakSewa";
import { getTagihan } from "../../_sevices/tagihan";
import { getPembayaran } from "../../_sevices/pembayaran";
import { getPengumuman } from "../../_sevices/pengumuman";
import { getLaporan } from "../../_sevices/laporan";
import { imageStorage } from "../../_api";
import BookingKamarModal from "../../components/BookingKamarModal";
import {
  Loading,
  Panel,
  StatCard,
  StatusBadge,
  Table,
  formatRupiah,
  formatTanggal,
} from "../../components/ui";
import {
  ChartLegend,
  LineChart,
  PieChart,
  lastMonths,
  sumByMonth,
} from "../../components/charts";

const FALLBACK_ROOM =
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80";

const hitungSisaHari = (tglSelesai) => {
  if (!tglSelesai) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(tglSelesai);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
};

const ICON = {
  kamar:
    "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  clock:
    "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  bill:
    "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
  chat:
    "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
};

const Svg = ({ d, className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  </svg>
);

export default function DashboardPenyewa() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [kamarList, setKamarList] = useState([]);
  const [kontrak, setKontrak] = useState([]);
  const [tagihan, setTagihan] = useState([]);
  const [pembayaran, setPembayaran] = useState([]);
  const [pengumuman, setPengumuman] = useState([]);
  const [laporan, setLaporan] = useState([]);
  const [bookingKamar, setBookingKamar] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      getKamar().catch(() => []),
      getKontrakSewa().catch(() => []),
      getTagihan().catch(() => []),
      getPembayaran().catch(() => []),
      getPengumuman().catch(() => []),
      getLaporan().catch(() => []),
    ])
      .then(([kmr, ktr, tgh, pmb, pgm, lap]) => {
        setKamarList((kmr || []).filter((x) => x.status_kamar === "tersedia"));
        setKontrak(ktr || []);
        setTagihan(tgh || []);
        setPembayaran(pmb || []);
        setPengumuman((pgm || []).filter((x) => x.status === "terbit"));
        setLaporan(lap || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const months = useMemo(() => lastMonths(6), []);

  const totalTagihanBulanan = useMemo(
    () =>
      sumByMonth(
        tagihan,
        months,
        (t) => t.tanggal_terbit || t.created_at,
        (t) => t.jumlah_tagihan
      ),
    [tagihan, months]
  );

  const totalBayarBulanan = useMemo(
    () =>
      sumByMonth(
        pembayaran.filter((p) => p.status_pembayaran === "diterima"),
        months,
        (p) => p.tanggal_bayar || p.created_at,
        (p) => p.jumlah_bayar
      ),
    [pembayaran, months]
  );

  if (loading) return <Loading text="Memuat Portal Penghuni Kos..." />;

  const kontrakAktif = kontrak.find((k) => k.status_kontrak === "aktif");
  const kontrakMenunggu = kontrak.find((k) => k.status_kontrak === "menunggu");
  const kontrakUtama = kontrakAktif || kontrakMenunggu || kontrak[0];
  const sisaHariSewa = kontrakAktif
    ? hitungSisaHari(kontrakAktif.tanggal_selesai)
    : null;

  const tagihanBelumBayar = tagihan.filter((t) =>
    ["belum_bayar", "sebagian"].includes(t.status_tagihan)
  );
  const tagihanLunas = tagihan.filter((t) => t.status_tagihan === "lunas");

  return (
    <div className="space-y-5">
      {/* ================= NOTIFIKASI PERINGATAN MASA SEWA AKAN HABIS ================= */}
      {kontrakAktif && sisaHariSewa !== null && sisaHariSewa <= 14 && (
        <div
          className={`rounded-2xl p-4 sm:p-5 border-l-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            sisaHariSewa < 0
              ? "bg-red-50 border-red-600 text-red-900"
              : "bg-amber-50 border-amber-500 text-amber-900"
          }`}
        >
          <div className="space-y-1">
            <p className="text-sm font-extrabold">
              ⏰{" "}
              {sisaHariSewa < 0
                ? `Masa Sewa Kamar ${kontrakAktif.kamar?.nomor_kamar} Anda Telah Berakhir!`
                : `Pengingat: Masa Sewa Kamar ${kontrakAktif.kamar?.nomor_kamar} Tersisa ${sisaHariSewa} Hari Lagi`}
            </p>
            <p className="text-xs">
              Kontrak sewa ({kontrakAktif.kode_kontrak}) berakhir pada{" "}
              <strong>{formatTanggal(kontrakAktif.tanggal_selesai)}</strong>.
              Silakan hubungi Admin di Ruang Chat jika ingin memperpanjang masa sewa.
            </p>
          </div>
          <Link
            to="/penyewa/chat"
            className="px-4 py-2 rounded-xl bg-[#264624] hover:bg-[#3b6e38] text-white text-xs font-bold whitespace-nowrap self-start sm:self-center cursor-pointer"
          >
            💬 Hubungi Admin
          </Link>
        </div>
      )}

      {/* ================= BANNER STATUS BOOKING MENUNGGU KONFIRMASI ADMIN ================= */}
      {kontrakMenunggu && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border-l-4 border-amber-500 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
              Menunggu Konfirmasi Admin
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
              Pengajuan Booking Kamar {kontrakMenunggu.kamar?.nomor_kamar} ({kontrakMenunggu.kode_kontrak})
            </h3>
            <p className="text-xs text-gray-600">
              Periode {formatTanggal(kontrakMenunggu.tanggal_mulai)} s/d{" "}
              {formatTanggal(kontrakMenunggu.tanggal_selesai)} • Biaya:{" "}
              <strong>{formatRupiah(kontrakMenunggu.harga_sewa)}</strong>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/penyewa/chat"
              className="px-4 py-2 rounded-xl bg-[#264624] hover:bg-[#3b6e38] text-white text-xs font-bold"
            >
              💬 Chat Admin Konfirmasi
            </Link>
            <Link
              to="/penyewa/tagihan"
              className="px-4 py-2 rounded-xl border border-[#264624] text-[#264624] hover:bg-[#e9f2e1] text-xs font-bold"
            >
              Lihat Tagihan / Bukti Bayar
            </Link>
          </div>
        </div>
      )}

      {/* ================= RINGKASAN (Over View) ================= */}
      <Panel title="Ringkasan Sewa Saya">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 pt-1">
          <StatCard
            label="Kamar Saya"
            value={kontrakUtama ? `Kamar ${kontrakUtama.kamar?.nomor_kamar || "-"}` : "Belum Sewa"}
            icon={<Svg d={ICON.kamar} />}
            onClick={() => navigate("/penyewa/kontrak-sewa")}
          />
          <StatCard
            label="Sisa Masa Sewa"
            value={
              sisaHariSewa !== null
                ? sisaHariSewa >= 0
                  ? `${sisaHariSewa} Hari`
                  : "Habis"
                : kontrakMenunggu
                ? "Menunggu"
                : "—"
            }
            tone={sisaHariSewa !== null && sisaHariSewa <= 14 ? "orange" : "green"}
            icon={<Svg d={ICON.clock} />}
            onClick={() => navigate("/penyewa/kontrak-sewa")}
          />
          <StatCard
            label="Tagihan Perlu Dibayar"
            value={tagihanBelumBayar.length}
            tone={tagihanBelumBayar.length > 0 ? "orange" : "green"}
            icon={<Svg d={ICON.bill} />}
            onClick={() => navigate("/penyewa/tagihan")}
          />
          <StatCard
            label="Layanan & Keluhan"
            value={laporan.length}
            icon={<Svg d={ICON.chat} />}
            onClick={() => navigate("/penyewa/laporan")}
          />
        </div>
      </Panel>

      {/* ================= BARIS GRAFIK & STATISTIK ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Status Pembayaran Tagihan (Pie Chart) */}
        <Panel title="Status Tagihan Saya" className="lg:col-span-5">
          <div className="flex flex-col sm:flex-row items-center justify-around gap-5 py-2 h-full">
            <PieChart
              size={150}
              data={[
                { label: "Lunas", value: tagihanLunas.length, color: "#264624" },
                { label: "Belum Lunas", value: tagihanBelumBayar.length, color: "#c2622d" },
              ]}
            />
            <ChartLegend
              items={[
                { label: "Tagihan Lunas", value: tagihanLunas.length, color: "#264624" },
                { label: "Perlu Dibayar", value: tagihanBelumBayar.length, color: "#c2622d" },
              ]}
            />
          </div>
        </Panel>

        {/* Riwayat Tagihan vs Pembayaran (Line Chart) */}
        <Panel
          title="Riwayat Tagihan & Pembayaran"
          className="lg:col-span-7"
          action={<span className="text-gray-500 font-medium">6 bulan terakhir</span>}
        >
          <div className="flex items-center gap-4 text-xs pb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#3b6e38]" /> Pembayaran Diterima
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#c2622d]" /> Tagihan Terbit
            </span>
          </div>
          <LineChart
            labels={months.map((m) => m.label)}
            series={[
              { label: "Tagihan", color: "#c2622d", values: totalTagihanBulanan },
              { label: "Pembayaran", color: "#3b6e38", values: totalBayarBulanan },
            ]}
          />
        </Panel>
      </div>

      {/* ================= KATALOG KAMAR TERSEDIA (JIKA BELUM MEMILIKI KAMAR AKTIF) ================= */}
      {!kontrakAktif && (
        <Panel
          title="Pilihan Kamar Tersedia & Fasilitas"
          action={
            <Link
              to="/penyewa/chat"
              className="px-3.5 py-1.5 rounded-full bg-[#264624] text-white text-xs font-bold hover:bg-[#3b6e38] transition-colors"
            >
              💬 Tanya Admin di Chat
            </Link>
          }
        >
          <div className="pt-2">
            {kamarList.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-8">
                Saat ini seluruh kamar sedang terisi. Silakan hubungi Admin melalui Ruang Chat.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {kamarList.map((k) => (
                  <div
                    key={k.id}
                    className="rounded-2xl border border-[#dbe5d4] overflow-hidden bg-[#fafaf5] flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="relative h-44 bg-gray-200">
                        <img
                          src={k.foto_utama ? imageStorage(k.foto_utama) : FALLBACK_ROOM}
                          alt={`Kamar ${k.nomor_kamar}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = FALLBACK_ROOM;
                          }}
                        />
                        <span className="absolute top-3 left-3 bg-[#264624] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow">
                          Lantai {k.lantai}
                        </span>
                        <span className="absolute top-3 right-3 bg-white/95 text-[#264624] text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow">
                          {k.tipe_kamar}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-extrabold text-gray-900">
                            Kamar {k.nomor_kamar}
                          </h4>
                          <span className="text-sm font-extrabold text-[#264624]">
                            {formatRupiah(k.harga_bulanan)}/bln
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {k.deskripsi ||
                            `Kamar nyaman tipe ${k.tipe_kamar}${
                              k.luas_kamar ? ` (${k.luas_kamar})` : ""
                            }.`}
                        </p>

                        {(k.fasilitas || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {k.fasilitas.map((f) => (
                              <span
                                key={f.id}
                                className="text-[10px] font-semibold bg-[#e4efe0] text-[#264624] px-2 py-0.5 rounded-md"
                              >
                                ✓ {f.nama_fasilitas}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBookingKamar(k)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#264624] hover:bg-[#3b6e38] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Booking Kamar Ini
                      </button>
                      <Link
                        to="/penyewa/chat"
                        className="py-2 px-3 rounded-xl border border-[#264624] text-[#264624] hover:bg-[#e9f2e1] text-xs font-bold"
                      >
                        Chat
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>
      )}

      {/* ================= TABEL TAGIHAN & PENGUMUMAN KOS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Panel
          title="Tagihan Sewa Perlu Dibayar"
          className="lg:col-span-7"
          bodyClassName="px-0 sm:px-0"
          action={
            <Link
              to="/penyewa/tagihan"
              className="text-xs text-[#264624] font-semibold hover:underline"
            >
              Semua Tagihan →
            </Link>
          }
        >
          {tagihanBelumBayar.length === 0 ? (
            <p className="text-xs text-gray-400 py-8 text-center">
              Semua tagihan sewa Anda sudah lunas
            </p>
          ) : (
            <Table headers={["Kode", "Periode", "Jatuh Tempo", "Nominal", "Aksi"]}>
              {tagihanBelumBayar.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-gray-800">
                    {t.kode_tagihan}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {formatTanggal(t.periode_mulai)} - {formatTanggal(t.periode_selesai)}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {formatTanggal(t.tanggal_jatuh_tempo)}
                  </td>
                  <td className="px-4 py-3 font-extrabold text-[#264624]">
                    {formatRupiah(t.jumlah_tagihan)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/penyewa/pembayaran/create/${t.id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#264624] hover:bg-[#3b6e38] text-white text-xs font-bold whitespace-nowrap cursor-pointer shadow-2xs"
                    >
                      Bayar (Cash / Transfer)
                    </Link>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>

        <Panel
          title="Pengumuman Kos Terbaru"
          className="lg:col-span-5"
          action={<StatusBadge status="terbit" />}
        >
          <div className="space-y-3 pt-1">
            {pengumuman.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">
                Belum ada pengumuman terbaru
              </p>
            ) : (
              pengumuman.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-[#f4f8f1] border border-[#dfecd8] space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {p.judul}
                    </h4>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                      {formatTanggal(p.tanggal_publikasi)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {p.isi}
                  </p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      {/* Modal Booking Kamar */}
      <BookingKamarModal
        open={Boolean(bookingKamar)}
        kamar={bookingKamar}
        onClose={() => {
          setBookingKamar(null);
          loadData();
        }}
      />
    </div>
  );
}

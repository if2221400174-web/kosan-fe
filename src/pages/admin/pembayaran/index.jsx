import { useEffect, useState } from "react";
import { deletePembayaran, getPembayaran, verifikasiPembayaran } from "../../../_sevices/pembayaran";
import { exportToExcel, exportToPDF } from "../../../_sevices/exportTransaksi";
import { isAdministrator } from "../../../_sevices/auth";
import { imageStorage } from "../../../_api";
import {
  ButtonLink,
  Card,
  EmptyState,
  Field,
  IconButton,
  Icons,
  Loading,
  Modal,
  PageHeader,
  SearchInput,
  StatusBadge,
  Table,
  formatRupiah,
  formatTanggal,
  getErrorMessage,
  inputClass,
} from "../../../components/ui";

export default function AdminPembayaran() {
  const canDelete = isAdministrator();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formVerif, setFormVerif] = useState({
    status_pembayaran: "diterima",
    catatan_verifikasi: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getPembayaran();
      setItems(res || []);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memuat pembayaran"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openVerif = (item) => {
    setSelected(item);
    setFormVerif({
      status_pembayaran: item.status_pembayaran === "menunggu_verifikasi" ? "diterima" : item.status_pembayaran,
      catatan_verifikasi: item.catatan_verifikasi || "",
    });
  };

  const handleVerifikasi = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await verifikasiPembayaran(selected.id, formVerif);
      setSelected(null);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memverifikasi pembayaran"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, kode) => {
    if (!window.confirm(`Hapus transaksi pembayaran "${kode}"?`)) return;
    try {
      await deletePembayaran(id);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menghapus pembayaran"));
    }
  };

  const filtered = items.filter((p) =>
    [
      p.kode_pembayaran,
      p.tagihan?.kode_tagihan,
      p.tagihan?.kontrak_sewa?.penyewa?.user?.nama,
      p.tagihan?.kontrak_sewa?.kamar?.nomor_kamar,
      p.status_pembayaran,
    ].some((v) => String(v || "").toLowerCase().includes(search.toLowerCase()))
  );

  const dataDiterima = filtered.filter((p) => p.status_pembayaran === "diterima");

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Transaksi Pembayaran & Verifikasi" subtitle="Verifikasi bukti transfer penyewa dan unduh laporan pemasukan">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari kode, penyewa, kamar..." />
        <ButtonLink variant="secondary" onClick={() => exportToPDF(dataDiterima, "Laporan-Pemasukan-Kos")}>
          {Icons.download} Export PDF
        </ButtonLink>
        <ButtonLink variant="secondary" onClick={() => exportToExcel(dataDiterima, "Laporan-Pemasukan-Kos")}>
          {Icons.download} Export Excel
        </ButtonLink>
      </PageHeader>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState text="Belum ada transaksi pembayaran" />
        ) : (
          <Table headers={["Kode Bayar", "Penyewa & Kamar", "Tagihan", "Tanggal Bayar", "Metode", "Jumlah", "Bukti", "Status", "Aksi"]}>
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-800">{p.kode_pembayaran}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">
                    {p.tagihan?.kontrak_sewa?.penyewa?.user?.nama || "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Kamar {p.tagihan?.kontrak_sewa?.kamar?.nomor_kamar || "—"}
                  </p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{p.tagihan?.kode_tagihan || "—"}</td>
                <td className="px-4 py-3 text-xs">{formatTanggal(p.tanggal_bayar, true)}</td>
                <td className="px-4 py-3 uppercase text-xs font-semibold">{p.metode_pembayaran}</td>
                <td className="px-4 py-3 font-bold text-green-700">{formatRupiah(p.jumlah_bayar)}</td>
                <td className="px-4 py-3">
                  {p.bukti_bayar ? (
                    <a
                      href={imageStorage(p.bukti_bayar)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-green-700 font-medium hover:underline"
                    >
                      Lihat Bukti
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status_pembayaran} />
                  {p.verifikator && (
                    <p className="text-[11px] text-gray-400 mt-0.5">Oleh: {p.verifikator.nama}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <IconButton color="green" title="Verifikasi Pembayaran" onClick={() => openVerif(p)}>
                      {Icons.check}
                    </IconButton>
                    {canDelete && (
                      <IconButton color="red" title="Hapus" onClick={() => handleDelete(p.id, p.kode_pembayaran)}>
                        {Icons.trash}
                      </IconButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Verifikasi Pembayaran ${selected?.kode_pembayaran || ""}`}>
        {selected && (
          <form onSubmit={handleVerifikasi} className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
              <p><span className="text-gray-500">Penyewa:</span> <strong>{selected.tagihan?.kontrak_sewa?.penyewa?.user?.nama}</strong></p>
              <p><span className="text-gray-500">Nominal Dibayar:</span> <strong className="text-green-700">{formatRupiah(selected.jumlah_bayar)}</strong></p>
              <p><span className="text-gray-500">Total Tagihan:</span> {formatRupiah(selected.tagihan?.jumlah_tagihan)}</p>
            </div>

            <Field label="Keputusan Verifikasi" required>
              <select
                className={inputClass}
                value={formVerif.status_pembayaran}
                onChange={(e) => setFormVerif({ ...formVerif, status_pembayaran: e.target.value })}
              >
                <option value="diterima">Diterima (Otomatis Update Status Tagihan)</option>
                <option value="ditolak">Ditolak</option>
                <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
              </select>
            </Field>

            <Field label="Catatan Verifikasi (Opsional)">
              <textarea
                rows={2}
                placeholder="Isi alasan jika bukti pembayaran ditolak..."
                className={inputClass}
                value={formVerif.catatan_verifikasi}
                onChange={(e) => setFormVerif({ ...formVerif, catatan_verifikasi: e.target.value })}
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <ButtonLink variant="secondary" onClick={() => setSelected(null)}>Batal</ButtonLink>
              <ButtonLink type="submit">{saving ? "Menyimpan..." : "Simpan Verifikasi"}</ButtonLink>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

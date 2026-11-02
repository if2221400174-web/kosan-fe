import { useEffect, useState } from "react";
import { deleteLaporan, getLaporan, updateLaporan } from "../../../_sevices/laporan";
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
  formatTanggal,
  getErrorMessage,
  inputClass,
} from "../../../components/ui";

export default function AdminLaporan() {
  const canDelete = isAdministrator();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ status: "diproses", catatan_admin: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getLaporan();
      setItems(res || []);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memuat laporan keluhan"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (item) => {
    setSelected(item);
    setForm({
      status: item.status || "diproses",
      catatan_admin: item.catatan_admin || "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateLaporan(selected.id, form);
      setSelected(null);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memperbarui laporan"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, kode) => {
    if (!window.confirm(`Hapus laporan "${kode}"?`)) return;
    try {
      await deleteLaporan(id);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menghapus laporan"));
    }
  };

  const filtered = items.filter((l) =>
    [l.kode_laporan, l.judul, l.penyewa?.user?.nama, l.kamar?.nomor_kamar, l.status].some((v) =>
      String(v || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Laporan Keluhan & Kerusakan" subtitle="Tindak lanjuti keluhan fasilitas dari penghuni kos">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari kode, judul, penyewa..." />
      </PageHeader>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState text="Belum ada laporan keluhan" />
        ) : (
          <Table headers={["Kode", "Pelapor & Kamar", "Judul & Deskripsi", "Foto", "Status", "Catatan Admin", "Aksi"]}>
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{l.kode_laporan}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{l.penyewa?.user?.nama || "—"}</p>
                  <p className="text-xs text-gray-500">
                    {l.kamar ? `Kamar ${l.kamar.nomor_kamar}` : "Fasilitas Umum"}
                  </p>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="font-semibold text-gray-800">{l.judul}</p>
                  <p className="text-xs text-gray-500">{l.deskripsi}</p>
                </td>
                <td className="px-4 py-3">
                  {l.foto ? (
                    <a
                      href={imageStorage(l.foto)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-green-700 font-medium hover:underline"
                    >
                      Lihat Foto
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={l.status} />
                  {l.tanggal_selesai && (
                    <p className="text-[11px] text-gray-400 mt-0.5">Selesai: {formatTanggal(l.tanggal_selesai)}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">{l.catatan_admin || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <IconButton color="blue" title="Tindak Lanjut" onClick={() => openModal(l)}>
                      {Icons.edit}
                    </IconButton>
                    {canDelete && (
                      <IconButton color="red" title="Hapus" onClick={() => handleDelete(l.id, l.kode_laporan)}>
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

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Tindak Lanjut ${selected?.kode_laporan || ""}`}>
        {selected && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <p className="font-semibold text-gray-800">{selected.judul}</p>
              <p className="text-xs text-gray-600 mt-1">{selected.deskripsi}</p>
            </div>

            <Field label="Status Penanganan" required>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="menunggu">Menunggu</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </Field>

            <Field label="Catatan Tindak Lanjut Admin">
              <textarea
                rows={3}
                className={inputClass}
                placeholder="Tulis tanggapan untuk penyewa..."
                value={form.catatan_admin}
                onChange={(e) => setForm({ ...form, catatan_admin: e.target.value })}
              />
            </Field>

            <div className="flex justify-end gap-2">
              <ButtonLink variant="secondary" onClick={() => setSelected(null)}>Batal</ButtonLink>
              <ButtonLink type="submit">{saving ? "Menyimpan..." : "Simpan"}</ButtonLink>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

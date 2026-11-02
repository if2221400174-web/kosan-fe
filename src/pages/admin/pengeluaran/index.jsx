import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePengeluaran, getPengeluaran } from "../../../_sevices/pengeluaran";
import { isAdministrator } from "../../../_sevices/auth";
import { imageStorage } from "../../../_api";
import {
  ButtonLink,
  Card,
  EmptyState,
  IconButton,
  Icons,
  Loading,
  PageHeader,
  SearchInput,
  Table,
  formatRupiah,
  formatTanggal,
  getErrorMessage,
} from "../../../components/ui";

export default function AdminPengeluaran() {
  const navigate = useNavigate();
  const canDelete = isAdministrator();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getPengeluaran();
      setItems(res || []);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memuat pengeluaran"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus pengeluaran "${nama}"?`)) return;
    try {
      await deletePengeluaran(id);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menghapus pengeluaran"));
    }
  };

  const filtered = items.filter((p) =>
    [p.kode_pengeluaran, p.kategori, p.nama_pengeluaran, p.keterangan].some((v) =>
      String(v || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const total = filtered.reduce((s, p) => s + Number(p.jumlah || 0), 0);

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Biaya Operasional (Pengeluaran)" subtitle={`Total tercatat: ${formatRupiah(total)}`}>
        <SearchInput value={search} onChange={setSearch} placeholder="Cari kategori / nama biaya..." />
        <ButtonLink onClick={() => navigate("/admin/pengeluaran/create")}>
          {Icons.plus} Catat Pengeluaran
        </ButtonLink>
      </PageHeader>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState text="Belum ada catatan pengeluaran" />
        ) : (
          <Table headers={["Kode", "Tanggal", "Kategori", "Nama Pengeluaran", "Jumlah", "Dicatat Oleh", "Bukti Nota", "Aksi"]}>
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{p.kode_pengeluaran}</td>
                <td className="px-4 py-3 text-xs">{formatTanggal(p.tanggal_pengeluaran)}</td>
                <td className="px-4 py-3 capitalize font-medium">{p.kategori}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{p.nama_pengeluaran}</p>
                  {p.keterangan && <p className="text-xs text-gray-400">{p.keterangan}</p>}
                </td>
                <td className="px-4 py-3 font-bold text-red-600">{formatRupiah(p.jumlah)}</td>
                <td className="px-4 py-3 text-xs">{p.admin?.nama || "—"}</td>
                <td className="px-4 py-3">
                  {p.bukti_pengeluaran ? (
                    <a
                      href={imageStorage(p.bukti_pengeluaran)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-green-700 font-medium hover:underline"
                    >
                      Lihat Nota
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <IconButton color="blue" title="Edit" onClick={() => navigate(`/admin/pengeluaran/edit/${p.id}`)}>
                      {Icons.edit}
                    </IconButton>
                    {canDelete && (
                      <IconButton color="red" title="Hapus" onClick={() => handleDelete(p.id, p.nama_pengeluaran)}>
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
    </div>
  );
}

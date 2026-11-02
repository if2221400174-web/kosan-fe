import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePengumuman, getPengumuman } from "../../../_sevices/pengumuman";
import {
  ButtonLink,
  Card,
  EmptyState,
  IconButton,
  Icons,
  Loading,
  PageHeader,
  StatusBadge,
  Table,
  formatTanggal,
  getErrorMessage,
} from "../../../components/ui";

export default function AdminPengumuman() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getPengumuman();
      setItems(res || []);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memuat pengumuman"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, judul) => {
    if (!window.confirm(`Hapus pengumuman "${judul}"?`)) return;
    try {
      await deletePengumuman(id);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menghapus pengumuman"));
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Papan Pengumuman Kos" subtitle="Informasi penting untuk seluruh penyewa kos">
        <ButtonLink onClick={() => navigate("/admin/pengumuman/create")}>
          {Icons.plus} Buat Pengumuman
        </ButtonLink>
      </PageHeader>

      <Card>
        {items.length === 0 ? (
          <EmptyState text="Belum ada pengumuman" />
        ) : (
          <Table headers={["No", "Judul & Isi", "Tanggal Publikasi", "Tanggal Berakhir", "Dibuat Oleh", "Status", "Aksi"]}>
            {items.map((p, i) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3 max-w-md">
                  <p className="font-semibold text-gray-900">{p.judul}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.isi}</p>
                </td>
                <td className="px-4 py-3 text-xs">{formatTanggal(p.tanggal_publikasi)}</td>
                <td className="px-4 py-3 text-xs">{formatTanggal(p.tanggal_berakhir)}</td>
                <td className="px-4 py-3 text-xs">{p.admin?.nama || "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <IconButton color="blue" title="Edit" onClick={() => navigate(`/admin/pengumuman/edit/${p.id}`)}>
                      {Icons.edit}
                    </IconButton>
                    <IconButton color="red" title="Hapus" onClick={() => handleDelete(p.id, p.judul)}>
                      {Icons.trash}
                    </IconButton>
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteFasilitas, getFasilitas } from "../../../_sevices/fasilitas";
import { isAdministrator } from "../../../_sevices/auth";
import {
  ButtonLink,
  Card,
  EmptyState,
  IconButton,
  Icons,
  Loading,
  PageHeader,
  SearchInput,
  StatusBadge,
  Table,
  getErrorMessage,
} from "../../../components/ui";

export default function AdminFasilitas() {
  const navigate = useNavigate();
  const canDelete = isAdministrator();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getFasilitas();
      setItems(res || []);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memuat fasilitas"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus fasilitas "${nama}"?`)) return;
    try {
      await deleteFasilitas(id);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menghapus fasilitas"));
    }
  };

  const filtered = items.filter((f) =>
    [f.nama_fasilitas, f.jenis_fasilitas, f.deskripsi].some((v) =>
      String(v || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Data Fasilitas" subtitle="Master fasilitas kamar maupun fasilitas umum kos">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari fasilitas..." />
        <ButtonLink onClick={() => navigate("/admin/fasilitas/create")}>
          {Icons.plus} Tambah Fasilitas
        </ButtonLink>
      </PageHeader>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState text="Belum ada fasilitas" />
        ) : (
          <Table headers={["No", "Nama Fasilitas", "Jenis", "Ikon", "Deskripsi", "Aksi"]}>
            {filtered.map((f, i) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{f.nama_fasilitas}</td>
                <td className="px-4 py-3"><StatusBadge status={f.jenis_fasilitas} /></td>
                <td className="px-4 py-3">{f.ikon || "—"}</td>
                <td className="px-4 py-3">{f.deskripsi || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <IconButton color="blue" title="Edit" onClick={() => navigate(`/admin/fasilitas/edit/${f.id}`)}>
                      {Icons.edit}
                    </IconButton>
                    {canDelete && (
                      <IconButton color="red" title="Hapus" onClick={() => handleDelete(f.id, f.nama_fasilitas)}>
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

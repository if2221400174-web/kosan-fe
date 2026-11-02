import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteGaleri, getGaleri } from "../../../_sevices/galeri";
import { imageStorage } from "../../../_api";
import {
  ButtonLink,
  Card,
  EmptyState,
  IconButton,
  Icons,
  Loading,
  PageHeader,
  StatusBadge,
  getErrorMessage,
} from "../../../components/ui";

export default function AdminGaleri() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getGaleri();
      setItems(res || []);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memuat galeri"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, judul) => {
    if (!window.confirm(`Hapus foto "${judul}"?`)) return;
    try {
      await deleteGaleri(id);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menghapus foto"));
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Galeri Foto Kos & Kamar" subtitle="Kelola foto lingkungan kos dan foto detail tiap kamar">
        <ButtonLink onClick={() => navigate("/admin/galeri/create")}>
          {Icons.plus} Upload Foto
        </ButtonLink>
      </PageHeader>

      {items.length === 0 ? (
        <Card><EmptyState text="Belum ada foto di galeri" /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((g) => (
            <Card key={g.id} className="overflow-hidden flex flex-col">
              <div className="h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
                {g.foto ? (
                  <img
                    src={imageStorage(g.foto)}
                    alt={g.judul}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : null}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">
                      {g.kategori}
                    </span>
                    <StatusBadge status={g.status_publikasi} />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">{g.judul}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {g.kamar ? `Kamar ${g.kamar.nomor_kamar}` : "Foto Umum Kos"} • Urutan {g.urutan}
                  </p>
                </div>
                <div className="flex justify-end">
                  <IconButton color="red" title="Hapus" onClick={() => handleDelete(g.id, g.judul)}>
                    {Icons.trash}
                  </IconButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

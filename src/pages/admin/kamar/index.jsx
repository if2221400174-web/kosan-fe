import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteKamar, getKamar } from "../../../_sevices/kamar";
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
  StatusBadge,
  Table,
  formatRupiah,
  getErrorMessage,
} from "../../../components/ui";

export default function AdminKamar() {
  const navigate = useNavigate();
  const canDelete = isAdministrator();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getKamar();
      setItems(res || []);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memuat data kamar"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, nomor) => {
    if (!window.confirm(`Hapus kamar "${nomor}"?`)) return;
    try {
      await deleteKamar(id);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menghapus kamar"));
    }
  };

  const filtered = items.filter((k) =>
    [k.nomor_kamar, k.tipe_kamar, k.status_kamar].some((v) =>
      String(v || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Data Kamar" subtitle="Kelola daftar kamar, harga sewa, status, dan fasilitas">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari nomor / tipe kamar..." />
        <ButtonLink onClick={() => navigate("/admin/kamar/create")}>
          {Icons.plus} Tambah Kamar
        </ButtonLink>
      </PageHeader>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState text="Belum ada data kamar" />
        ) : (
          <Table headers={["No. Kamar", "Tipe", "Lantai", "Harga Bulanan", "Harga Tahunan", "Fasilitas", "Status", "Aksi"]}>
            {filtered.map((k) => (
              <tr key={k.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">
                  <div className="flex items-center gap-2.5">
                    {k.foto_utama && (
                      <img
                        src={imageStorage(k.foto_utama)}
                        alt={k.nomor_kamar}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                      />
                    )}
                    <div>
                      <p>{k.nomor_kamar}</p>
                      {k.luas_kamar && <p className="text-xs text-gray-400 font-normal">{k.luas_kamar}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{k.tipe_kamar}</td>
                <td className="px-4 py-3">Lantai {k.lantai}</td>
                <td className="px-4 py-3 font-medium text-green-700">{formatRupiah(k.harga_bulanan)}</td>
                <td className="px-4 py-3">{k.harga_tahunan ? formatRupiah(k.harga_tahunan) : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(k.fasilitas || []).map((f) => (
                      <span key={f.id} className="px-2 py-0.5 text-xs bg-gray-100 rounded-md text-gray-700">
                        {f.nama_fasilitas}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={k.status_kamar} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <IconButton color="blue" title="Edit" onClick={() => navigate(`/admin/kamar/edit/${k.id}`)}>
                      {Icons.edit}
                    </IconButton>
                    {canDelete && (
                      <IconButton color="red" title="Hapus" onClick={() => handleDelete(k.id, k.nomor_kamar)}>
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

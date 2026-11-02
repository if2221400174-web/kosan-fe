import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePenyewa, getPenyewa } from "../../../_sevices/penyewa";
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
  getErrorMessage,
} from "../../../components/ui";

export default function AdminPenyewa() {
  const navigate = useNavigate();
  const canDelete = isAdministrator();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getPenyewa();
      setItems(res || []);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memuat data penyewa"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus data penyewa "${nama}"?`)) return;
    try {
      await deletePenyewa(id);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menghapus penyewa"));
    }
  };

  const filtered = items.filter((p) =>
    [p.user?.nama, p.user?.email, p.user?.nomor_telepon, p.nik, p.pekerjaan].some((v) =>
      String(v || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Data Penyewa Kos" subtitle="Identitas KTP, kontak darurat, dan akun penghuni kos">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari nama, NIK, telepon..." />
        <ButtonLink onClick={() => navigate("/admin/penyewa/create")}>
          {Icons.plus} Tambah Penyewa
        </ButtonLink>
      </PageHeader>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState text="Belum ada data penyewa" />
        ) : (
          <Table headers={["No", "Nama & Email", "NIK", "L/P", "Telepon", "Pekerjaan", "Kontak Darurat", "KTP", "Aksi"]}>
            {filtered.map((p, i) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{p.user?.nama || "—"}</p>
                  <p className="text-xs text-gray-400">{p.user?.email}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{p.nik}</td>
                <td className="px-4 py-3 capitalize">{p.jenis_kelamin}</td>
                <td className="px-4 py-3">{p.user?.nomor_telepon || "—"}</td>
                <td className="px-4 py-3">{p.pekerjaan || "—"}</td>
                <td className="px-4 py-3">
                  {p.nama_kontak_darurat ? (
                    <div>
                      <p className="text-xs font-medium text-gray-800">{p.nama_kontak_darurat}</p>
                      <p className="text-xs text-gray-500">{p.nomor_kontak_darurat}</p>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.foto_ktp ? (
                    <a
                      href={imageStorage(p.foto_ktp)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-green-700 font-medium hover:underline"
                    >
                      Lihat KTP
                    </a>
                  ) : (
                    <StatusBadge status="belum ada" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <IconButton color="blue" title="Edit" onClick={() => navigate(`/admin/penyewa/edit/${p.id}`)}>
                      {Icons.edit}
                    </IconButton>
                    {canDelete && (
                      <IconButton color="red" title="Hapus" onClick={() => handleDelete(p.id, p.user?.nama)}>
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

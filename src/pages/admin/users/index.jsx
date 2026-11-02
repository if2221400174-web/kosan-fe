import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteUsers, getUser } from "../../../_sevices/auth";
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

export default function AdminUser() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getUser();
      setUsers(res || []);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memuat data pengguna"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus akun "${nama}"?`)) return;
    try {
      await deleteUsers(id);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menghapus pengguna"));
    }
  };

  const filtered = users.filter((u) =>
    [u.nama, u.email, u.nomor_telepon, u.role].some((v) =>
      String(v || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Manajemen Akun Pengguna" subtitle="Kelola akun Administrator, Admin (Pekerja Kos), dan Penyewa">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari nama, email, role..." />
        <ButtonLink onClick={() => navigate("/admin/users/create")}>
          {Icons.plus} Tambah Akun
        </ButtonLink>
      </PageHeader>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState text="Belum ada akun pengguna" />
        ) : (
          <Table headers={["No", "Nama", "Email", "No. Telepon", "Role", "Status", "Aksi"]}>
            {filtered.map((u, i) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{u.nama}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.nomor_telepon}</td>
                <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                <td className="px-4 py-3"><StatusBadge status={u.status_akun} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <IconButton color="blue" title="Edit" onClick={() => navigate(`/admin/users/edit/${u.id}`)}>
                      {Icons.edit}
                    </IconButton>
                    <IconButton color="red" title="Hapus" onClick={() => handleDelete(u.id, u.nama)}>
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

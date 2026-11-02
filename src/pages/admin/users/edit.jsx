import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showUser, updateUser } from "../../../_sevices/auth";
import { Card, Field, FormActions, Loading, PageHeader, getErrorMessage, inputClass } from "../../../components/ui";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    nomor_telepon: "",
    role: "admin",
    status_akun: "aktif",
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await showUser(id);
        const u = res.data;
        setForm({
          nama: u.nama || "",
          email: u.email || "",
          password: "",
          nomor_telepon: u.nomor_telepon || "",
          role: u.role || "admin",
          status_akun: u.status_akun || "aktif",
        });
      } catch (err) {
        alert(getErrorMessage(err, "Data tidak ditemukan"));
        navigate("/admin/users");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await updateUser(id, payload);
      navigate("/admin/users");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memperbarui akun"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Edit Akun Pengguna" subtitle="Ubah data akun, role, atau status aktif" />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nama Lengkap" required>
              <input
                type="text"
                required
                className={inputClass}
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </Field>

            <Field label="Nomor Telepon" required>
              <input
                type="text"
                required
                className={inputClass}
                value={form.nomor_telepon}
                onChange={(e) => setForm({ ...form, nomor_telepon: e.target.value })}
              />
            </Field>

            <Field label="Email" required>
              <input
                type="email"
                required
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>

            <Field label="Password Baru" hint="Kosongkan jika tidak ingin mengganti">
              <input
                type="password"
                minLength={8}
                className={inputClass}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Field>

            <Field label="Role" required>
              <select
                className={inputClass}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="administrator">Administrator (Pemilik)</option>
                <option value="admin">Admin (Pekerja Kos)</option>
                <option value="penyewa">Penyewa</option>
              </select>
            </Field>

            <Field label="Status Akun" required>
              <select
                className={inputClass}
                value={form.status_akun}
                onChange={(e) => setForm({ ...form, status_akun: e.target.value })}
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </Field>
          </div>
          <FormActions onCancel={() => navigate("/admin/users")} saving={saving} />
        </Card>
      </form>
    </div>
  );
}

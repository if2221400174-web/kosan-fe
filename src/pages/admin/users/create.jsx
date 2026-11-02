import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userCreate } from "../../../_sevices/auth";
import { Card, Field, FormActions, PageHeader, getErrorMessage, inputClass } from "../../../components/ui";

export default function CreateUser() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    nomor_telepon: "",
    role: "admin",
    status_akun: "aktif",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userCreate(form);
      navigate("/admin/users");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menambah akun"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Tambah Akun Pengguna" subtitle="Buat akun baru untuk pekerja kos atau penyewa" />
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

            <Field label="Password" required>
              <input
                type="password"
                minLength={8}
                required
                className={inputClass}
                placeholder="Min. 8 karakter"
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

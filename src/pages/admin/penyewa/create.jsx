import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPenyewa } from "../../../_sevices/penyewa";
import { Card, Field, FormActions, PageHeader, getErrorMessage, inputClass } from "../../../components/ui";

export default function CreatePenyewa() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    nomor_telepon: "",
    nik: "",
    jenis_kelamin: "laki-laki",
    alamat_asal: "",
    pekerjaan: "",
    nama_kontak_darurat: "",
    nomor_kontak_darurat: "",
    foto_ktp: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createPenyewa(form);
      navigate("/admin/penyewa");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menambah penyewa"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Tambah Penyewa Baru"
        subtitle="Otomatis membuatkan akun login penyewa beserta identitas KTP-nya"
      />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 space-y-5">
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2">1. Akun Login Penyewa</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nama Lengkap" required>
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                />
              </Field>

              <Field label="Nomor HP / WhatsApp" required>
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={form.nomor_telepon}
                  onChange={(e) => setForm({ ...form, nomor_telepon: e.target.value })}
                />
              </Field>

              <Field label="Email Login" required>
                <input
                  type="email"
                  required
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>

              <Field label="Password Awal" required>
                <input
                  type="password"
                  minLength={8}
                  required
                  placeholder="Minimal 8 karakter"
                  className={inputClass}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </Field>
            </div>

            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 pt-2">2. Identitas KTP & Kontak Darurat</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="NIK (16 Digit)" required>
                <input
                  type="text"
                  maxLength={16}
                  required
                  className={inputClass}
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value })}
                />
              </Field>

              <Field label="Jenis Kelamin" required>
                <select
                  className={inputClass}
                  value={form.jenis_kelamin}
                  onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}
                >
                  <option value="laki-laki">Laki-laki</option>
                  <option value="perempuan">Perempuan</option>
                </select>
              </Field>

              <Field label="Pekerjaan">
                <input
                  type="text"
                  placeholder="Mahasiswa / Karyawan"
                  className={inputClass}
                  value={form.pekerjaan}
                  onChange={(e) => setForm({ ...form, pekerjaan: e.target.value })}
                />
              </Field>

              <Field label="Foto KTP">
                <input
                  type="file"
                  accept="image/*"
                  className={inputClass}
                  onChange={(e) => setForm({ ...form, foto_ktp: e.target.files[0] })}
                />
              </Field>

              <Field label="Nama Kontak Darurat">
                <input
                  type="text"
                  placeholder="Nama Orang Tua / Wali"
                  className={inputClass}
                  value={form.nama_kontak_darurat}
                  onChange={(e) => setForm({ ...form, nama_kontak_darurat: e.target.value })}
                />
              </Field>

              <Field label="Nomor Kontak Darurat">
                <input
                  type="text"
                  className={inputClass}
                  value={form.nomor_kontak_darurat}
                  onChange={(e) => setForm({ ...form, nomor_kontak_darurat: e.target.value })}
                />
              </Field>

              <Field label="Alamat Asal (Sesuai KTP)" required className="sm:col-span-2">
                <textarea
                  rows={2}
                  required
                  className={inputClass}
                  value={form.alamat_asal}
                  onChange={(e) => setForm({ ...form, alamat_asal: e.target.value })}
                />
              </Field>
            </div>
          </div>
          <FormActions onCancel={() => navigate("/admin/penyewa")} saving={saving} />
        </Card>
      </form>
    </div>
  );
}

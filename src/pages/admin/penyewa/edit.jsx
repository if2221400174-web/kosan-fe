import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showPenyewa, updatePenyewa } from "../../../_sevices/penyewa";
import { Card, Field, FormActions, Loading, PageHeader, getErrorMessage, inputClass } from "../../../components/ui";

export default function EditPenyewa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    email: "",
    nomor_telepon: "",
    nik: "",
    jenis_kelamin: "laki-laki",
    alamat_asal: "",
    pekerjaan: "",
    nama_kontak_darurat: "",
    nomor_kontak_darurat: "",
    foto_ktp: null,
  });

  useEffect(() => {
    showPenyewa(id)
      .then((p) => {
        setForm({
          nama: p.user?.nama || "",
          email: p.user?.email || "",
          nomor_telepon: p.user?.nomor_telepon || "",
          nik: p.nik || "",
          jenis_kelamin: p.jenis_kelamin || "laki-laki",
          alamat_asal: p.alamat_asal || "",
          pekerjaan: p.pekerjaan || "",
          nama_kontak_darurat: p.nama_kontak_darurat || "",
          nomor_kontak_darurat: p.nomor_kontak_darurat || "",
          foto_ktp: null,
        });
      })
      .catch((err) => {
        alert(getErrorMessage(err));
        navigate("/admin/penyewa");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePenyewa(id, form);
      navigate("/admin/penyewa");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memperbarui penyewa"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Edit Data Penyewa" />
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

            <Field label="Nomor HP / WhatsApp" required>
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
                className={inputClass}
                value={form.pekerjaan}
                onChange={(e) => setForm({ ...form, pekerjaan: e.target.value })}
              />
            </Field>

            <Field label="Nama Kontak Darurat">
              <input
                type="text"
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

            <Field label="Ganti Foto KTP" className="sm:col-span-2">
              <input
                type="file"
                accept="image/*"
                className={inputClass}
                onChange={(e) => setForm({ ...form, foto_ktp: e.target.files[0] })}
              />
            </Field>

            <Field label="Alamat Asal (KTP)" required className="sm:col-span-2">
              <textarea
                rows={2}
                required
                className={inputClass}
                value={form.alamat_asal}
                onChange={(e) => setForm({ ...form, alamat_asal: e.target.value })}
              />
            </Field>
          </div>
          <FormActions onCancel={() => navigate("/admin/penyewa")} saving={saving} />
        </Card>
      </form>
    </div>
  );
}

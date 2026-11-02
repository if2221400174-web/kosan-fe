import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createFasilitas } from "../../../_sevices/fasilitas";
import { Card, Field, FormActions, PageHeader, getErrorMessage, inputClass } from "../../../components/ui";

export default function CreateFasilitas() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nama_fasilitas: "",
    jenis_fasilitas: "kamar",
    ikon: "",
    deskripsi: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createFasilitas(form);
      navigate("/admin/fasilitas");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menambah fasilitas"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Tambah Fasilitas" />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 space-y-4">
            <Field label="Nama Fasilitas" required>
              <input
                type="text"
                required
                placeholder="Contoh: AC / WiFi / Dapur Umum"
                className={inputClass}
                value={form.nama_fasilitas}
                onChange={(e) => setForm({ ...form, nama_fasilitas: e.target.value })}
              />
            </Field>

            <Field label="Jenis Fasilitas" required>
              <select
                className={inputClass}
                value={form.jenis_fasilitas}
                onChange={(e) => setForm({ ...form, jenis_fasilitas: e.target.value })}
              >
                <option value="kamar">Fasilitas Kamar</option>
                <option value="umum">Fasilitas Umum</option>
              </select>
            </Field>

            <Field label="Nama Ikon (Opsional)">
              <input
                type="text"
                placeholder="Contoh: wifi, snowflake"
                className={inputClass}
                value={form.ikon}
                onChange={(e) => setForm({ ...form, ikon: e.target.value })}
              />
            </Field>

            <Field label="Deskripsi">
              <textarea
                rows={3}
                className={inputClass}
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              />
            </Field>
          </div>
          <FormActions onCancel={() => navigate("/admin/fasilitas")} saving={saving} />
        </Card>
      </form>
    </div>
  );
}

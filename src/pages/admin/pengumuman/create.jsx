import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPengumuman } from "../../../_sevices/pengumuman";
import { Card, Field, FormActions, PageHeader, getErrorMessage, inputClass, todayString } from "../../../components/ui";

export default function CreatePengumuman() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    judul: "",
    isi: "",
    tanggal_publikasi: todayString(),
    tanggal_berakhir: "",
    status: "terbit",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createPengumuman(form);
      navigate("/admin/pengumuman");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal membuat pengumuman"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Buat Pengumuman Baru" />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 space-y-4">
            <Field label="Judul Pengumuman" required>
              <input
                type="text"
                required
                className={inputClass}
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
              />
            </Field>

            <Field label="Isi Pengumuman" required>
              <textarea
                rows={4}
                required
                className={inputClass}
                value={form.isi}
                onChange={(e) => setForm({ ...form, isi: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tanggal Publikasi" required>
                <input
                  type="date"
                  required
                  className={inputClass}
                  value={form.tanggal_publikasi}
                  onChange={(e) => setForm({ ...form, tanggal_publikasi: e.target.value })}
                />
              </Field>

              <Field label="Tanggal Berakhir">
                <input
                  type="date"
                  className={inputClass}
                  value={form.tanggal_berakhir}
                  onChange={(e) => setForm({ ...form, tanggal_berakhir: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Status" required>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="terbit">Terbit</option>
                <option value="draft">Draft</option>
                <option value="arsip">Arsip</option>
              </select>
            </Field>
          </div>
          <FormActions onCancel={() => navigate("/admin/pengumuman")} saving={saving} />
        </Card>
      </form>
    </div>
  );
}

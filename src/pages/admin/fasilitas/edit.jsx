import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showFasilitas, updateFasilitas } from "../../../_sevices/fasilitas";
import { Card, Field, FormActions, Loading, PageHeader, getErrorMessage, inputClass } from "../../../components/ui";

export default function EditFasilitas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nama_fasilitas: "",
    jenis_fasilitas: "kamar",
    ikon: "",
    deskripsi: "",
  });

  useEffect(() => {
    showFasilitas(id)
      .then((f) => {
        setForm({
          nama_fasilitas: f.nama_fasilitas || "",
          jenis_fasilitas: f.jenis_fasilitas || "kamar",
          ikon: f.ikon || "",
          deskripsi: f.deskripsi || "",
        });
      })
      .catch((err) => {
        alert(getErrorMessage(err));
        navigate("/admin/fasilitas");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateFasilitas(id, form);
      navigate("/admin/fasilitas");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memperbarui fasilitas"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Edit Fasilitas" />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 space-y-4">
            <Field label="Nama Fasilitas" required>
              <input
                type="text"
                required
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

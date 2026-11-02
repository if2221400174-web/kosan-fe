import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGaleri } from "../../../_sevices/galeri";
import { getKamar } from "../../../_sevices/kamar";
import { Card, Field, FormActions, PageHeader, getErrorMessage, inputClass } from "../../../components/ui";

export default function CreateGaleri() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [kamarList, setKamarList] = useState([]);
  const [form, setForm] = useState({
    kamar_id: "",
    judul: "",
    kategori: "Tampak Depan",
    urutan: 0,
    status_publikasi: "terbit",
    foto: null,
  });

  useEffect(() => {
    getKamar().then((res) => setKamarList(res || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createGaleri(form);
      navigate("/admin/galeri");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal mengunggah foto"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Upload Foto Galeri" />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 space-y-4">
            <Field label="Judul / Caption Foto" required>
              <input
                type="text"
                required
                className={inputClass}
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
              />
            </Field>

            <Field label="File Foto" required>
              <input
                type="file"
                accept="image/*"
                required
                className={inputClass}
                onChange={(e) => setForm({ ...form, foto: e.target.files[0] })}
              />
            </Field>

            <Field label="Kategori" required>
              <input
                type="text"
                required
                placeholder="Contoh: Tampak Depan / Fasilitas Umum / Detail Kamar"
                className={inputClass}
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              />
            </Field>

            <Field label="Kaitkan ke Kamar (Opsional)" hint="Kosongkan jika merupakan foto umum kos">
              <select
                className={inputClass}
                value={form.kamar_id}
                onChange={(e) => setForm({ ...form, kamar_id: e.target.value })}
              >
                <option value="">— Foto Umum Kos —</option>
                {kamarList.map((k) => (
                  <option key={k.id} value={k.id}>
                    Kamar {k.nomor_kamar} ({k.tipe_kamar})
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Urutan Tampil">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.urutan}
                  onChange={(e) => setForm({ ...form, urutan: e.target.value })}
                />
              </Field>

              <Field label="Status Publikasi">
                <select
                  className={inputClass}
                  value={form.status_publikasi}
                  onChange={(e) => setForm({ ...form, status_publikasi: e.target.value })}
                >
                  <option value="terbit">Terbit</option>
                  <option value="draft">Draft</option>
                </select>
              </Field>
            </div>
          </div>
          <FormActions onCancel={() => navigate("/admin/galeri")} saving={saving} />
        </Card>
      </form>
    </div>
  );
}

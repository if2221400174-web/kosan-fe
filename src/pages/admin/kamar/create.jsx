import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createKamar } from "../../../_sevices/kamar";
import { getFasilitas } from "../../../_sevices/fasilitas";
import { Card, Field, FormActions, PageHeader, getErrorMessage, inputClass } from "../../../components/ui";

export default function CreateKamar() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [fasilitasList, setFasilitasList] = useState([]);
  const [form, setForm] = useState({
    nomor_kamar: "",
    tipe_kamar: "",
    lantai: 1,
    harga_bulanan: "",
    harga_tahunan: "",
    luas_kamar: "",
    deskripsi: "",
    status_kamar: "tersedia",
    foto_utama: null,
    fasilitas_ids: [],
  });

  useEffect(() => {
    getFasilitas().then((res) => {
      setFasilitasList((res || []).filter((f) => f.jenis_fasilitas === "kamar"));
    });
  }, []);

  const toggleFasilitas = (id) => {
    setForm((prev) => ({
      ...prev,
      fasilitas_ids: prev.fasilitas_ids.includes(id)
        ? prev.fasilitas_ids.filter((x) => x !== id)
        : [...prev.fasilitas_ids, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createKamar(form);
      navigate("/admin/kamar");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menambah kamar"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Tambah Kamar Baru" subtitle="Isi spesifikasi kamar dan pilih fasilitasnya" />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nomor Kamar" required>
              <input
                type="text"
                required
                placeholder="Contoh: A-01"
                className={inputClass}
                value={form.nomor_kamar}
                onChange={(e) => setForm({ ...form, nomor_kamar: e.target.value })}
              />
            </Field>

            <Field label="Tipe Kamar" required>
              <input
                type="text"
                required
                placeholder="Contoh: VIP / Reguler"
                className={inputClass}
                value={form.tipe_kamar}
                onChange={(e) => setForm({ ...form, tipe_kamar: e.target.value })}
              />
            </Field>

            <Field label="Lantai" required>
              <input
                type="number"
                min={1}
                required
                className={inputClass}
                value={form.lantai}
                onChange={(e) => setForm({ ...form, lantai: e.target.value })}
              />
            </Field>

            <Field label="Luas Kamar">
              <input
                type="text"
                placeholder="Contoh: 3x4 m"
                className={inputClass}
                value={form.luas_kamar}
                onChange={(e) => setForm({ ...form, luas_kamar: e.target.value })}
              />
            </Field>

            <Field label="Harga Sewa Bulanan (Rp)" required>
              <input
                type="number"
                min={0}
                required
                className={inputClass}
                value={form.harga_bulanan}
                onChange={(e) => setForm({ ...form, harga_bulanan: e.target.value })}
              />
            </Field>

            <Field label="Harga Sewa Tahunan (Rp)">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.harga_tahunan}
                onChange={(e) => setForm({ ...form, harga_tahunan: e.target.value })}
              />
            </Field>

            <Field label="Status Kamar" required>
              <select
                className={inputClass}
                value={form.status_kamar}
                onChange={(e) => setForm({ ...form, status_kamar: e.target.value })}
              >
                <option value="tersedia">Tersedia</option>
                <option value="terisi">Terisi</option>
                <option value="perbaikan">Perbaikan</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </Field>

            <Field label="Foto Utama Kamar">
              <input
                type="file"
                accept="image/*"
                className={inputClass}
                onChange={(e) => setForm({ ...form, foto_utama: e.target.files[0] })}
              />
            </Field>

            <Field label="Fasilitas Kamar" className="sm:col-span-2">
              <div className="flex flex-wrap gap-2 mt-1">
                {fasilitasList.map((f) => (
                  <label
                    key={f.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer ${
                      form.fasilitas_ids.includes(f.id)
                        ? "bg-green-50 border-green-600 text-green-800 font-medium"
                        : "bg-white border-gray-300 text-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.fasilitas_ids.includes(f.id)}
                      onChange={() => toggleFasilitas(f.id)}
                      className="rounded text-green-600"
                    />
                    {f.nama_fasilitas}
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Deskripsi" className="sm:col-span-2">
              <textarea
                rows={3}
                className={inputClass}
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              />
            </Field>
          </div>
          <FormActions onCancel={() => navigate("/admin/kamar")} saving={saving} />
        </Card>
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showKamar, updateKamar } from "../../../_sevices/kamar";
import { getFasilitas } from "../../../_sevices/fasilitas";
import { Card, Field, FormActions, Loading, PageHeader, getErrorMessage, inputClass } from "../../../components/ui";

export default function EditKamar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
    const fetchAll = async () => {
      try {
        const [kamar, fas] = await Promise.all([showKamar(id), getFasilitas()]);
        setFasilitasList((fas || []).filter((f) => f.jenis_fasilitas === "kamar"));
        setForm({
          nomor_kamar: kamar.nomor_kamar || "",
          tipe_kamar: kamar.tipe_kamar || "",
          lantai: kamar.lantai || 1,
          harga_bulanan: kamar.harga_bulanan || "",
          harga_tahunan: kamar.harga_tahunan || "",
          luas_kamar: kamar.luas_kamar || "",
          deskripsi: kamar.deskripsi || "",
          status_kamar: kamar.status_kamar || "tersedia",
          foto_utama: null,
          fasilitas_ids: (kamar.fasilitas || []).map((f) => f.id),
        });
      } catch (err) {
        alert(getErrorMessage(err, "Kamar tidak ditemukan"));
        navigate("/admin/kamar");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, navigate]);

  const toggleFasilitas = (fid) => {
    setForm((prev) => ({
      ...prev,
      fasilitas_ids: prev.fasilitas_ids.includes(fid)
        ? prev.fasilitas_ids.filter((x) => x !== fid)
        : [...prev.fasilitas_ids, fid],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateKamar(id, form);
      navigate("/admin/kamar");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memperbarui kamar"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title={`Edit Kamar ${form.nomor_kamar}`} />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nomor Kamar" required>
              <input
                type="text"
                required
                className={inputClass}
                value={form.nomor_kamar}
                onChange={(e) => setForm({ ...form, nomor_kamar: e.target.value })}
              />
            </Field>

            <Field label="Tipe Kamar" required>
              <input
                type="text"
                required
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

            <Field label="Ganti Foto Utama">
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

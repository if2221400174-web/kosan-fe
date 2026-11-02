import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showKontrakSewa, updateKontrakSewa } from "../../../_sevices/kontrakSewa";
import { getPenyewa } from "../../../_sevices/penyewa";
import { getKamar } from "../../../_sevices/kamar";
import { Card, Field, FormActions, Loading, PageHeader, getErrorMessage, inputClass, toInputDate } from "../../../components/ui";

export default function EditKontrakSewa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [penyewaList, setPenyewaList] = useState([]);
  const [kamarList, setKamarList] = useState([]);
  const [form, setForm] = useState({
    penyewa_id: "",
    kamar_id: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    tipe_sewa: "bulanan",
    harga_sewa: "",
    status_kontrak: "aktif",
    catatan: "",
  });

  useEffect(() => {
    Promise.all([showKontrakSewa(id), getPenyewa(), getKamar()])
      .then(([k, penyewa, kamar]) => {
        setPenyewaList(penyewa || []);
        setKamarList(kamar || []);
        setForm({
          penyewa_id: k.penyewa_id || "",
          kamar_id: k.kamar_id || "",
          tanggal_mulai: toInputDate(k.tanggal_mulai),
          tanggal_selesai: toInputDate(k.tanggal_selesai),
          tipe_sewa: k.tipe_sewa || "bulanan",
          harga_sewa: k.harga_sewa || "",
          status_kontrak: k.status_kontrak || "aktif",
          catatan: k.catatan || "",
        });
      })
      .catch((err) => {
        alert(getErrorMessage(err));
        navigate("/admin/kontrak-sewa");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateKontrakSewa(id, form);
      navigate("/admin/kontrak-sewa");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memperbarui kontrak"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Edit Kontrak Sewa" />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Penyewa" required>
              <select
                required
                className={inputClass}
                value={form.penyewa_id}
                onChange={(e) => setForm({ ...form, penyewa_id: e.target.value })}
              >
                {penyewaList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.user?.nama} ({p.nik})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Kamar" required>
              <select
                required
                className={inputClass}
                value={form.kamar_id}
                onChange={(e) => setForm({ ...form, kamar_id: e.target.value })}
              >
                {kamarList.map((k) => (
                  <option key={k.id} value={k.id}>
                    Kamar {k.nomor_kamar} ({k.tipe_kamar})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tanggal Mulai" required>
              <input
                type="date"
                required
                className={inputClass}
                value={form.tanggal_mulai}
                onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })}
              />
            </Field>

            <Field label="Tanggal Selesai" required>
              <input
                type="date"
                required
                className={inputClass}
                value={form.tanggal_selesai}
                onChange={(e) => setForm({ ...form, tanggal_selesai: e.target.value })}
              />
            </Field>

            <Field label="Tipe Sewa" required>
              <select
                className={inputClass}
                value={form.tipe_sewa}
                onChange={(e) => setForm({ ...form, tipe_sewa: e.target.value })}
              >
                <option value="bulanan">Bulanan</option>
                <option value="tahunan">Tahunan</option>
              </select>
            </Field>

            <Field label="Harga Kesepakatan (Rp)" required>
              <input
                type="number"
                min={0}
                required
                className={inputClass}
                value={form.harga_sewa}
                onChange={(e) => setForm({ ...form, harga_sewa: e.target.value })}
              />
            </Field>

            <Field label="Status Kontrak" required className="sm:col-span-2">
              <select
                className={inputClass}
                value={form.status_kontrak}
                onChange={(e) => setForm({ ...form, status_kontrak: e.target.value })}
              >
                <option value="menunggu">Menunggu</option>
                <option value="aktif">Aktif</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </Field>

            <Field label="Catatan" className="sm:col-span-2">
              <textarea
                rows={2}
                className={inputClass}
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              />
            </Field>
          </div>
          <FormActions onCancel={() => navigate("/admin/kontrak-sewa")} saving={saving} />
        </Card>
      </form>
    </div>
  );
}

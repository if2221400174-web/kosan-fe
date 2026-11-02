import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showTagihan, updateTagihan } from "../../../_sevices/tagihan";
import { Card, Field, FormActions, Loading, PageHeader, formatRupiah, getErrorMessage, inputClass, toInputDate } from "../../../components/ui";

export default function EditTagihan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kode, setKode] = useState("");
  const [form, setForm] = useState({
    periode_mulai: "",
    periode_selesai: "",
    tanggal_terbit: "",
    tanggal_jatuh_tempo: "",
    nominal_pokok: 0,
    denda: 0,
    status_tagihan: "belum_bayar",
    keterangan: "",
  });

  useEffect(() => {
    showTagihan(id)
      .then((t) => {
        setKode(t.kode_tagihan);
        setForm({
          periode_mulai: toInputDate(t.periode_mulai),
          periode_selesai: toInputDate(t.periode_selesai),
          tanggal_terbit: toInputDate(t.tanggal_terbit),
          tanggal_jatuh_tempo: toInputDate(t.tanggal_jatuh_tempo),
          nominal_pokok: t.nominal_pokok || 0,
          denda: t.denda || 0,
          status_tagihan: t.status_tagihan || "belum_bayar",
          keterangan: t.keterangan || "",
        });
      })
      .catch((err) => {
        alert(getErrorMessage(err));
        navigate("/admin/tagihan");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateTagihan(id, form);
      navigate("/admin/tagihan");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memperbarui tagihan"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  const totalPreview = Number(form.nominal_pokok || 0) + Number(form.denda || 0);

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title={`Edit Tagihan ${kode}`} />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Periode Mulai" required>
              <input
                type="date"
                required
                className={inputClass}
                value={form.periode_mulai}
                onChange={(e) => setForm({ ...form, periode_mulai: e.target.value })}
              />
            </Field>

            <Field label="Periode Selesai" required>
              <input
                type="date"
                required
                className={inputClass}
                value={form.periode_selesai}
                onChange={(e) => setForm({ ...form, periode_selesai: e.target.value })}
              />
            </Field>

            <Field label="Tanggal Terbit" required>
              <input
                type="date"
                required
                className={inputClass}
                value={form.tanggal_terbit}
                onChange={(e) => setForm({ ...form, tanggal_terbit: e.target.value })}
              />
            </Field>

            <Field label="Tanggal Jatuh Tempo" required>
              <input
                type="date"
                required
                className={inputClass}
                value={form.tanggal_jatuh_tempo}
                onChange={(e) => setForm({ ...form, tanggal_jatuh_tempo: e.target.value })}
              />
            </Field>

            <Field label="Nominal Pokok (Rp)" required>
              <input
                type="number"
                min={0}
                required
                className={inputClass}
                value={form.nominal_pokok}
                onChange={(e) => setForm({ ...form, nominal_pokok: e.target.value })}
              />
            </Field>

            <Field label="Denda (Rp)">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.denda}
                onChange={(e) => setForm({ ...form, denda: e.target.value })}
              />
            </Field>

            <Field label="Status Tagihan" required className="sm:col-span-2">
              <select
                className={inputClass}
                value={form.status_tagihan}
                onChange={(e) => setForm({ ...form, status_tagihan: e.target.value })}
              >
                <option value="belum_bayar">Belum Bayar</option>
                <option value="sebagian">Sebagian</option>
                <option value="lunas">Lunas</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </Field>

            <div className="sm:col-span-2 p-3 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
              <span className="text-sm font-medium text-green-900">Total Jumlah Tagihan:</span>
              <span className="text-lg font-bold text-green-800">{formatRupiah(totalPreview)}</span>
            </div>

            <Field label="Keterangan" className="sm:col-span-2">
              <textarea
                rows={2}
                className={inputClass}
                value={form.keterangan}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              />
            </Field>
          </div>
          <FormActions onCancel={() => navigate("/admin/tagihan")} saving={saving} />
        </Card>
      </form>
    </div>
  );
}

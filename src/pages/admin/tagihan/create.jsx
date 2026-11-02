import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTagihan } from "../../../_sevices/tagihan";
import { getKontrakSewa } from "../../../_sevices/kontrakSewa";
import { Card, Field, FormActions, PageHeader, formatRupiah, getErrorMessage, inputClass, todayString } from "../../../components/ui";

export default function CreateTagihan() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [kontrakList, setKontrakList] = useState([]);
  const [form, setForm] = useState({
    kontrak_sewa_id: "",
    periode_mulai: todayString(),
    periode_selesai: "",
    tanggal_terbit: todayString(),
    tanggal_jatuh_tempo: "",
    nominal_pokok: "",
    denda: 0,
    status_tagihan: "belum_bayar",
    keterangan: "",
  });

  useEffect(() => {
    getKontrakSewa().then((res) => setKontrakList(res || []));
  }, []);

  const handleKontrakChange = (id) => {
    const k = kontrakList.find((x) => String(x.id) === String(id));
    setForm((prev) => ({
      ...prev,
      kontrak_sewa_id: id,
      nominal_pokok: k ? k.harga_sewa : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTagihan(form);
      navigate("/admin/tagihan");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menerbitkan tagihan"));
    } finally {
      setSaving(false);
    }
  };

  const totalPreview = Number(form.nominal_pokok || 0) + Number(form.denda || 0);

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Terbitkan Tagihan Baru" subtitle="Nominal pokok otomatis mengikuti harga kesepakatan kontrak" />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Pilih Kontrak Sewa" required className="sm:col-span-2">
              <select
                required
                className={inputClass}
                value={form.kontrak_sewa_id}
                onChange={(e) => handleKontrakChange(e.target.value)}
              >
                <option value="">— Pilih Kontrak —</option>
                {kontrakList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.kode_kontrak} • {k.penyewa?.user?.nama} (Kamar {k.kamar?.nomor_kamar}) — {formatRupiah(k.harga_sewa)}
                  </option>
                ))}
              </select>
            </Field>

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

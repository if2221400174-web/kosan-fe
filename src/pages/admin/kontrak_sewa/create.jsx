import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createKontrakSewa } from "../../../_sevices/kontrakSewa";
import { getPenyewa } from "../../../_sevices/penyewa";
import { getKamar } from "../../../_sevices/kamar";
import { Card, Field, FormActions, PageHeader, formatRupiah, getErrorMessage, inputClass, todayString } from "../../../components/ui";

export default function CreateKontrakSewa() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [penyewaList, setPenyewaList] = useState([]);
  const [kamarList, setKamarList] = useState([]);
  const [form, setForm] = useState({
    penyewa_id: "",
    kamar_id: "",
    tanggal_mulai: todayString(),
    tanggal_selesai: "",
    tipe_sewa: "bulanan",
    harga_sewa: "",
    status_kontrak: "aktif",
    catatan: "",
  });

  useEffect(() => {
    Promise.all([getPenyewa(), getKamar()]).then(([p, k]) => {
      setPenyewaList(p || []);
      setKamarList(k || []);
    });
  }, []);

  const handleKamarOrTipeChange = (kamarId, tipeSewa) => {
    const kamar = kamarList.find((x) => String(x.id) === String(kamarId));
    let harga = form.harga_sewa;
    if (kamar) {
      harga = tipeSewa === "tahunan" && kamar.harga_tahunan ? kamar.harga_tahunan : kamar.harga_bulanan;
    }
    setForm((prev) => ({
      ...prev,
      kamar_id: kamarId,
      tipe_sewa: tipeSewa,
      harga_sewa: harga || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createKontrakSewa(form);
      navigate("/admin/kontrak-sewa");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal membuat kontrak sewa"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Buat Kontrak Sewa Baru"
        subtitle="Saat status kontrak Aktif, status kamar otomatis berubah menjadi Terisi"
      />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Pilih Penyewa" required>
              <select
                required
                className={inputClass}
                value={form.penyewa_id}
                onChange={(e) => setForm({ ...form, penyewa_id: e.target.value })}
              >
                <option value="">— Pilih Penyewa —</option>
                {penyewaList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.user?.nama} ({p.nik})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Pilih Kamar" required>
              <select
                required
                className={inputClass}
                value={form.kamar_id}
                onChange={(e) => handleKamarOrTipeChange(e.target.value, form.tipe_sewa)}
              >
                <option value="">— Pilih Kamar —</option>
                {kamarList.map((k) => (
                  <option key={k.id} value={k.id}>
                    Kamar {k.nomor_kamar} - {k.tipe_kamar} ({formatRupiah(k.harga_bulanan)}/bln) [{k.status_kamar}]
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
                onChange={(e) => handleKamarOrTipeChange(form.kamar_id, e.target.value)}
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

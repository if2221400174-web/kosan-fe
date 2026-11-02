import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLaporan } from "../../../_sevices/laporan";
import { getKontrakSewa } from "../../../_sevices/kontrakSewa";
import { getUserInfo } from "../../../_sevices/auth";
import { Card, Field, FormActions, PageHeader, getErrorMessage, inputClass } from "../../../components/ui";

export default function CreateLaporanPenyewa() {
  const navigate = useNavigate();
  const user = getUserInfo();
  const [saving, setSaving] = useState(false);
  const [kamarList, setKamarList] = useState([]);
  const [form, setForm] = useState({
    penyewa_id: user?.penyewa?.id || "",
    kamar_id: "",
    judul: "",
    deskripsi: "",
    foto: null,
  });

  useEffect(() => {
    getKontrakSewa().then((res) => {
      const kamars = (res || []).map((k) => k.kamar).filter(Boolean);
      setKamarList(kamars);
      if (kamars[0]) {
        setForm((prev) => ({ ...prev, kamar_id: kamars[0].id }));
      }
      if (!form.penyewa_id && res?.[0]?.penyewa_id) {
        setForm((prev) => ({ ...prev, penyewa_id: res[0].penyewa_id }));
      }
    });
  }, [form.penyewa_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.penyewa_id) {
      alert("Profil identitas penyewa belum lengkap. Silakan lengkapi di menu Edit Profile.");
      return;
    }
    setSaving(true);
    try {
      await createLaporan(form);
      navigate("/penyewa/laporan");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal mengirim laporan"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Buat Laporan Keluhan / Kerusakan" />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 space-y-4">
            <Field label="Lokasi Keluhan">
              <select
                className={inputClass}
                value={form.kamar_id}
                onChange={(e) => setForm({ ...form, kamar_id: e.target.value })}
              >
                <option value="">— Fasilitas Umum Kos —</option>
                {kamarList.map((k) => (
                  <option key={k.id} value={k.id}>
                    Kamar {k.nomor_kamar}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Judul Keluhan" required>
              <input
                type="text"
                required
                placeholder="Contoh: AC kurang dingin / Keran bocor"
                className={inputClass}
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
              />
            </Field>

            <Field label="Deskripsi Detail" required>
              <textarea
                rows={4}
                required
                className={inputClass}
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              />
            </Field>

            <Field label="Foto Bukti Kerusakan (Opsional)">
              <input
                type="file"
                accept="image/*"
                className={inputClass}
                onChange={(e) => setForm({ ...form, foto: e.target.files[0] })}
              />
            </Field>
          </div>
          <FormActions onCancel={() => navigate("/penyewa/laporan")} saving={saving} submitText="Kirim Laporan" />
        </Card>
      </form>
    </div>
  );
}

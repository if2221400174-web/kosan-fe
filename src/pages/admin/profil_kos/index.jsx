import { useEffect, useState } from "react";
import { getProfilKos, saveProfilKos } from "../../../_sevices/profilKos";
import { imageStorage } from "../../../_api";
import { Card, Field, FormActions, Loading, PageHeader, getErrorMessage, inputClass } from "../../../components/ui";

export default function AdminProfilKos() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(null);
  const [form, setForm] = useState({
    nama_kos: "",
    tagline: "",
    deskripsi: "",
    alamat: "",
    google_maps_url: "",
    telepon: "",
    email: "",
    whatsapp: "",
    info_rekening: "",
    aturan_kos: "",
    jam_malam: "",
    logo: null,
    foto_utama: null,
  });

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const p = await getProfilKos();
        if (p) {
          setExisting(p);
          setForm({
            nama_kos: p.nama_kos || "",
            tagline: p.tagline || "",
            deskripsi: p.deskripsi || "",
            alamat: p.alamat || "",
            google_maps_url: p.google_maps_url || "",
            telepon: p.telepon || "",
            email: p.email || "",
            whatsapp: p.whatsapp || "",
            info_rekening: p.info_rekening || "",
            aturan_kos: p.aturan_kos || "",
            jam_malam: p.jam_malam ? String(p.jam_malam).substring(0, 5) : "",
            logo: null,
            foto_utama: null,
          });
        }
      } catch (err) {
        alert(getErrorMessage(err, "Gagal memuat profil kos"));
      } finally {
        setLoading(false);
      }
    };
    fetchProfil();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await saveProfilKos(form);
      setExisting(res.data);
      alert("Profil kos berhasil disimpan!");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menyimpan profil kos"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Profil & Pengaturan Kos"
        subtitle="Informasi identitas kos, kontak, aturan, dan rekening tujuan transfer"
      />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nama Kos" required>
              <input
                type="text"
                required
                className={inputClass}
                value={form.nama_kos}
                onChange={(e) => setForm({ ...form, nama_kos: e.target.value })}
              />
            </Field>

            <Field label="Tagline / Slogan">
              <input
                type="text"
                className={inputClass}
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
            </Field>

            <Field label="Telepon Pengelola" required>
              <input
                type="text"
                required
                className={inputClass}
                value={form.telepon}
                onChange={(e) => setForm({ ...form, telepon: e.target.value })}
              />
            </Field>

            <Field label="WhatsApp Pengelola" required>
              <input
                type="text"
                required
                className={inputClass}
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
            </Field>

            <Field label="Email Kos">
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>

            <Field label="Jam Malam (Opsional)">
              <input
                type="time"
                className={inputClass}
                value={form.jam_malam}
                onChange={(e) => setForm({ ...form, jam_malam: e.target.value })}
              />
            </Field>

            <Field label="Info Rekening Pembayaran" className="sm:col-span-2" hint="Ditampilkan ke penyewa saat membayar tagihan">
              <textarea
                rows={2}
                className={inputClass}
                placeholder="Contoh: BCA 1234567890 a.n. Pemilik Kos"
                value={form.info_rekening}
                onChange={(e) => setForm({ ...form, info_rekening: e.target.value })}
              />
            </Field>

            <Field label="Alamat Lengkap Kos" required className="sm:col-span-2">
              <textarea
                rows={2}
                required
                className={inputClass}
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              />
            </Field>

            <Field label="Deskripsi Kos" required className="sm:col-span-2">
              <textarea
                rows={3}
                required
                className={inputClass}
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              />
            </Field>

            <Field label="Aturan / Tata Tertib Kos" className="sm:col-span-2">
              <textarea
                rows={3}
                className={inputClass}
                value={form.aturan_kos}
                onChange={(e) => setForm({ ...form, aturan_kos: e.target.value })}
              />
            </Field>

            <Field label="URL Google Maps" className="sm:col-span-2">
              <input
                type="text"
                className={inputClass}
                value={form.google_maps_url}
                onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })}
              />
            </Field>

            <Field label="Logo Kos">
              <input
                type="file"
                accept="image/*"
                className={inputClass}
                onChange={(e) => setForm({ ...form, logo: e.target.files[0] })}
              />
              {existing?.logo && (
                <a href={imageStorage(existing.logo)} target="_blank" rel="noreferrer" className="text-xs text-green-700 hover:underline mt-1 inline-block">
                  Lihat Logo Saat Ini
                </a>
              )}
            </Field>

            <Field label="Foto Utama Banner">
              <input
                type="file"
                accept="image/*"
                className={inputClass}
                onChange={(e) => setForm({ ...form, foto_utama: e.target.files[0] })}
              />
              {existing?.foto_utama && (
                <a href={imageStorage(existing.foto_utama)} target="_blank" rel="noreferrer" className="text-xs text-green-700 hover:underline mt-1 inline-block">
                  Lihat Foto Utama Saat Ini
                </a>
              )}
            </Field>
          </div>
          <FormActions onCancel={() => window.history.back()} saving={saving} submitText="Simpan Pengaturan" />
        </Card>
      </form>
    </div>
  );
}

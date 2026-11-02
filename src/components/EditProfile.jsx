import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../_sevices/auth";
import { updatePenyewa, createPenyewa } from "../_sevices/penyewa";
import { imageStorage } from "../_api";
import { Card, Field, FormActions, Loading, PageHeader, StatusBadge, getErrorMessage, inputClass } from "./ui";

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  const [formAkun, setFormAkun] = useState({
    nama: "",
    email: "",
    nomor_telepon: "",
    password: "",
  });

  const [formPenyewa, setFormPenyewa] = useState({
    nik: "",
    jenis_kelamin: "laki-laki",
    alamat_asal: "",
    pekerjaan: "",
    nama_kontak_darurat: "",
    nomor_kontak_darurat: "",
    foto_ktp: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProfile();
        setUser(res);
        setFormAkun({
          nama: res.nama || "",
          email: res.email || "",
          nomor_telepon: res.nomor_telepon || "",
          password: "",
        });
        if (res.penyewa) {
          setFormPenyewa({
            nik: res.penyewa.nik || "",
            jenis_kelamin: res.penyewa.jenis_kelamin || "laki-laki",
            alamat_asal: res.penyewa.alamat_asal || "",
            pekerjaan: res.penyewa.pekerjaan || "",
            nama_kontak_darurat: res.penyewa.nama_kontak_darurat || "",
            nomor_kontak_darurat: res.penyewa.nomor_kontak_darurat || "",
            foto_ktp: null,
          });
        }
      } catch (err) {
        alert(getErrorMessage(err, "Gagal memuat profil"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payloadAkun = {
        nama: formAkun.nama,
        email: formAkun.email,
        nomor_telepon: formAkun.nomor_telepon,
      };
      if (formAkun.password) payloadAkun.password = formAkun.password;

      await updateProfile(payloadAkun);

      if (user?.role === "penyewa" && formPenyewa.nik) {
        if (user.penyewa?.id) {
          await updatePenyewa(user.penyewa.id, formPenyewa);
        } else {
          await createPenyewa(formPenyewa);
        }
      }

      const updated = await getProfile();
      localStorage.setItem("userInfo", JSON.stringify(updated));
      alert("Profil berhasil diperbarui!");
      navigate(-1);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memperbarui profil"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Edit Profil" subtitle="Perbarui informasi akun dan identitas Anda" />

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-800">Informasi Akun</h3>
                <p className="text-xs text-gray-500">Data login dan kontak utama</p>
              </div>
              <StatusBadge status={user?.role} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nama Lengkap" required>
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={formAkun.nama}
                  onChange={(e) => setFormAkun({ ...formAkun, nama: e.target.value })}
                />
              </Field>

              <Field label="Nomor Telepon / WhatsApp" required>
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={formAkun.nomor_telepon}
                  onChange={(e) => setFormAkun({ ...formAkun, nomor_telepon: e.target.value })}
                />
              </Field>

              <Field label="Email" required>
                <input
                  type="email"
                  required
                  className={inputClass}
                  value={formAkun.email}
                  onChange={(e) => setFormAkun({ ...formAkun, email: e.target.value })}
                />
              </Field>

              <Field label="Password Baru" hint="Kosongkan jika tidak ingin mengubah password">
                <input
                  type="password"
                  minLength={8}
                  className={inputClass}
                  placeholder="Minimal 8 karakter"
                  value={formAkun.password}
                  onChange={(e) => setFormAkun({ ...formAkun, password: e.target.value })}
                />
              </Field>
            </div>

            {user?.role === "penyewa" && (
              <>
                <div className="border-t border-gray-200 pt-5">
                  <h3 className="text-base font-semibold text-gray-800">Identitas Penyewa (Sesuai KTP)</h3>
                  <p className="text-xs text-gray-500">Digunakan untuk administrasi kontrak sewa</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="NIK (16 Digit)" required>
                    <input
                      type="text"
                      maxLength={16}
                      required
                      className={inputClass}
                      value={formPenyewa.nik}
                      onChange={(e) => setFormPenyewa({ ...formPenyewa, nik: e.target.value })}
                    />
                  </Field>

                  <Field label="Jenis Kelamin" required>
                    <select
                      className={inputClass}
                      value={formPenyewa.jenis_kelamin}
                      onChange={(e) => setFormPenyewa({ ...formPenyewa, jenis_kelamin: e.target.value })}
                    >
                      <option value="laki-laki">Laki-laki</option>
                      <option value="perempuan">Perempuan</option>
                    </select>
                  </Field>

                  <Field label="Pekerjaan">
                    <input
                      type="text"
                      className={inputClass}
                      value={formPenyewa.pekerjaan}
                      onChange={(e) => setFormPenyewa({ ...formPenyewa, pekerjaan: e.target.value })}
                    />
                  </Field>

                  <Field label="Foto KTP">
                    <input
                      type="file"
                      accept="image/*"
                      className={inputClass}
                      onChange={(e) => setFormPenyewa({ ...formPenyewa, foto_ktp: e.target.files[0] })}
                    />
                    {user?.penyewa?.foto_ktp && (
                      <a
                        href={imageStorage(user.penyewa.foto_ktp)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-1 text-xs text-green-700 hover:underline"
                      >
                        Lihat Foto KTP Saat Ini
                      </a>
                    )}
                  </Field>

                  <Field label="Nama Kontak Darurat">
                    <input
                      type="text"
                      className={inputClass}
                      value={formPenyewa.nama_kontak_darurat}
                      onChange={(e) => setFormPenyewa({ ...formPenyewa, nama_kontak_darurat: e.target.value })}
                    />
                  </Field>

                  <Field label="Nomor Kontak Darurat">
                    <input
                      type="text"
                      className={inputClass}
                      value={formPenyewa.nomor_kontak_darurat}
                      onChange={(e) => setFormPenyewa({ ...formPenyewa, nomor_kontak_darurat: e.target.value })}
                    />
                  </Field>

                  <Field label="Alamat Asal (KTP)" required className="sm:col-span-2">
                    <textarea
                      rows={2}
                      required
                      className={inputClass}
                      value={formPenyewa.alamat_asal}
                      onChange={(e) => setFormPenyewa({ ...formPenyewa, alamat_asal: e.target.value })}
                    />
                  </Field>
                </div>
              </>
            )}
          </div>

          <FormActions onCancel={() => navigate(-1)} saving={saving} />
        </Card>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPengeluaran } from "../../../_sevices/pengeluaran";
import { Card, Field, FormActions, PageHeader, getErrorMessage, inputClass, todayString } from "../../../components/ui";

export default function CreatePengeluaran() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    kategori: "listrik",
    nama_pengeluaran: "",
    tanggal_pengeluaran: todayString(),
    jumlah: "",
    keterangan: "",
    bukti_pengeluaran: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createPengeluaran(form);
      navigate("/admin/pengeluaran");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal mencatat pengeluaran"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Catat Pengeluaran Operasional" />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 space-y-4">
            <Field label="Kategori Biaya" required>
              <select
                className={inputClass}
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              >
                <option value="listrik">Listrik</option>
                <option value="air">Air</option>
                <option value="internet">Internet / WiFi</option>
                <option value="perbaikan">Perbaikan & Pemeliharaan</option>
                <option value="kebersihan">Kebersihan & Keamanan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </Field>

            <Field label="Nama Pengeluaran" required>
              <input
                type="text"
                required
                placeholder="Contoh: Token Listrik Lantai 1"
                className={inputClass}
                value={form.nama_pengeluaran}
                onChange={(e) => setForm({ ...form, nama_pengeluaran: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tanggal Transaksi" required>
                <input
                  type="date"
                  required
                  className={inputClass}
                  value={form.tanggal_pengeluaran}
                  onChange={(e) => setForm({ ...form, tanggal_pengeluaran: e.target.value })}
                />
              </Field>

              <Field label="Nominal (Rp)" required>
                <input
                  type="number"
                  min={0}
                  required
                  className={inputClass}
                  value={form.jumlah}
                  onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Upload Foto Nota / Struk (Opsional)">
              <input
                type="file"
                accept="image/*"
                className={inputClass}
                onChange={(e) => setForm({ ...form, bukti_pengeluaran: e.target.files[0] })}
              />
            </Field>

            <Field label="Keterangan">
              <textarea
                rows={2}
                className={inputClass}
                value={form.keterangan}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              />
            </Field>
          </div>
          <FormActions onCancel={() => navigate("/admin/pengeluaran")} saving={saving} />
        </Card>
      </form>
    </div>
  );
}

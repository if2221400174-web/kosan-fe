import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showTagihan } from "../../../_sevices/tagihan";
import { createPembayaran } from "../../../_sevices/pembayaran";
import { getProfilKos } from "../../../_sevices/profilKos";
import { Card, Field, FormActions, Loading, PageHeader, formatRupiah, formatTanggal, getErrorMessage, inputClass } from "../../../components/ui";

export default function CreatePembayaranPenyewa() {
  const { tagihanId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagihan, setTagihan] = useState(null);
  const [profilKos, setProfilKos] = useState(null);
  const [form, setForm] = useState({
    tagihan_id: tagihanId,
    jumlah_bayar: "",
    metode_pembayaran: "transfer",
    bukti_bayar: null,
  });

  useEffect(() => {
    Promise.all([showTagihan(tagihanId), getProfilKos().catch(() => null)])
      .then(([t, p]) => {
        setTagihan(t);
        setProfilKos(p);
        setForm((prev) => ({
          ...prev,
          tagihan_id: t.id,
          jumlah_bayar: t.jumlah_tagihan || "",
        }));
      })
      .catch((err) => {
        alert(getErrorMessage(err));
        navigate("/penyewa/tagihan");
      })
      .finally(() => setLoading(false));
  }, [tagihanId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createPembayaran(form);
      alert("Pembayaran berhasil dikirim! Menunggu verifikasi pengelola kos.");
      navigate("/penyewa/pembayaran");
    } catch (err) {
      alert(getErrorMessage(err, "Gagal mengirim pembayaran"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Kirim Pembayaran Tagihan" subtitle="Unggah bukti pembayaran untuk diverifikasi pengelola" />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-1 text-sm">
              <p><span className="text-gray-600">Kode Tagihan:</span> <strong>{tagihan?.kode_tagihan}</strong></p>
              <p><span className="text-gray-600">Periode:</span> {formatTanggal(tagihan?.periode_mulai)} - {formatTanggal(tagihan?.periode_selesai)}</p>
              <p><span className="text-gray-600">Total Tagihan:</span> <strong className="text-green-800">{formatRupiah(tagihan?.jumlah_tagihan)}</strong></p>
              {profilKos?.info_rekening && (
                <p className="pt-2 border-t border-green-200 text-xs text-green-900">
                  <strong>Rekening Tujuan:</strong> {profilKos.info_rekening}
                </p>
              )}
            </div>

            <Field label="Nominal yang Dibayarkan (Rp)" required>
              <input
                type="number"
                min={1}
                required
                className={inputClass}
                value={form.jumlah_bayar}
                onChange={(e) => setForm({ ...form, jumlah_bayar: e.target.value })}
              />
            </Field>

            <Field label="Metode Pembayaran" required>
              <select
                className={inputClass}
                value={form.metode_pembayaran}
                onChange={(e) => setForm({ ...form, metode_pembayaran: e.target.value })}
              >
                <option value="transfer">Transfer Bank</option>
                <option value="qris">QRIS</option>
                <option value="tunai">Tunai</option>
              </select>
            </Field>

            <Field label="Upload Bukti Pembayaran" required={form.metode_pembayaran !== "tunai"}>
              <input
                type="file"
                accept="image/*"
                required={form.metode_pembayaran !== "tunai"}
                className={inputClass}
                onChange={(e) => setForm({ ...form, bukti_bayar: e.target.files[0] })}
              />
            </Field>
          </div>
          <FormActions onCancel={() => navigate("/penyewa/tagihan")} saving={saving} submitText="Kirim Pembayaran" />
        </Card>
      </form>
    </div>
  );
}

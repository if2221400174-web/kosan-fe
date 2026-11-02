import { useEffect, useState } from "react";
import { getPembayaran } from "../../../_sevices/pembayaran";
import { imageStorage } from "../../../_api";
import { Card, EmptyState, Loading, PageHeader, StatusBadge, Table, formatRupiah, formatTanggal } from "../../../components/ui";

export default function PenyewaPembayaran() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPembayaran()
      .then((res) => setItems(res || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Riwayat Pembayaran Saya" subtitle="Status verifikasi pembayaran yang telah Anda kirimkan" />
      <Card>
        {items.length === 0 ? (
          <EmptyState text="Belum ada riwayat pembayaran" />
        ) : (
          <Table headers={["Kode Pembayaran", "Kode Tagihan", "Tanggal Bayar", "Metode", "Jumlah Dibayar", "Bukti", "Status Verifikasi", "Catatan Admin"]}>
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{p.kode_pembayaran}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.tagihan?.kode_tagihan || "—"}</td>
                <td className="px-4 py-3 text-xs">{formatTanggal(p.tanggal_bayar, true)}</td>
                <td className="px-4 py-3 uppercase text-xs font-semibold">{p.metode_pembayaran}</td>
                <td className="px-4 py-3 font-bold text-green-700">{formatRupiah(p.jumlah_bayar)}</td>
                <td className="px-4 py-3">
                  {p.bukti_bayar ? (
                    <a
                      href={imageStorage(p.bukti_bayar)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-green-700 hover:underline"
                    >
                      Lihat Bukti
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3"><StatusBadge status={p.status_pembayaran} /></td>
                <td className="px-4 py-3 text-xs">{p.catatan_verifikasi || "—"}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

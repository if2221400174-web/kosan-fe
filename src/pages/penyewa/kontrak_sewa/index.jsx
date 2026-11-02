import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getKontrakSewa } from "../../../_sevices/kontrakSewa";
import { Card, EmptyState, Loading, PageHeader, StatusBadge, Table, formatRupiah, formatTanggal } from "../../../components/ui";

export default function PenyewaKontrak() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKontrakSewa()
      .then((res) => setItems(res || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Kamar & Kontrak Sewa Saya"
        subtitle="Informasi kamar yang Anda huni dan riwayat pemesanan / kontrak sewa"
      >
        <Link
          to="/#kamar"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-green-700 hover:bg-green-800 rounded-lg transition-colors"
        >
          + Pesan Kamar Kos
        </Link>
      </PageHeader>
      <Card>
        {items.length === 0 ? (
          <EmptyState text="Belum ada kontrak sewa yang terdaftar pada akun Anda" />
        ) : (
          <Table headers={["Kode Kontrak", "Kamar", "Tipe Kamar", "Periode Sewa", "Tipe Sewa", "Harga Sewa", "Status", "Catatan"]}>
            {items.map((k) => (
              <tr key={k.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{k.kode_kontrak}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">Kamar {k.kamar?.nomor_kamar}</td>
                <td className="px-4 py-3">{k.kamar?.tipe_kamar}</td>
                <td className="px-4 py-3 text-xs">
                  {formatTanggal(k.tanggal_mulai)} s/d {formatTanggal(k.tanggal_selesai)}
                </td>
                <td className="px-4 py-3 capitalize">{k.tipe_sewa}</td>
                <td className="px-4 py-3 font-bold text-green-700">{formatRupiah(k.harga_sewa)}</td>
                <td className="px-4 py-3"><StatusBadge status={k.status_kontrak} /></td>
                <td className="px-4 py-3 text-xs">{k.catatan || "—"}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

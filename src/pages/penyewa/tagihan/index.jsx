import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTagihan } from "../../../_sevices/tagihan";
import { ButtonLink, Card, EmptyState, Icons, Loading, PageHeader, StatusBadge, Table, formatRupiah, formatTanggal } from "../../../components/ui";

export default function PenyewaTagihan() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTagihan()
      .then((res) => setItems(res || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Tagihan Sewa Saya" subtitle="Daftar invoice bulanan/tahunan dan status pembayarannya" />
      <Card>
        {items.length === 0 ? (
          <EmptyState text="Belum ada tagihan untuk Anda" />
        ) : (
          <Table headers={["Kode Tagihan", "Kamar", "Periode", "Jatuh Tempo", "Pokok", "Denda", "Total Tagihan", "Status", "Aksi"]}>
            {items.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{t.kode_tagihan}</td>
                <td className="px-4 py-3">Kamar {t.kontrak_sewa?.kamar?.nomor_kamar || "—"}</td>
                <td className="px-4 py-3 text-xs">
                  {formatTanggal(t.periode_mulai)} - {formatTanggal(t.periode_selesai)}
                </td>
                <td className="px-4 py-3 text-xs">{formatTanggal(t.tanggal_jatuh_tempo)}</td>
                <td className="px-4 py-3">{formatRupiah(t.nominal_pokok)}</td>
                <td className="px-4 py-3 text-red-600">{Number(t.denda) > 0 ? formatRupiah(t.denda) : "—"}</td>
                <td className="px-4 py-3 font-bold text-green-700">{formatRupiah(t.jumlah_tagihan)}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status_tagihan} /></td>
                <td className="px-4 py-3">
                  {["belum_bayar", "sebagian"].includes(t.status_tagihan) && (
                    <ButtonLink onClick={() => navigate(`/penyewa/pembayaran/create/${t.id}`)}>
                      {Icons.money} Bayar
                    </ButtonLink>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLaporan } from "../../../_sevices/laporan";
import { imageStorage } from "../../../_api";
import { ButtonLink, Card, EmptyState, Icons, Loading, PageHeader, StatusBadge, Table, formatTanggal } from "../../../components/ui";

export default function PenyewaLaporan() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLaporan()
      .then((res) => setItems(res || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Laporan Keluhan & Kerusakan" subtitle="Laporkan kerusakan fasilitas kamar atau fasilitas umum kos">
        <ButtonLink onClick={() => navigate("/penyewa/laporan/create")}>
          {Icons.plus} Buat Laporan Baru
        </ButtonLink>
      </PageHeader>

      <Card>
        {items.length === 0 ? (
          <EmptyState text="Belum ada laporan keluhan yang Anda buat" />
        ) : (
          <Table headers={["Kode", "Lokasi", "Judul & Deskripsi", "Foto", "Status", "Tanggapan Admin", "Tanggal Selesai"]}>
            {items.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{l.kode_laporan}</td>
                <td className="px-4 py-3">{l.kamar ? `Kamar ${l.kamar.nomor_kamar}` : "Fasilitas Umum"}</td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="font-semibold text-gray-900">{l.judul}</p>
                  <p className="text-xs text-gray-500">{l.deskripsi}</p>
                </td>
                <td className="px-4 py-3">
                  {l.foto ? (
                    <a href={imageStorage(l.foto)} target="_blank" rel="noreferrer" className="text-xs text-green-700 hover:underline">
                      Lihat Foto
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                <td className="px-4 py-3 text-xs">{l.catatan_admin || "—"}</td>
                <td className="px-4 py-3 text-xs">{formatTanggal(l.tanggal_selesai, true)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

import { useEffect, useState } from "react";
import { getPengumuman } from "../../../_sevices/pengumuman";
import { Card, EmptyState, Loading, PageHeader, formatTanggal } from "../../../components/ui";

export default function PenyewaPengumuman() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPengumuman()
      .then((res) => setItems((res || []).filter((p) => p.status === "terbit")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Papan Pengumuman Kos" subtitle="Informasi resmi dari pengelola kos" />
      {items.length === 0 ? (
        <Card><EmptyState text="Belum ada pengumuman aktif" /></Card>
      ) : (
        <div className="space-y-4">
          {items.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-100 pb-3 mb-3">
                <h3 className="text-base font-bold text-gray-900">{p.judul}</h3>
                <span className="text-xs text-gray-400">
                  Diterbitkan: {formatTanggal(p.tanggal_publikasi)}
                  {p.tanggal_berakhir ? ` • Berlaku s/d ${formatTanggal(p.tanggal_berakhir)}` : ""}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line">{p.isi}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

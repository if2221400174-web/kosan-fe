import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteKontrakSewa, getKontrakSewa, updateKontrakSewa } from "../../../_sevices/kontrakSewa";
import { isAdministrator } from "../../../_sevices/auth";
import {
  ButtonLink,
  Card,
  EmptyState,
  IconButton,
  Icons,
  Loading,
  PageHeader,
  SearchInput,
  StatusBadge,
  Table,
  formatRupiah,
  formatTanggal,
  getErrorMessage,
} from "../../../components/ui";

export default function AdminKontrakSewa() {
  const navigate = useNavigate();
  const canDelete = isAdministrator();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getKontrakSewa();
      setItems(res || []);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memuat kontrak sewa"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, kode) => {
    if (!window.confirm(`Hapus kontrak "${kode}"?`)) return;
    try {
      await deleteKontrakSewa(id);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menghapus kontrak"));
    }
  };

  const handleConfirmBooking = async (k) => {
    if (
      !window.confirm(
        `Setujui & konfirmasi booking "${k.kode_kontrak}" untuk ${
          k.penyewa?.user?.nama || "Penyewa"
        } di Kamar ${k.kamar?.nomor_kamar}?`
      )
    )
      return;
    try {
      await updateKontrakSewa(k.id, {
        penyewa_id: k.penyewa_id,
        kamar_id: k.kamar_id,
        tanggal_mulai: String(k.tanggal_mulai).substring(0, 10),
        tanggal_selesai: String(k.tanggal_selesai).substring(0, 10),
        tipe_sewa: k.tipe_sewa,
        harga_sewa: k.harga_sewa,
        status_kontrak: "aktif",
        catatan: k.catatan,
      });
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal mengonfirmasi booking"));
    }
  };

  const filtered = items.filter((k) =>
    [k.kode_kontrak, k.penyewa?.user?.nama, k.kamar?.nomor_kamar, k.status_kontrak].some((v) =>
      String(v || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Kontrak Sewa" subtitle="Riwayat dan kesepakatan penyewaan kamar kos">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari kode, penyewa, kamar..." />
        <ButtonLink onClick={() => navigate("/admin/kontrak-sewa/create")}>
          {Icons.plus} Buat Kontrak
        </ButtonLink>
      </PageHeader>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState text="Belum ada kontrak sewa" />
        ) : (
          <Table headers={["Kode Kontrak", "Penyewa", "Kamar", "Periode Sewa", "Tipe", "Harga Kesepakatan", "Status", "Aksi"]}>
            {filtered.map((k) => (
              <tr key={k.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-800">{k.kode_kontrak}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{k.penyewa?.user?.nama || "—"}</td>
                <td className="px-4 py-3">Kamar {k.kamar?.nomor_kamar || "—"}</td>
                <td className="px-4 py-3 text-xs">
                  {formatTanggal(k.tanggal_mulai)} s/d {formatTanggal(k.tanggal_selesai)}
                </td>
                <td className="px-4 py-3 capitalize">{k.tipe_sewa}</td>
                <td className="px-4 py-3 font-semibold text-green-700">{formatRupiah(k.harga_sewa)}</td>
                <td className="px-4 py-3"><StatusBadge status={k.status_kontrak} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {k.status_kontrak === "menunggu" && (
                      <button
                        type="button"
                        onClick={() => handleConfirmBooking(k)}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-[#264624] hover:bg-[#3b6e38] rounded-lg cursor-pointer"
                        title="Konfirmasi Booking"
                      >
                        ✓ Konfirmasi
                      </button>
                    )}
                    {k.penyewa?.user_id && (
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/chat?user=${k.penyewa.user_id}`)}
                        className="px-2.5 py-1 text-xs font-bold text-[#264624] bg-[#e2f0d9] hover:bg-[#cfe5c2] rounded-lg cursor-pointer"
                        title="Chat Penyewa"
                      >
                        💬 Chat
                      </button>
                    )}
                    <IconButton color="blue" title="Edit" onClick={() => navigate(`/admin/kontrak-sewa/edit/${k.id}`)}>
                      {Icons.edit}
                    </IconButton>
                    {canDelete && (
                      <IconButton color="red" title="Hapus" onClick={() => handleDelete(k.id, k.kode_kontrak)}>
                        {Icons.trash}
                      </IconButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

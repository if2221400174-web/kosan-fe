import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteTagihan, getTagihan } from "../../../_sevices/tagihan";
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

export default function AdminTagihan() {
  const navigate = useNavigate();
  const canDelete = isAdministrator();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getTagihan();
      setItems(res || []);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memuat tagihan"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, kode) => {
    if (!window.confirm(`Hapus tagihan "${kode}"?`)) return;
    try {
      await deleteTagihan(id);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menghapus tagihan"));
    }
  };

  const filtered = items.filter((t) =>
    [
      t.kode_tagihan,
      t.kontrak_sewa?.penyewa?.user?.nama,
      t.kontrak_sewa?.kamar?.nomor_kamar,
      t.status_tagihan,
    ].some((v) => String(v || "").toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="Data Tagihan (Invoice)" subtitle="Kewajiban pembayaran sewa per periode kontrak">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari kode, penyewa, kamar..." />
        <ButtonLink onClick={() => navigate("/admin/tagihan/create")}>
          {Icons.plus} Terbitkan Tagihan
        </ButtonLink>
      </PageHeader>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState text="Belum ada data tagihan" />
        ) : (
          <Table headers={["Kode Tagihan", "Penyewa & Kamar", "Periode Tagihan", "Jatuh Tempo", "Pokok", "Denda", "Total Tagihan", "Status", "Aksi"]}>
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-800">{t.kode_tagihan}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{t.kontrak_sewa?.penyewa?.user?.nama || "—"}</p>
                  <p className="text-xs text-gray-500">Kamar {t.kontrak_sewa?.kamar?.nomor_kamar || "—"}</p>
                </td>
                <td className="px-4 py-3 text-xs">
                  {formatTanggal(t.periode_mulai)} - {formatTanggal(t.periode_selesai)}
                </td>
                <td className="px-4 py-3 text-xs">{formatTanggal(t.tanggal_jatuh_tempo)}</td>
                <td className="px-4 py-3">{formatRupiah(t.nominal_pokok)}</td>
                <td className="px-4 py-3 text-red-600">{Number(t.denda) > 0 ? formatRupiah(t.denda) : "—"}</td>
                <td className="px-4 py-3 font-bold text-green-700">{formatRupiah(t.jumlah_tagihan)}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status_tagihan} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <IconButton color="blue" title="Edit" onClick={() => navigate(`/admin/tagihan/edit/${t.id}`)}>
                      {Icons.edit}
                    </IconButton>
                    {canDelete && (
                      <IconButton color="red" title="Hapus" onClick={() => handleDelete(t.id, t.kode_tagihan)}>
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

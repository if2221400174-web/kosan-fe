import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Format Rupiah
const formatRupiah = (angka) => "Rp " + Number(angka || 0).toLocaleString("id-ID");

const formatTanggal = (tgl) =>
  tgl
    ? new Date(tgl).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

// Helper untuk filter data berdasarkan periode
// dateField: nama kolom tanggal yang dipakai (tanggal_bayar / tanggal_pengeluaran)
export const filterDataByPeriod = (data, periodType, month, year, dateField = "tanggal_bayar") => {
  return data.filter((t) => {
    const tDate = new Date(t[dateField] || t.created_at);
    if (periodType === "tahunan") {
      return tDate.getFullYear() === parseInt(year);
    }
    if (periodType === "bulanan") {
      return (
        tDate.getFullYear() === parseInt(year) &&
        tDate.getMonth() + 1 === parseInt(month)
      );
    }
    return true; // "semua"
  });
};

const HEADERS = ["No", "Tanggal Bayar", "Kode", "Penyewa", "Kamar", "Periode", "Metode", "Jumlah"];

// Prepare Data untuk Export (Tabel Pembayaran)
const prepareTableData = (data) => {
  return data.map((p, index) => {
    const kontrak = p.tagihan?.kontrak_sewa;
    return [
      index + 1,
      formatTanggal(p.tanggal_bayar),
      p.kode_pembayaran,
      kontrak?.penyewa?.user?.nama ?? "—",
      kontrak?.kamar?.nomor_kamar ?? "—",
      `${formatTanggal(p.tagihan?.periode_mulai)} - ${formatTanggal(p.tagihan?.periode_selesai)}`,
      (p.metode_pembayaran || "").toUpperCase(),
      formatRupiah(p.jumlah_bayar),
    ];
  });
};

// Export ke PDF
export const exportToPDF = (data, fileName, namaKos = "Sistem Manajemen Kosan") => {
  try {
    const doc = new jsPDF({ orientation: "landscape" });
    const total = data.reduce((s, p) => s + Number(p.jumlah_bayar || 0), 0);

    // Header
    doc.setFontSize(16);
    doc.text("Laporan Pemasukan Pembayaran Sewa", 14, 15);
    doc.setFontSize(10);
    doc.text(namaKos, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [HEADERS],
      body: prepareTableData(data),
      foot: [["", "", "", "", "", "", "TOTAL", formatRupiah(total)]],
      theme: "grid",
      headStyles: { fillColor: [21, 128, 61] },
      footStyles: { fillColor: [240, 253, 244], textColor: [20, 83, 45] },
    });

    doc.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("Gagal export PDF:", error);
    alert("Terjadi kesalahan saat membuat file PDF. Cek console browser.");
  }
};

// Export ke Excel
export const exportToExcel = (data, fileName) => {
  try {
    const tableData = prepareTableData(data);
    const total = data.reduce((s, p) => s + Number(p.jumlah_bayar || 0), 0);

    const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...tableData, ["", "", "", "", "", "", "TOTAL", formatRupiah(total)]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pemasukan");

    XLSX.writeFile(wb, `${fileName}.xlsx`);
  } catch (error) {
    console.error("Gagal export Excel:", error);
    alert("Terjadi kesalahan saat membuat file Excel. Cek console browser.");
  }
};

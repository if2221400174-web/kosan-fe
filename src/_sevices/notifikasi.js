import { getKontrakSewa } from "./kontrakSewa";
import { getTagihan } from "./tagihan";
import { getPembayaran } from "./pembayaran";
import { getLaporan } from "./laporan";
import { getPengeluaran } from "./pengeluaran";
import { getChat } from "./chat";
import { formatRupiah, formatTanggal } from "../components/ui";

const diffDays = (targetDate) => {
  if (!targetDate) return 999;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
};

// Menghasilkan daftar notifikasi pintar sesuai Role (penyewa, admin, administrator)
// serta Log Aktivitas Lintas Role untuk Administrator
export const fetchSmartNotifications = async (role) => {
  const isPengelola = role === "admin" || role === "administrator";

  const [kontrak, tagihan, pembayaran, laporan, chatData, pengeluaran] =
    await Promise.all([
      getKontrakSewa().catch(() => []),
      getTagihan().catch(() => []),
      getPembayaran().catch(() => []),
      getLaporan().catch(() => []),
      getChat().catch(() => ({})),
      isPengelola ? getPengeluaran().catch(() => []) : Promise.resolve([]),
    ]);

  const notifications = [];
  const activities = [];

  if (role === "penyewa") {
    // 1. Notifikasi waktu sewa akan habis / sudah jatuh tempo
    (kontrak || []).forEach((k) => {
      if (k.status_kontrak === "aktif") {
        const sisaHari = diffDays(k.tanggal_selesai);
        if (sisaHari <= 14) {
          notifications.push({
            id: `sewa-exp-${k.id}`,
            type: sisaHari < 0 ? "danger" : "warning",
            title:
              sisaHari < 0
                ? `Masa Sewa Kamar ${k.kamar?.nomor_kamar} Telah Habis!`
                : `Pengingat: Masa Sewa Kamar ${k.kamar?.nomor_kamar} Sisa ${sisaHari} Hari`,
            desc: `Kontrak sewa (${k.kode_kontrak}) berakhir pada ${formatTanggal(
              k.tanggal_selesai
            )}. Hubungi admin jika ingin memperpanjang sewa.`,
            to: "/penyewa/kontrak-sewa",
            time: k.tanggal_selesai,
          });
        }
      } else if (k.status_kontrak === "menunggu") {
        notifications.push({
          id: `booking-wait-${k.id}`,
          type: "info",
          title: `Booking Kamar ${k.kamar?.nomor_kamar} Menunggu Konfirmasi Admin`,
          desc: `Pengajuan booking (${k.kode_kontrak}) sedang diperiksa oleh pengelola kos.`,
          to: "/penyewa/kontrak-sewa",
          time: k.created_at,
        });
      }
    });

    // 2. Tagihan belum lunas
    (tagihan || [])
      .filter((t) => ["belum_bayar", "sebagian"].includes(t.status_tagihan))
      .forEach((t) => {
        const sisa = diffDays(t.tanggal_jatuh_tempo);
        notifications.push({
          id: `inv-${t.id}`,
          type: sisa <= 3 ? "danger" : "warning",
          title: `Tagihan ${t.kode_tagihan} Belum Lunas (${formatRupiah(
            t.jumlah_tagihan
          )})`,
          desc: `Jatuh tempo pada ${formatTanggal(t.tanggal_jatuh_tempo)}. Segera lakukan pembayaran.`,
          to: `/penyewa/pembayaran/create/${t.id}`,
          time: t.tanggal_jatuh_tempo,
        });
      });

    // 3. Status laporan keluhan yang sudah ditanggapi admin
    (laporan || [])
      .filter((l) => ["diproses", "selesai"].includes(l.status))
      .slice(0, 3)
      .forEach((l) => {
        notifications.push({
          id: `lap-${l.id}`,
          type: "success",
          title: `Laporan "${l.judul}" Berstatus: ${l.status.toUpperCase()}`,
          desc: l.catatan_admin || "Ditangani oleh petugas kos.",
          to: "/penyewa/laporan",
          time: l.updated_at,
        });
      });
  } else {
    // ====== NOTIFIKASI UNTUK ADMIN & ADMINISTRATOR ======
    // 1. Calon penyewa yang butuh konfirmasi booking
    (kontrak || [])
      .filter((k) => k.status_kontrak === "menunggu")
      .forEach((k) => {
        notifications.push({
          id: `adm-booking-${k.id}`,
          type: "warning",
          title: `Booking Baru Butuh Konfirmasi: Kamar ${k.kamar?.nomor_kamar}`,
          desc: `Calon penyewa ${
            k.penyewa?.user?.nama || "Baru"
          } mengajukan booking (${k.kode_kontrak}).`,
          to: "/admin/kontrak-sewa",
          time: k.created_at,
        });
      });

    // 2. Pembayaran yang butuh verifikasi
    (pembayaran || [])
      .filter((p) => p.status_pembayaran === "menunggu_verifikasi")
      .forEach((p) => {
        notifications.push({
          id: `adm-pay-${p.id}`,
          type: "info",
          title: `Verifikasi Pembayaran ${p.kode_pembayaran} (${p.metode_pembayaran?.toUpperCase()})`,
          desc: `${
            p.tagihan?.kontrak_sewa?.penyewa?.user?.nama || "Penyewa"
          } mengirim pembayaran sebesar ${formatRupiah(p.jumlah_bayar)}.`,
          to: "/admin/pembayaran",
          time: p.tanggal_bayar || p.created_at,
        });
      });

    // 3. Laporan kerusakan baru dari penyewa
    (laporan || [])
      .filter((l) => l.status === "menunggu")
      .forEach((l) => {
        notifications.push({
          id: `adm-lap-${l.id}`,
          type: "danger",
          title: `Laporan Keluhan Baru: ${l.judul}`,
          desc: `Dari ${l.penyewa?.user?.nama || "Penyewa"} (Kamar ${
            l.kamar?.nomor_kamar || "-"
          }). Segera tindak lanjuti.`,
          to: "/admin/laporan",
          time: l.created_at,
        });
      });

    // 4. Pengingat penyewa yang sudah mendekati / habis waktu sewa (<= 14 hari)
    (kontrak || [])
      .filter((k) => k.status_kontrak === "aktif")
      .forEach((k) => {
        const sisaHari = diffDays(k.tanggal_selesai);
        if (sisaHari <= 14) {
          notifications.push({
            id: `adm-exp-${k.id}`,
            type: sisaHari < 0 ? "danger" : "warning",
            title:
              sisaHari < 0
                ? `Waktu Sewa Habis: ${k.penyewa?.user?.nama} (Kamar ${k.kamar?.nomor_kamar})`
                : `Pengingat Kontrak: ${k.penyewa?.user?.nama} Sisa ${sisaHari} Hari`,
            desc: `Kontrak ${k.kode_kontrak} berakhir pada ${formatTanggal(
              k.tanggal_selesai
            )}.`,
            to: "/admin/kontrak-sewa",
            time: k.tanggal_selesai,
          });
        }
      });

    // 5. Pesan chat belum dibaca dari calon penyewa / penyewa
    const unreadThreads = (chatData?.threads || []).filter(
      (t) => t.unread_count > 0
    );
    unreadThreads.forEach((t) => {
      notifications.push({
        id: `adm-chat-${t.user_id}`,
        type: "info",
        title: `${t.unread_count} Pesan Baru dari ${t.nama}`,
        desc: t.last_message || "Membuka percakapan di ruang chat.",
        to: `/admin/chat?user=${t.user_id}`,
        time: t.last_time,
      });
    });

    // ====== LOG AKTIVITAS LINTAS ROLE (KHUSUS ADMINISTRATOR & ADMIN) ======
    // Merangkum aktivitas Penyewa & Admin/Administrator
    (kontrak || []).slice(0, 8).forEach((k) => {
      activities.push({
        id: `act-ktr-${k.id}`,
        actorRole: k.status_kontrak === "menunggu" ? "penyewa" : "admin",
        actorName: k.penyewa?.user?.nama || "Penyewa",
        action:
          k.status_kontrak === "menunggu"
            ? `Mengajukan booking Kamar ${k.kamar?.nomor_kamar} (${k.kode_kontrak})`
            : `Kontrak Kamar ${k.kamar?.nomor_kamar} berstatus ${k.status_kontrak.toUpperCase()}`,
        time: k.updated_at || k.created_at,
        badge: k.status_kontrak,
      });
    });

    (pembayaran || []).slice(0, 8).forEach((p) => {
      const verified = p.status_pembayaran !== "menunggu_verifikasi";
      activities.push({
        id: `act-pay-${p.id}`,
        actorRole: verified
          ? p.verifikator?.role || "admin"
          : "penyewa",
        actorName: verified
          ? p.verifikator?.nama || "Admin Pengelola"
          : p.tagihan?.kontrak_sewa?.penyewa?.user?.nama || "Penyewa",
        action: verified
          ? `Memverifikasi pembayaran ${p.kode_pembayaran} (${formatRupiah(
              p.jumlah_bayar
            )}) -> ${p.status_pembayaran.toUpperCase()}`
          : `Mengirim pembayaran ${p.metode_pembayaran?.toUpperCase()} sebesar ${formatRupiah(
              p.jumlah_bayar
            )} (${p.kode_pembayaran})`,
        time: p.tanggal_verifikasi || p.tanggal_bayar || p.created_at,
        badge: p.status_pembayaran,
      });
    });

    (laporan || []).slice(0, 6).forEach((l) => {
      const handled = l.status !== "menunggu" && l.petugas;
      activities.push({
        id: `act-lap-${l.id}`,
        actorRole: handled ? l.petugas?.role || "admin" : "penyewa",
        actorName: handled
          ? l.petugas?.nama || "Admin Pengelola"
          : l.penyewa?.user?.nama || "Penyewa",
        action: handled
          ? `Menangani laporan keluhan "${l.judul}" -> ${l.status.toUpperCase()}`
          : `Membuat laporan keluhan fasilitas: "${l.judul}"`,
        time: l.updated_at || l.created_at,
        badge: l.status,
      });
    });

    (pengeluaran || []).slice(0, 5).forEach((e) => {
      activities.push({
        id: `act-exp-${e.id}`,
        actorRole: e.pencatat?.role || "admin",
        actorName: e.pencatat?.nama || "Admin Pengelola",
        action: `Mencatat pengeluaran operasional "${
          e.judul
        }" sebesar ${formatRupiah(e.jumlah)}`,
        time: e.created_at || e.tanggal_pengeluaran,
        badge: "aktif",
      });
    });

    activities.sort(
      (a, b) => new Date(b.time || 0) - new Date(a.time || 0)
    );
  }

  return {
    notifications,
    activities,
  };
};

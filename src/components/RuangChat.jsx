import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getChat, sendChat } from "../_sevices/chat";
import { getUserInfo } from "../_sevices/auth";
import { formatTanggal } from "./ui";

export default function RuangChat() {
  const user = getUserInfo();
  const isPengelola = user?.role === "admin" || user?.role === "administrator";
  const [searchParams] = useSearchParams();
  const initialTargetUser = searchParams.get("user");

  const [threads, setThreads] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(
    initialTargetUser ? Number(initialTargetUser) : null
  );
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [searchThread, setSearchThread] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadChat = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await getChat(isPengelola ? selectedUserId : null);
        if (isPengelola) {
          setThreads(res.threads || []);
          if (!selectedUserId && res.selected_user_id) {
            setSelectedUserId(res.selected_user_id);
          }
        }
        setMessages(res.messages || []);
      } catch (err) {
        console.log(err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [isPengelola, selectedUserId]
  );

  useEffect(() => {
    loadChat(false);
    const interval = setInterval(() => loadChat(true), 4000);
    return () => clearInterval(interval);
  }, [loadChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e, customMessage = null) => {
    if (e) e.preventDefault();
    const content = (customMessage ?? text).trim();
    if (!content) return;
    if (isPengelola && !selectedUserId) return;

    setSending(true);
    try {
      await sendChat({
        penyewa_user_id: isPengelola ? selectedUserId : user?.id,
        isi_pesan: content,
      });
      if (!customMessage) setText("");
      await loadChat(true);
    } catch (err) {
      console.log(err);
    } finally {
      setSending(false);
    }
  };

  const activeThread = threads.find((t) => t.user_id === selectedUserId);
  const filteredThreads = threads.filter((t) =>
    [t.nama, t.email, t.nomor_telepon].some((v) =>
      String(v || "").toLowerCase().includes(searchThread.toLowerCase())
    )
  );

  const quickChips = isPengelola
    ? [
        "Halo, pengajuan booking kamar Anda sudah kami konfirmasi ya!",
        "Pembayaran sewa Anda sudah kami terima dan verifikasi. Terima kasih!",
        "Silakan lengkapi bukti pembayaran pada menu Tagihan & Pembayaran.",
      ]
    : [
        "Halo Admin, saya ingin menanyakan ketersediaan kamar kos.",
        "Halo Admin, saya sudah mengajukan booking kamar, mohon dikonfirmasi.",
        "Apakah saya bisa melakukan pembayaran secara Cash / Tunai saat check-in?",
      ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-175px)] min-h-[520px]">
        {/* Sisi Kiri: Daftar Percakapan (Khusus Admin & Administrator) */}
        {isPengelola && (
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col bg-[#f8faf6]">
            <div className="p-4 bg-[#264624] text-white">
              <h3 className="text-sm font-bold tracking-wide">
                Daftar Chat Penghuni & Calon Penyewa
              </h3>
              <div className="mt-2.5 relative">
                <input
                  type="text"
                  value={searchThread}
                  onChange={(e) => setSearchThread(e.target.value)}
                  placeholder="Cari nama / email penyewa..."
                  className="w-full pl-3 pr-8 py-1.5 text-xs bg-white text-gray-800 rounded-full focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-48 lg:max-h-none">
              {filteredThreads.length === 0 ? (
                <p className="p-6 text-xs text-center text-gray-400">
                  Belum ada calon penyewa terdaftar
                </p>
              ) : (
                filteredThreads.map((t) => {
                  const active = t.user_id === selectedUserId;
                  return (
                    <button
                      key={t.user_id}
                      type="button"
                      onClick={() => setSelectedUserId(t.user_id)}
                      className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                        active
                          ? "bg-[#e3eed9] border-l-4 border-[#264624]"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#264624] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {t.nama?.charAt(0)?.toUpperCase() || "P"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                            {t.nama}
                          </p>
                          {t.unread_count > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                              {t.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">
                          {t.last_message || t.email}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Sisi Kanan: Area Percakapan Aktif */}
        <div className="flex-1 flex flex-col bg-[#f4f7f1]">
          {/* Header Ruang Chat */}
          <div className="px-5 py-3.5 bg-[#264624] text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white text-[#264624] font-extrabold text-sm flex items-center justify-center">
                {isPengelola
                  ? activeThread?.nama?.charAt(0)?.toUpperCase() || "P"
                  : "A"}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold leading-tight">
                  {isPengelola
                    ? activeThread?.nama || "Pilih Calon Penyewa / Penghuni"
                    : "Ruang Chat Admin & Pengelola Kos"}
                </h3>
                <p className="text-[11px] text-green-100/85">
                  {isPengelola
                    ? activeThread
                      ? `${activeThread.email} • WA: ${activeThread.nomor_telepon || "-"}`
                      : "Pilih salah satu penyewa di sebelah kiri"
                    : "Tanyakan ketersediaan kamar, konfirmasi booking, atau pembayaran"}
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              Aktif
            </span>
          </div>

          {/* Daftar Pesan */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {loading ? (
              <p className="text-center text-xs text-gray-500 py-10">
                Memuat percakapan...
              </p>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <p className="text-sm font-semibold text-gray-600">
                  Belum ada pesan percakapan
                </p>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Gunakan tombol pesan cepat di bawah atau ketik pesan Anda untuk mulai berdiskusi mengenai booking dan sewa kamar.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isMine = Number(m.pengirim_id) === Number(user?.id);
                return (
                  <div
                    key={m.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-xs ${
                        isMine
                          ? "bg-[#264624] text-white rounded-br-xs"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span
                          className={`text-[11px] font-bold ${
                            isMine ? "text-green-200" : "text-[#264624]"
                          }`}
                        >
                          {m.pengirim?.nama || "Pengguna"}{" "}
                          {m.pengirim?.role && m.pengirim.role !== "penyewa"
                            ? `(${m.pengirim.role})`
                            : ""}
                        </span>
                        <span
                          className={`text-[10px] ${
                            isMine ? "text-green-100/75" : "text-gray-400"
                          }`}
                        >
                          {formatTanggal(m.created_at, true)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                        {m.isi_pesan}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Chips */}
          <div className="px-4 py-2 bg-white/80 border-t border-gray-200 flex items-center gap-2 overflow-x-auto scrollbar-thin">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(null, chip)}
                className="px-3 py-1 rounded-full bg-[#e9f2e1] hover:bg-[#d6e6c8] text-[#264624] text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
              >
                + {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 bg-white border-t border-gray-200 flex items-center gap-2.5"
          >
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ketik pesan Anda di sini..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3b6e38]"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="px-5 py-2.5 rounded-full bg-[#264624] hover:bg-[#3b6e38] text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {sending ? "Mengirim..." : "Kirim"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

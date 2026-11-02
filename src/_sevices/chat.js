import API from "../_api";

export const getChat = async (penyewaUserId = null) => {
  const params = penyewaUserId ? { penyewa_user_id: penyewaUserId } : {};
  const { data } = await API.get("/chat", { params });
  return data;
};

export const sendChat = async ({ penyewa_user_id, isi_pesan }) => {
  const { data } = await API.post("/chat", { penyewa_user_id, isi_pesan });
  return data.data;
};

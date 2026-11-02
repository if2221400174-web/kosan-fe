import API, { toFormData } from "../_api"

export const getPembayaran = async () => {
  const { data } = await API.get("/pembayaran")
  return data.data || []
}

export const showPembayaran = async (id) => {
  const { data } = await API.get(`/pembayaran/${id}`)
  return data.data
}

// dipakai penyewa / admin untuk mencatat pembayaran (ada upload bukti_bayar)
export const createPembayaran = async (payload) => {
  try {
    const response = await API.post("/pembayaran", toFormData(payload))
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

// verifikasi oleh pengelola: { status_pembayaran, catatan_verifikasi }
export const verifikasiPembayaran = async (id, payload) => {
  try {
    const response = await API.put(`/pembayaran/${id}`, payload)
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const deletePembayaran = async (id) => {
  try {
    await API.delete(`/pembayaran/${id}`)
  } catch (error) {
    console.log(error);
    throw error
  }
}

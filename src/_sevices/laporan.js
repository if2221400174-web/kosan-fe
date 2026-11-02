import API, { toFormData } from "../_api"

export const getLaporan = async () => {
  const { data } = await API.get("/laporan")
  return data.data || []
}

export const showLaporan = async (id) => {
  const { data } = await API.get(`/laporan/${id}`)
  return data.data
}

// dipakai penyewa untuk mengirim keluhan (ada upload foto)
export const createLaporan = async (payload) => {
  try {
    const response = await API.post("/laporan", toFormData(payload))
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

// tindak lanjut pengelola: { status, catatan_admin }
export const updateLaporan = async (id, payload) => {
  try {
    const response = await API.put(`/laporan/${id}`, payload)
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const deleteLaporan = async (id) => {
  try {
    await API.delete(`/laporan/${id}`)
  } catch (error) {
    console.log(error);
    throw error
  }
}

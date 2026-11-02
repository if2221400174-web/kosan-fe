import API, { toFormData } from "../_api"

export const getKamar = async () => {
  const { data } = await API.get("/kamar")
  return data.data || []
}

export const showKamar = async (id) => {
  const { data } = await API.get(`/kamar/${id}`)
  return data.data
}

// payload: { nomor_kamar, tipe_kamar, ..., foto_utama(File), fasilitas_ids: [] }
export const createKamar = async (payload) => {
  try {
    const response = await API.post("/kamar", toFormData(payload))
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const updateKamar = async (id, payload) => {
  try {
    const response = await API.post(`/kamar/${id}`, toFormData({ ...payload, _method: "PUT" }))
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const deleteKamar = async (id) => {
  try {
    await API.delete(`/kamar/${id}`)
  } catch (error) {
    console.log(error);
    throw error
  }
}

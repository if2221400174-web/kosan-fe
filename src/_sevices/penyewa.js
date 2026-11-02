import API, { toFormData } from "../_api"

export const getPenyewa = async () => {
  const { data } = await API.get("/penyewa")
  return data.data || []
}

export const showPenyewa = async (id) => {
  const { data } = await API.get(`/penyewa/${id}`)
  return data.data
}

// payload berupa object biasa, otomatis diubah ke FormData (karena ada foto_ktp)
export const createPenyewa = async (payload) => {
  try {
    const response = await API.post("/penyewa", toFormData(payload))
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const updatePenyewa = async (id, payload) => {
  try {
    const response = await API.post(`/penyewa/${id}`, toFormData({ ...payload, _method: "PUT" }))
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const deletePenyewa = async (id) => {
  try {
    await API.delete(`/penyewa/${id}`)
  } catch (error) {
    console.log(error);
    throw error
  }
}

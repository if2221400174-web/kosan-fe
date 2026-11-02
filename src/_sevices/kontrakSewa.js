import API, { toFormData } from "../_api"

export const getKontrakSewa = async () => {
  const { data } = await API.get("/kontrak-sewa")
  return data.data || []
}

export const showKontrakSewa = async (id) => {
  const { data } = await API.get(`/kontrak-sewa/${id}`)
  return data.data
}

export const createKontrakSewa = async (payload) => {
  try {
    const response = await API.post("/kontrak-sewa", toFormData(payload))
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const updateKontrakSewa = async (id, payload) => {
  try {
    const response = await API.put(`/kontrak-sewa/${id}`, payload)
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const deleteKontrakSewa = async (id) => {
  try {
    await API.delete(`/kontrak-sewa/${id}`)
  } catch (error) {
    console.log(error);
    throw error
  }
}

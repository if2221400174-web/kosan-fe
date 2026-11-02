import API, { toFormData } from "../_api"

export const getPengeluaran = async () => {
  const { data } = await API.get("/pengeluaran")
  return data.data || []
}

export const showPengeluaran = async (id) => {
  const { data } = await API.get(`/pengeluaran/${id}`)
  return data.data
}

export const createPengeluaran = async (payload) => {
  try {
    const response = await API.post("/pengeluaran", toFormData(payload))
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const updatePengeluaran = async (id, payload) => {
  try {
    const response = await API.post(`/pengeluaran/${id}`, toFormData({ ...payload, _method: "PUT" }))
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const deletePengeluaran = async (id) => {
  try {
    await API.delete(`/pengeluaran/${id}`)
  } catch (error) {
    console.log(error);
    throw error
  }
}

import API, { toFormData } from "../_api"

// kamarId opsional: filter foto berdasarkan kamar
export const getGaleri = async (kamarId) => {
  const { data } = await API.get("/galeri", { params: kamarId ? { kamar_id: kamarId } : {} })
  return data.data || []
}

export const createGaleri = async (payload) => {
  try {
    const response = await API.post("/galeri", toFormData(payload))
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const updateGaleri = async (id, payload) => {
  try {
    const response = await API.post(`/galeri/${id}`, toFormData({ ...payload, _method: "PUT" }))
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const deleteGaleri = async (id) => {
  try {
    await API.delete(`/galeri/${id}`)
  } catch (error) {
    console.log(error);
    throw error
  }
}

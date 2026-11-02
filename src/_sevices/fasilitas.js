import API from "../_api"

export const getFasilitas = async () => {
  const { data } = await API.get("/fasilitas")
  return data.data || []
}

export const showFasilitas = async (id) => {
  const { data } = await API.get(`/fasilitas/${id}`)
  return data.data
}

export const createFasilitas = async (payload) => {
  try {
    const response = await API.post("/fasilitas", payload)
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const updateFasilitas = async (id, payload) => {
  try {
    const response = await API.put(`/fasilitas/${id}`, payload)
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const deleteFasilitas = async (id) => {
  try {
    await API.delete(`/fasilitas/${id}`)
  } catch (error) {
    console.log(error);
    throw error
  }
}

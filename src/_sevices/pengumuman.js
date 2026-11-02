import API from "../_api"

export const getPengumuman = async () => {
  const { data } = await API.get("/pengumuman")
  return data.data || []
}

export const showPengumuman = async (id) => {
  const { data } = await API.get(`/pengumuman/${id}`)
  return data.data
}

export const createPengumuman = async (payload) => {
  try {
    const response = await API.post("/pengumuman", payload)
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const updatePengumuman = async (id, payload) => {
  try {
    const response = await API.put(`/pengumuman/${id}`, payload)
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const deletePengumuman = async (id) => {
  try {
    await API.delete(`/pengumuman/${id}`)
  } catch (error) {
    console.log(error);
    throw error
  }
}

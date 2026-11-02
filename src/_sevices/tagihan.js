import API from "../_api"

export const getTagihan = async () => {
  const { data } = await API.get("/tagihan")
  return data.data || []
}

export const showTagihan = async (id) => {
  const { data } = await API.get(`/tagihan/${id}`)
  return data.data
}

export const createTagihan = async (payload) => {
  try {
    const response = await API.post("/tagihan", payload)
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const updateTagihan = async (id, payload) => {
  try {
    const response = await API.put(`/tagihan/${id}`, payload)
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const deleteTagihan = async (id) => {
  try {
    await API.delete(`/tagihan/${id}`)
  } catch (error) {
    console.log(error);
    throw error
  }
}

import API, { toFormData } from "../_api"

// profil kos hanya 1 baris data
export const getProfilKos = async () => {
  const { data } = await API.get("/profil-kos")
  return data.data || null
}

// store di backend otomatis create / update (single row)
export const saveProfilKos = async (payload) => {
  try {
    const response = await API.post("/profil-kos", toFormData(payload))
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

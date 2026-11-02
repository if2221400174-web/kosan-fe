import API from "../_api"

export const getPublicProfilKos = async () => {
  const { data } = await API.get("/public/profil-kos")
  return data.data || null
}

export const getPublicKamar = async () => {
  const { data } = await API.get("/public/kamar")
  return data.data || []
}

export const getPublicFasilitas = async () => {
  const { data } = await API.get("/public/fasilitas")
  return data.data || []
}

export const getPublicGaleri = async () => {
  const { data } = await API.get("/public/galeri")
  return data.data || []
}

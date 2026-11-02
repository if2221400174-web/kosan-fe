import { useJwt } from "react-jwt";
import API, { toFormData } from "../_api"


export const login = async ({email, password}) => {
  try {
    const{data} = await API.post("/login", {email, password})
    return data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const register = async (payload) => {
  try {
    const { data } = await API.post("/register", toFormData(payload));
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const googleAuth = async (payload) => {
  try {
    const { data } = await API.post("/auth/google", payload);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const logout = async (token) => {
  try {
    const { data } = await API.post("/logout", {token});
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
  }
};


// untuk mengecek token
export const useDecodeToken = (token) => {
  const { decodedToken, isExpired } = useJwt(token);

  try {
    if (isExpired) {
    return {
      success: false,
      message: "Token expired",
      data: null,
    };
  }

  return {
    success: true,
    message: "Token valid",
    data: decodedToken,
  };
  } catch (error) {
    return{
      success: false,
      message: error.message,
      data:null
    }
  }
}

// info user yang sedang login (dari localStorage)
export const getUserInfo = () => {
  try {
    const raw = localStorage.getItem("userInfo");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const isAdministrator = () => getUserInfo()?.role === "administrator";
export const isPengelola = () => ["administrator", "admin"].includes(getUserInfo()?.role);

// ====== CRUD USERS (khusus administrator) ======
export const getUser = async() =>{
  const {data} = await API.get("/users")
  return data.data || []
}

export const userCreate = async (data) => {
  try {
    const response = await API.post("/users",data)
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const updateUser = async (id, data) => {
  try {
    const response = await API.put(`/users/${id}`, data)
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}


export const deleteUsers = async (id)=>{
  try {
    await API.delete(`/users/${id}`)
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const showUser = async (id) => {
  try {
    const response = await API.get(`/users/${id}`)
    return response.data
  } catch (error) {
    console.log(error);
    throw error
  }
}

//profile
export const getProfile = async () => {
  try {
    const { data } = await API.get("/profile");
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateProfile = async (payload) => {
  try {
    const { data } = await API.post("/profile/update", payload);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const changePassword = async (payload) => {
  try {
    const { data } = await API.post("/change-password", payload);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

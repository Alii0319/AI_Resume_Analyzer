import { createContext, useState } from "react"

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext()

function AuthProvider({ children }) {

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  )
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken")
  )

  const login = ({ access, refresh }) => {
    localStorage.setItem("accessToken", access)
    localStorage.setItem("refreshToken", refresh)
    setAccessToken(access)
    setRefreshToken(refresh)
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    setAccessToken(null)
    setRefreshToken(null)
  }

  return (
    <AuthContext.Provider value={{
      accessToken,
      refreshToken,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider

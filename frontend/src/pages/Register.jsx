import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { FaEye, FaEyeSlash, FaUserPlus, FaCheckCircle } from "react-icons/fa"

import api from "../services/api"
import { AuthContext } from "../context/AuthContext"

function Register() {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const isMinLength = password.length >= 8
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  // Calculate strength score
  let strengthScore = 0
  if (password.length > 0) {
    if (isMinLength) strengthScore += 1
    if (hasLetter) strengthScore += 1
    if (hasNumber) strengthScore += 1
  }

  // Determine strength label and color class
  let strengthLabel = ""
  let strengthColor = ""
  let barWidth = "0%"
  let barColor = "bg-transparent"

  if (password.length > 0) {
    if (strengthScore <= 1) {
      strengthLabel = "Weak"
      strengthColor = "text-rose-400 font-semibold"
      barWidth = "33%"
      barColor = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
    } else if (strengthScore === 2) {
      strengthLabel = "Medium"
      strengthColor = "text-amber-400 font-semibold"
      barWidth = "66%"
      barColor = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
    } else if (strengthScore === 3) {
      strengthLabel = "Strong"
      strengthColor = "text-emerald-400 font-bold animate-pulse"
      barWidth = "100%"
      barColor = "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_12px_rgba(16,185,129,0.7)] animate-pulse"
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (!hasLetter || !hasNumber) {
      setError("Password must contain both letters and numbers")
      return
    }

    setIsLoading(true)

    try {
      const response = await api.post("/auth/register/", {
        email,
        password
      })

      login({
        access: response.data.access,
        refresh: response.data.refresh
      })

      setSuccess(true)
      setTimeout(() => {
        navigate("/dashboard")
      }, 1500)

    } catch (error) {
      console.log(error)
      let errMsg = "Registration failed. Please try again."
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errMsg = error.response.data
        } else if (error.response.data.error) {
          errMsg = error.response.data.error
        } else if (error.response.data.password) {
          errMsg = Array.isArray(error.response.data.password) 
            ? error.response.data.password[0] 
            : error.response.data.password
        } else if (error.response.data.email) {
          errMsg = Array.isArray(error.response.data.email) 
            ? error.response.data.email[0] 
            : error.response.data.email
        } else {
          errMsg = Object.values(error.response.data).flat().join(" ")
        }
      }
      setError(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <FaCheckCircle className="text-green-400 text-6xl mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-gray-400">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-blue-600/20 to-purple-600/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="mb-8">
            <FaUserPlus className="text-6xl text-green-400 mb-4 animate-pulse" />
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Join AI Resume Analyzer
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Start your journey to better job matches with AI-powered resume optimization
            </p>
          </div>
          <div className="space-y-4 text-gray-400">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Free Account Setup</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Instant Analysis</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Professional Reports</span>
            </div>
          </div>
        </div>
        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-500/10 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-gray-400">Join thousands of professionals</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Password strength suggestion & checklist */}
                {password.length > 0 && (
                  <div className="mt-3 space-y-2.5 p-3.5 bg-slate-900/40 rounded-xl border border-white/10 transition-all duration-300 animate-fadeIn">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">Password Strength:</span>
                      <span className={`${strengthColor} tracking-wide transition-colors duration-300`}>
                        {strengthLabel}
                      </span>
                    </div>
                    {/* Strength Bar */}
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} transition-all duration-500 ease-out`}
                        style={{ width: barWidth }}
                      ></div>
                    </div>
                    {/* Suggestions & Checklist */}
                    <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${isMinLength ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-500"}`}>
                          {isMinLength ? "✓" : "•"}
                        </span>
                        <span className={isMinLength ? "text-emerald-300/90 font-medium" : "text-gray-400/80"}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${hasLetter ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-500"}`}>
                          {hasLetter ? "✓" : "•"}
                        </span>
                        <span className={hasLetter ? "text-emerald-300/90 font-medium" : "text-gray-400/80"}>
                          At least one letter (a-z, A-Z)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${hasNumber ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-500"}`}>
                          {hasNumber ? "✓" : "•"}
                        </span>
                        <span className={hasNumber ? "text-emerald-300/90 font-medium" : "text-gray-400/80"}>
                          At least one number (0-9)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    value={confirmPassword}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <a
                  href="/"
                  className="text-green-400 hover:text-green-300 font-medium transition-colors"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
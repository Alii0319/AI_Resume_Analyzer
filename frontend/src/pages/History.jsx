import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { AuthContext } from "../context/AuthContext"

function History() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const { accessToken } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/analysis/history/')
        setAnalyses(response.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    if (accessToken) fetchHistory()
  }, [accessToken])

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analysis History</h1>
          <p className="text-zinc-400 mt-2">Review every resume analysis you’ve run so far.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center justify-center rounded-3xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Back to Dashboard
        </button>
      </div>
      {analyses.length === 0 ? (
        <p className="text-zinc-400">No analyses yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {analyses.map(analysis => (
            <div key={analysis.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <div className="flex justify-between items-center mb-4">
                <span className="bg-green-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                  {analysis.score}%
                </span>
                <span className="text-zinc-400 text-sm">
                  {new Date(analysis.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{analysis.job_title}</h3>
              <p className="text-zinc-400 mb-4">{analysis.company_name}</p>
              <p className="text-sm text-zinc-500 mb-4">Missing Keywords: {analysis.missing_keywords_count}</p>
              <button
                onClick={() => navigate(`/analysis/${analysis.id}`)}
                className="bg-cyan-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-cyan-400 transition"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default History
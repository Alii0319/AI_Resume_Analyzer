import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import TopNavbar from "../components/TopNavbar"
import StatsCard from "../components/StatsCard"
import RecentAnalysisCard from "../components/RecentAnalysisCard"
import AnalysisForm from "../components/AnalysisForm"
import api from "../services/api"
import { AuthContext } from "../context/AuthContext"

function Dashboard() {
  const navigate = useNavigate()
  const { accessToken } = useContext(AuthContext)
  const [analyses, setAnalyses] = useState([])
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    averageScore: 0,
    totalKeywords: 0,
    recentAnalyses: 0
  })
  const [loading, setLoading] = useState(true)
  const [showAnalysisForm, setShowAnalysisForm] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/analysis/history/")
        const analysesData = response.data

        setAnalyses(analysesData.slice(0, 5)) // Show only recent 5

        // Calculate stats
        const totalAnalyses = analysesData.length
        const averageScore = totalAnalyses > 0
          ? Math.round(analysesData.reduce((sum, analysis) => sum + analysis.score, 0) / totalAnalyses)
          : 0
        const totalKeywords = analysesData.reduce((sum, analysis) => sum + analysis.missing_keywords_count, 0)
        const recentAnalyses = analysesData.filter(analysis => {
          const analysisDate = new Date(analysis.created_at)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return analysisDate > weekAgo
        }).length

        setStats({
          totalAnalyses,
          averageScore,
          totalKeywords,
          recentAnalyses
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (accessToken) {
      fetchDashboardData()
    }
  }, [accessToken])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <TopNavbar />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl p-8 border border-cyan-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Welcome back! 🚀</h1>
                  <p className="text-zinc-400 text-lg">
                    Ready to optimize your resume? Let's analyze your next opportunity.
                  </p>
                </div>
                <button
                  onClick={() => setShowAnalysisForm(true)}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  New Analysis
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Analyses"
                value={stats.totalAnalyses}
                change={12}
                color="cyan"
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
              <StatsCard
                title="Average Score"
                value={`${stats.averageScore}%`}
                change={5}
                color="green"
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
              />
              <StatsCard
                title="Keywords Found"
                value={stats.totalKeywords}
                change={-8}
                color="blue"
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
              />
              <StatsCard
                title="This Week"
                value={stats.recentAnalyses}
                change={25}
                color="purple"
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Analyses */}
              <div className="lg:col-span-2">
                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Recent Analyses</h2>
                    <button
                      onClick={() => navigate("/history")}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                    >
                      View All →
                    </button>
                  </div>

                  {analyses.length > 0 ? (
                    <div className="space-y-4">
                      {analyses.map((analysis) => (
                        <RecentAnalysisCard key={analysis.id} analysis={analysis} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-zinc-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-zinc-400 mb-4">No analyses yet</p>
                      <button
                        onClick={() => setShowAnalysisForm(true)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Start Your First Analysis
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                  <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowAnalysisForm(true)}
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-black p-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 text-left flex items-center gap-3"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      New Analysis
                    </button>

                    <button
                      onClick={() => navigate("/history")}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-white p-4 rounded-xl font-medium transition-colors text-left flex items-center gap-3"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      View History
                    </button>

                    <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white p-4 rounded-xl font-medium transition-colors text-left flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export Report
                    </button>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                  <h3 className="text-lg font-semibold text-white mb-4">💡 Pro Tips</h3>
                  <ul className="space-y-3 text-sm text-zinc-400">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></span>
                      Upload PDFs under 5MB for best results
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></span>
                      Include measurable achievements in your resume
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></span>
                      Tailor keywords to match job descriptions
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Analysis Form Modal */}
      {showAnalysisForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto border border-zinc-800">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">New Resume Analysis</h2>
              <button
                onClick={() => setShowAnalysisForm(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <AnalysisForm onComplete={() => setShowAnalysisForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
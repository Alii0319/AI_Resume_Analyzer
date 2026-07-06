import { useNavigate } from "react-router-dom"

function RecentAnalysisCard({ analysis }) {
  const navigate = useNavigate()

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div
      onClick={() => navigate(`/analysis/${analysis.id}`)}
      className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 hover:border-cyan-500/30 transition-all duration-200 cursor-pointer hover:bg-zinc-800/70"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white text-sm">{analysis.job_title}</h3>
          <p className="text-zinc-400 text-xs">{analysis.company_name}</p>
        </div>
        <div className={`text-lg font-bold ${getScoreColor(analysis.score)}`}>
          {analysis.score}%
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500">{formatDate(analysis.created_at)}</span>
        <span className="text-zinc-400">{analysis.missing_keywords_count} missing</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 bg-zinc-700 rounded-full h-1.5">
          <div
            className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${analysis.score}%` }}
          />
        </div>
        <span className="text-xs text-zinc-400">ATS</span>
      </div>
    </div>
  )
}

export default RecentAnalysisCard
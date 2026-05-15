import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api"
import { AuthContext } from "../context/AuthContext"

function BadgePill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-red-500/15 px-3 py-1 text-sm font-medium text-red-200 ring-1 ring-red-500/20">
      {children}
    </span>
  )
}

function Accordion({ title, children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-white transition hover:bg-zinc-900/80"
      >
        <span>{title}</span>
        <span className="text-zinc-400">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="border-t border-zinc-800 px-5 py-4 text-sm leading-6 text-zinc-300">
          {children}
        </div>
      )}
    </div>
  )
}

function AnalysisDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { accessToken } = useContext(AuthContext)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState("")
  const [exportSuccess, setExportSuccess] = useState(false)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await api.get(`/analysis/${id}/`)
        setAnalysis(response.data)
      } catch (error) {
        const message = error.response?.data?.detail || error.message || "Failed to load analysis"
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    if (accessToken && id) fetchAnalysis()
  }, [accessToken, id])

  const downloadPdf = async () => {
    setExportError("")
    setExporting(true)

    try {
      const response = await api.get(`/analysis/${id}/export/`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `analysis-report-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      const message = error.response?.data?.detail || error.message || "Failed to download report"
      setExportError(message)
    } finally {
      setExporting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
        <p>Loading analysis details...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => navigate("/history")}
          className="bg-cyan-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-cyan-400"
        >
          Back to History
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analysis Details</h1>
            <p className="text-zinc-400">{analysis.resume_title} vs {analysis.job_title} at {analysis.company_name}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => navigate("/history")}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg"
            >
              Back to History
            </button>
            <button
              onClick={downloadPdf}
              disabled={exporting}
              className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exporting ? "Preparing PDF..." : "Download PDF Report"}
            </button>
          </div>
        </div>

        {exportError && (
          <div className="mb-6 rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {exportError}
          </div>
        )}

        {exportSuccess && (
          <div className="mb-6 rounded-3xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm text-green-200">
            PDF exported successfully!
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-zinc-800 bg-[#0D111A]/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-400">ATS Score</p>
                  <h3 className="mt-2 text-3xl font-semibold text-white">{analysis.score}%</h3>
                </div>
                <div className="rounded-3xl bg-zinc-950/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                  Match Rate
                </div>
              </div>

              <div className="rounded-full bg-zinc-800/90 p-1">
                <div
                  className="h-4 rounded-full bg-cyan-500 transition-all duration-500"
                  style={{ width: `${analysis.score}%` }}
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 px-4 py-4">
                  <p className="text-sm text-zinc-400">Matched Keywords</p>
                  <p className="mt-2 text-xl font-semibold text-white">{analysis.matched_keywords?.length || 0}</p>
                </div>
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 px-4 py-4">
                  <p className="text-sm text-zinc-400">Missing Keywords</p>
                  <p className="mt-2 text-xl font-semibold text-white">{analysis.missing_keywords?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-zinc-800 bg-[#0D111A]/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white">Resume Insights</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Review the output and update your resume to improve ATS visibility and clarity.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-4">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Missing Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing_keywords?.map((item, index) => (
                      <BadgePill key={index}>{item}</BadgePill>
                    ))}
                  </div>
                </div>

                <Accordion title="AI Suggestions">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                    {analysis.ai_suggestions}
                  </p>
                </Accordion>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-zinc-800 bg-[#0D111A]/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
              <h3 className="text-xl font-semibold text-white">Analysis Info</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-zinc-400">Resume</p>
                  <p className="text-white">{analysis.resume_title}</p>
                </div>
                <div>
                  <p className="text-zinc-400">Job Title</p>
                  <p className="text-white">{analysis.job_title}</p>
                </div>
                <div>
                  <p className="text-zinc-400">Company</p>
                  <p className="text-white">{analysis.company_name}</p>
                </div>
                <div>
                  <p className="text-zinc-400">Analyzed On</p>
                  <p className="text-white">{new Date(analysis.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-zinc-800 bg-[#0D111A]/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
              <h3 className="text-xl font-semibold text-white">Matched Keywords</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {analysis.matched_keywords?.map((item, index) => (
                  <span key={index} className="inline-flex items-center rounded-full bg-green-500/15 px-3 py-1 text-sm font-medium text-green-200 ring-1 ring-green-500/20">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-zinc-800 bg-[#0D111A]/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
              <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Use this information to update your resume sections strategically and increase your ATS score.
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-zinc-950/90 p-4">
                  <p className="text-sm font-semibold text-white">Tip</p>
                  <p className="mt-2 text-sm text-zinc-400">
                    Add missing keywords to your Professional Summary and Technical Skills while preserving natural language flow.
                  </p>
                </div>
                <div className="rounded-3xl bg-zinc-950/90 p-4">
                  <p className="text-sm font-semibold text-white">Recommended</p>
                  <p className="mt-2 text-sm text-zinc-400">
                    Mention measurable impact in bullet points and call out tools or techniques used clearly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisDetails
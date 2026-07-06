import { useState } from "react"
import api from "../services/api"
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

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

function AnalysisForm({ onComplete }) {
  const [title, setTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!title || !description || !file) {
      setError("All fields are required.")
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append("title", title)
    formData.append("company_name", companyName)
    formData.append("description", description)
    formData.append("file", file)

    try {
      const response = await api.post("/analysis/run/", formData)
      setResult(response.data)
      if (onComplete) onComplete()
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Analysis failed"
      setError(message)
      console.log(error.response?.data || error.message || error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-8 sm:px-6">
      <div className="rounded-[32px] border border-zinc-800 bg-[#090A0F]/95 p-8 shadow-[0_35px_120px_rgba(15,23,42,0.35)]">
        <div className="mb-8 flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">AI Resume Analyzer</p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Run AI Analysis</h2>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            Upload your resume and job description to receive ATS-focused score, missing keyword insights, and AI-backed improvement suggestions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Job Title"
              className="w-full rounded-3xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company Name"
              className="w-full rounded-3xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="6"
            placeholder="Paste Job Description"
            className="w-full rounded-3xl border border-zinc-800 bg-zinc-900/90 px-4 py-4 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />

          <label className="flex flex-col gap-2 rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/90 p-4 text-sm text-zinc-300 transition hover:border-cyan-500/50">
            <span className="font-medium text-white">Upload Resume PDF</span>
            <span>{file ? file.name : "Select a PDF resume file"}</span>
            <input
              type="file"
              accept=".pdf"
              className="sr-only"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-3xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition enabled:hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Analyzing Resume...
                </>
              ) : (
                "Run Analysis"
              )}
            </button>
          </div>

          {error && (
            <p className="rounded-3xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}
        </form>
      </div>

      {result && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-zinc-800 bg-[#0D111A]/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-400">ATS Score</p>
                  <h3 className="mt-2 text-3xl font-semibold text-white">{result.score}%</h3>
                </div>
                <div className="w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ name: 'Score', value: result.score }]}>
                      <RadialBar dataKey="value" cornerRadius={10} fill="#06b6d4" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-full bg-zinc-800/90 p-1">
                <div
                  className="h-4 rounded-full bg-cyan-500 transition-all duration-500"
                  style={{ width: `${result.score}%` }}
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 px-4 py-4">
                  <p className="text-sm text-zinc-400">Matched Keywords</p>
                  <p className="mt-2 text-xl font-semibold text-white">{result.matched_keywords?.length || 0}</p>
                </div>
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 px-4 py-4">
                  <p className="text-sm text-zinc-400">Missing Keywords</p>
                  <p className="mt-2 text-xl font-semibold text-white">{result.missing_keywords?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-zinc-800 bg-[#0D111A]/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white">Skill Match Analysis</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Visual breakdown of matched vs missing skills.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Match Percentage</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Matched', value: result.matched_keywords?.length || 0 },
                          { name: 'Missing', value: result.missing_keywords?.length || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Skills Comparison</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[{ name: 'Skills', matched: result.matched_keywords?.length || 0, missing: result.missing_keywords?.length || 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="matched" fill="#10b981" />
                      <Bar dataKey="missing" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
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
                    {result.missing_keywords?.map((item, index) => (
                      <BadgePill key={index}>{item}</BadgePill>
                    ))}
                  </div>
                </div>

                <Accordion title="AI Suggestions">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                    {result.ai_suggestions}
                  </p>
                </Accordion>
              </div>
            </div>
          </div>

          <div className="space-y-6">
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

            <div className="rounded-[32px] border border-zinc-800 bg-[#0D111A]/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
              <h3 className="text-xl font-semibold text-white">Delivery</h3>
              <ul className="mt-4 space-y-3 text-sm text-zinc-400">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                  Receive instant AI-driven resume guidance.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                  Save more relevant keywords and optimize experience content.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                  Keep your resume aligned with the job description.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalysisForm

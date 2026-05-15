function StatsCard({ title, value, change, icon, color = "cyan" }) {
  const colorClasses = {
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      text: "text-cyan-400",
      icon: "text-cyan-400"
    },
    green: {
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-400",
      icon: "text-green-400"
    },
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
      icon: "text-blue-400"
    },
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      text: "text-purple-400",
      icon: "text-purple-400"
    }
  }

  const classes = colorClasses[color]

  return (
    <div className={`rounded-2xl border ${classes.border} ${classes.bg} p-6 transition-all duration-200 hover:scale-105 hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`${classes.icon} opacity-80`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default StatsCard
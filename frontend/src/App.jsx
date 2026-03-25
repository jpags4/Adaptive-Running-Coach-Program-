import { useEffect, useState } from 'react'

const DARK_HOVER_GLOW = 'transition duration-200 hover:border-violet-500/55 hover:shadow-[0_0_0_1px_rgba(168,85,247,0.18),0_0_34px_rgba(168,85,247,0.18)]'

function darkGlow(enabled) {
  return enabled ? DARK_HOVER_GLOW : ''
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`inline-flex items-center gap-3 rounded-full border px-3 py-2 transition ${
        isDark
          ? 'border-neutral-700 bg-neutral-900 text-neutral-100 hover:border-violet-500'
          : 'border-neutral-200 bg-white text-neutral-700 hover:border-violet-300'
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
          isDark ? 'bg-neutral-800 text-neutral-100' : 'bg-neutral-100 text-neutral-700'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8Z" />
        </svg>
      </span>
      <span className="pr-2 text-sm font-semibold">
        {isDark ? 'Dark Mode' : 'Light Mode'}
      </span>
    </button>
  )
}

function UserCircleIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19a7.4 7.4 0 0 1 13 0" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

function Icon({ path, className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

function RunningShoeIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3.5 16.25h14.4c1.55 0 2.6-.46 2.6-1.62c0-.56-.3-.95-.86-1.11l-4.36-1.16a3.7 3.7 0 0 1-2.05-1.45l-1.5-2.16c-.32-.47-.93-.71-1.48-.59l-1.48.34l-.44 2.53a1.28 1.28 0 0 1-.72.95l-2.9 1.3h-.96c-.69 0-1.25.56-1.25 1.25v1.72Z" />
      <path d="M9.55 12.55h1.45" />
      <path d="M12.15 11.85h1.4" />
      <path d="M14.5 12.45h1.22" />
    </svg>
  )
}

function HeartOutlineIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <g transform="translate(0.45 0)">
        <path d="M12 20s-6-4.4-6-10a3.8 3.8 0 0 1 6-2.9A3.8 3.8 0 0 1 18 10c0 5.6-6 10-6 10Z" />
      </g>
    </svg>
  )
}

function DumbbellIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4.25 9.35v5.3" />
      <path d="M6.85 7.6v8.8" />
      <path d="M17.15 7.6v8.8" />
      <path d="M19.75 9.35v5.3" />
      <path d="M6.85 12h10.3" />
    </svg>
  )
}

function TargetIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="7.35" />
      <circle cx="12" cy="12" r="3.95" />
      <circle cx="12" cy="12" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  )
}

function KeyIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="8.1" cy="14.9" r="2.95" />
      <path d="M10.25 12.75l8.25-8.25" />
      <path d="M15.1 7.9l1.35 1.35" />
      <path d="M17.05 5.95l1.35 1.35" />
      <path d="M11.05 14.2h3.15" />
    </svg>
  )
}

function SparkleIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M11.5 4.25l1.15 4.1l4.1 1.15l-4.1 1.15l-1.15 4.1l-1.15-4.1l-4.1-1.15l4.1-1.15l1.15-4.1Z" />
      <path d="M18.15 4.6v2.3" />
      <path d="M19.3 5.75H17" />
      <path d="M6 16.9v3" />
      <path d="M7.5 18.4h-3" />
    </svg>
  )
}

function TrendUpIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 16l5-5l4 4l7-7" />
      <path d="M14 8h6v6" />
    </svg>
  )
}

function RouteIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="6.5" cy="17.5" r="1.7" />
      <circle cx="17.5" cy="6.5" r="1.7" />
      <path d="M8.4 17.5h3.1a3.4 3.4 0 0 0 3.4-3.4v-1a3.4 3.4 0 0 1 3.4-3.4H20" />
      <path d="M15.7 6.5h-3.1a3.4 3.4 0 0 0-3.4 3.4v1a3.4 3.4 0 0 1-3.4 3.4H4" />
    </svg>
  )
}

function RulerIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 16L16 4l4 4L8 20H4v-4Z" />
      <path d="M12 8l4 4" />
      <path d="M9 11l2 2" />
    </svg>
  )
}

function AbacusIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 5h14v14H5z" />
      <path d="M8 5v14M16 5v14M5 9h14M5 15h14" />
      <circle cx="8" cy="9" r="1.1" />
      <circle cx="16" cy="9" r="1.1" />
      <circle cx="8" cy="15" r="1.1" />
      <circle cx="16" cy="15" r="1.1" />
    </svg>
  )
}

function DashboardLoading({ theme = 'light' }) {
  const isDark = theme === 'dark'
  return (
    <main
      className={`min-h-screen ${
        isDark
          ? 'bg-[radial-gradient(circle_at_top,_rgba(58,28,112,0.26),_transparent_34%),radial-gradient(circle_at_50%_28%,_rgba(76,29,149,0.14),_transparent_30%),radial-gradient(circle_at_50%_72%,_rgba(49,25,97,0.12),_transparent_38%),linear-gradient(180deg,_#17131d_0%,_#1c1628_18%,_#241c37_38%,_#1b1725_60%,_#241c37_82%,_#151219_100%)] text-neutral-50'
          : 'bg-[radial-gradient(circle_at_top,_#f4f0ff,_#f7f4ee_48%,_#f7f4ee)] text-neutral-950'
      }`}
    >
      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className={`h-16 w-96 animate-pulse rounded-2xl ${isDark ? 'bg-neutral-800/90' : 'bg-neutral-200/70'}`} />
        <div className={`mt-4 h-8 w-56 animate-pulse rounded-2xl ${isDark ? 'bg-neutral-800/80' : 'bg-neutral-200/60'}`} />
        <div className={`mt-10 h-4 w-64 animate-pulse rounded-full ${isDark ? 'bg-neutral-800/80' : 'bg-neutral-200/60'}`} />
        <div className={`mt-8 border-b ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`} />

        <section className="grid grid-cols-1 gap-6 py-10 md:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className={`rounded-[1.75rem] border p-6 shadow-sm ${
                isDark ? 'border-neutral-800 bg-neutral-900/90' : 'border-neutral-200 bg-white/80'
              }`}
            >
              <div className={`h-4 w-24 animate-pulse rounded-full ${isDark ? 'bg-neutral-800' : 'bg-neutral-200/70'}`} />
              <div className={`mt-5 h-10 w-28 animate-pulse rounded-2xl ${isDark ? 'bg-neutral-800' : 'bg-neutral-200/70'}`} />
              <div className={`mt-3 h-4 w-36 animate-pulse rounded-full ${isDark ? 'bg-neutral-800/90' : 'bg-neutral-200/60'}`} />
            </div>
          ))}
        </section>

        <section className={`rounded-[2rem] border p-8 shadow-sm ${isDark ? 'border-neutral-800 bg-neutral-900/90' : 'border-neutral-200 bg-white/90'}`}>
          <div className={`h-4 w-36 animate-pulse rounded-full ${isDark ? 'bg-neutral-800' : 'bg-neutral-200/70'}`} />
          <div className={`mt-6 h-16 w-[28rem] animate-pulse rounded-[1.75rem] ${isDark ? 'bg-neutral-800' : 'bg-neutral-200/70'}`} />
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className={`h-24 animate-pulse rounded-[1.75rem] ${isDark ? 'bg-neutral-800/90' : 'bg-neutral-200/60'}`} />
            <div className={`h-24 animate-pulse rounded-[1.75rem] ${isDark ? 'bg-neutral-800/90' : 'bg-neutral-200/60'}`} />
          </div>
        </section>
      </div>
    </main>
  )
}

function timeOfDayGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function ErrorScreen({ message, theme = 'light' }) {
  const isDark = theme === 'dark'
  return (
    <main
      className={`min-h-screen ${
        isDark
          ? 'bg-[radial-gradient(circle_at_top,_rgba(58,28,112,0.26),_transparent_34%),radial-gradient(circle_at_50%_28%,_rgba(76,29,149,0.14),_transparent_30%),radial-gradient(circle_at_50%_72%,_rgba(49,25,97,0.12),_transparent_38%),linear-gradient(180deg,_#17131d_0%,_#1c1628_18%,_#241c37_38%,_#1b1725_60%,_#241c37_82%,_#151219_100%)] text-neutral-50'
          : 'bg-[radial-gradient(circle_at_top,_#f4f0ff,_#f7f4ee_48%,_#f7f4ee)] text-neutral-950'
      }`}
    >
      <div className="mx-auto max-w-3xl px-8 py-20">
        <div className={`rounded-[2rem] border p-8 shadow-sm ${isDark ? 'border-red-900/50 bg-neutral-900' : 'border-red-200 bg-white'}`}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
            Dashboard Error
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            We couldn’t load your training dashboard.
          </h1>
          <p className={`mt-4 text-base leading-7 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>{message}</p>
        </div>
      </div>
    </main>
  )
}

function Header({ name, today, goalRaceDate, theme, onToggleTheme, onOpenProfile }) {
  const isDark = theme === 'dark'
  const greeting = timeOfDayGreeting()
  return (
    <header className="flex items-start justify-between gap-8 pb-6">
      <div>
        <h1 className={`text-6xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
          {greeting}, {name || 'Athlete'}
        </h1>
        <p className={`mt-7 text-sm font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
          Adaptive Running Coach
        </p>
        <p className={`mt-3 text-xl ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>{formatDate(today)}</p>
      </div>

      <div className="flex flex-col items-end gap-6 pt-1 text-right">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenProfile}
            className={`inline-flex h-14 w-14 items-center justify-center rounded-full border transition ${
              isDark
                ? 'border-neutral-700 bg-neutral-900 text-neutral-100 hover:border-violet-500'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-violet-300'
            }`}
            aria-label="Open profile settings"
          >
            <UserCircleIcon className="h-6 w-6" />
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        <div>
          <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
            Race Goal
          </p>
          <p className={`mt-3 text-2xl font-medium tracking-tight ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
            Half Marathon · {formatRaceGoal(goalRaceDate)}
          </p>
        </div>
      </div>
    </header>
  )
}

function ProfileSettingsPanel({
  isOpen,
  profileSettings,
  isSaving,
  onClose,
  onChange,
  onSave,
  theme = 'light',
}) {
  if (!isOpen || !profileSettings) return null
  const isDark = theme === 'dark'
  const hostedEnv = Boolean(profileSettings.hosted_env)
  const envOverrideNotice = String(profileSettings.env_override_notice || '').trim()

  const renderInput = (label, field, type = 'text', placeholder = '') => (
    <label className="block">
      <span className={`text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>{label}</span>
      <input
        type={type}
        value={profileSettings[field] ?? ''}
        onChange={(event) => onChange(field, event.target.type === 'checkbox' ? event.target.checked : event.target.value)}
        placeholder={placeholder}
        disabled={isSaving}
        className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
          isDark
            ? 'border-neutral-800 bg-neutral-950 text-white placeholder:text-neutral-500'
            : 'border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400'
        } ${isSaving ? 'opacity-70' : ''}`}
      />
    </label>
  )

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <aside className={`absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l px-6 py-6 shadow-2xl ${isDark ? `border-neutral-800 bg-neutral-950 text-white ${darkGlow(true)}` : 'border-neutral-200 bg-stone-50 text-neutral-950'}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Profile</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">Athlete Settings</h2>
            <p className={`mt-3 text-base leading-7 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              This is the central place for race goals, training preferences, and Strava/WHOOP setup.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              isDark ? 'border-neutral-700 bg-neutral-900 text-neutral-200' : 'border-neutral-200 bg-white text-neutral-700'
            }`}
          >
            Close
          </button>
        </div>

        {hostedEnv && envOverrideNotice ? (
          <div className={`mt-6 rounded-2xl border px-4 py-4 text-sm leading-7 ${isDark ? 'border-amber-800 bg-amber-950/40 text-amber-100' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
            {envOverrideNotice}
          </div>
        ) : null}

        <div className="mt-8 space-y-8">
          <section className={`rounded-[1.75rem] border p-5 ${isDark ? `border-neutral-800 bg-neutral-900/90 ${darkGlow(true)}` : 'border-neutral-200 bg-white'}`}>
            <h3 className="text-2xl font-semibold tracking-tight">Athlete</h3>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {renderInput('Name', 'athlete_name')}
              {renderInput('Goal Race Date', 'goal_race_date', 'text', '2026-05-10')}
              {renderInput('Goal Half Time', 'goal_half_marathon_time', 'text', '1:45:00')}
              {renderInput('Recent Benchmark', 'recent_race_result', 'text', '10K in 48:30')}
            </div>
          </section>

          <section className={`rounded-[1.75rem] border p-5 ${isDark ? `border-neutral-800 bg-neutral-900/90 ${darkGlow(true)}` : 'border-neutral-200 bg-white'}`}>
            <h3 className="text-2xl font-semibold tracking-tight">Training Preferences</h3>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {renderInput('Preferred Long Run Day', 'preferred_long_run_day')}
              {renderInput('Max Comfortable Long Run', 'max_comfortable_long_run_miles')}
              {renderInput('Desired Runs Per Week', 'desired_runs_per_week')}
              {renderInput('Strength Sessions Per Week', 'desired_strength_frequency')}
              {renderInput('Adaptation Emphasis', 'preferred_adaptation_emphasis', 'text', 'threshold')}
            </div>
            <div className={`mt-4 rounded-2xl border px-4 py-4 text-sm leading-7 ${
              isDark ? 'border-violet-900/50 bg-violet-950/30 text-violet-100' : 'border-violet-200 bg-violet-50 text-violet-900'
            }`}>
              Weekly mileage is adaptive. The coach now adjusts it week to week based on your recent training, recovery, and progression, instead of treating it as a fixed setting.
            </div>
            <label className="mt-4 block">
              <span className={`text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>Injury / Niggle Flags</span>
              <textarea
                value={profileSettings.injury_flags ?? ''}
                onChange={(event) => onChange('injury_flags', event.target.value)}
                disabled={isSaving}
                className={`mt-2 min-h-24 w-full rounded-2xl border px-4 py-3 text-sm outline-none ${
                  isDark ? 'border-neutral-800 bg-neutral-950 text-white' : 'border-neutral-200 bg-white text-neutral-900'
                }`}
              />
            </label>
          </section>

          <section className={`rounded-[1.75rem] border p-5 ${isDark ? `border-neutral-800 bg-neutral-900/90 ${darkGlow(true)}` : 'border-neutral-200 bg-white'}`}>
            <h3 className="text-2xl font-semibold tracking-tight">Integrations</h3>
            <div className="mt-5 grid grid-cols-1 gap-5">
              {[
                ['Strava', profileSettings.strava],
                ['WHOOP', profileSettings.whoop],
              ].map(([label, provider]) => (
                <div key={label} className={`rounded-[1.4rem] border p-4 ${isDark ? `border-neutral-800 bg-neutral-950/90 ${darkGlow(true)}` : 'border-neutral-200 bg-stone-50'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold tracking-tight">{label}</p>
                      <p className={`mt-1 text-sm ${provider?.connected ? 'text-emerald-600' : isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {provider?.connected ? 'Connected' : 'Not connected yet'}
                      </p>
                    </div>
                    <a
                      href={provider?.connect_url || '#'}
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        isDark ? 'bg-violet-600 text-white' : 'bg-neutral-950 text-white'
                      }`}
                    >
                      {provider?.connected ? `Reconnect ${label}` : `Connect ${label}`}
                    </a>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {renderInput(`${label} Client ID`, `${label.toLowerCase()}_client_id`)}
                    {renderInput(`${label} Client Secret`, `${label.toLowerCase()}_client_secret`)}
                  </div>
                  <p className={`mt-3 break-all text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                    Callback URL: {provider?.callback_url || 'Add your public base URL to generate this'}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {renderInput('Public Base URL', 'public_base_url', 'text', 'https://your-app.onrender.com')}
              <label className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${isDark ? `border-neutral-800 bg-neutral-950 ${darkGlow(true)}` : 'border-neutral-200 bg-white'}`}>
                <input
                  type="checkbox"
                  checked={Boolean(profileSettings.allow_insecure_ssl)}
                  onChange={(event) => onChange('allow_insecure_ssl', event.target.checked)}
                  disabled={isSaving}
                />
                <span className={`text-sm ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Allow insecure SSL for local development</span>
              </label>
            </div>
          </section>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full border px-5 py-3 text-sm font-semibold ${isDark ? 'border-neutral-700 bg-neutral-900 text-neutral-200' : 'border-neutral-200 bg-white text-neutral-700'}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className={`rounded-full px-5 py-3 text-sm font-semibold ${isDark ? 'bg-violet-600 text-white' : 'bg-neutral-950 text-white'} ${isSaving ? 'opacity-70' : ''}`}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </aside>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  accent = 'text-neutral-950',
  iconTone = 'bg-violet-50 text-violet-600',
  theme = 'light',
}) {
  const isDark = theme === 'dark'
  const resolvedAccent =
    isDark && !/(emerald|amber|red|sky|violet|white)/.test(accent) ? 'text-white' : accent
  return (
    <div
      className={`min-h-[14rem] rounded-[1.9rem] border px-6 py-6 shadow-sm transition duration-200 ${
        isDark
          ? 'border-neutral-800 bg-neutral-900/95 hover:border-violet-500/55 hover:shadow-[0_0_0_1px_rgba(168,85,247,0.18),0_0_34px_rgba(168,85,247,0.18)]'
          : 'border-neutral-200 bg-white/90 hover:border-violet-300 hover:shadow-[0_0_0_1px_rgba(192,132,252,0.4),0_0_24px_rgba(196,181,253,0.26)]'
      }`}
    >
      <div className={`flex items-start gap-3 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconTone}`}>
          {icon}
        </div>
        <p className={`min-w-0 break-words pt-1 text-sm font-semibold uppercase leading-7 tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {label}
        </p>
      </div>
      <p className={`mt-6 text-[2.7rem] font-semibold tracking-tight sm:text-[3rem] ${resolvedAccent}`}>{value}</p>
      <p className={`mt-3 break-words text-base leading-8 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>{subtext}</p>
    </div>
  )
}

function PromptButton({ active, onClick, children, theme = 'light' }) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? isDark
            ? 'bg-violet-600 text-white shadow-[0_10px_30px_rgba(109,40,217,0.28)]'
            : 'bg-neutral-950 text-white shadow-[0_10px_30px_rgba(76,29,149,0.18)]'
          : isDark
            ? 'border border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-violet-500 hover:text-white'
            : 'border border-neutral-200 bg-white text-neutral-600 hover:border-violet-300 hover:text-neutral-900'
      }`}
    >
      {children}
    </button>
  )
}

function RecommendationLauncher({ onOpen, theme = 'light', hasRecommendation = false, isGenerating = false }) {
  const isDark = theme === 'dark'
  if (hasRecommendation) return null

  return (
    <section className="py-5">
      <div className="mx-auto flex max-w-5xl justify-center">
        <button
          type="button"
          onClick={onOpen}
          disabled={isGenerating}
          className={`group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-[1.8rem] border px-8 py-5 text-center text-2xl font-semibold tracking-tight transition duration-200 ${
            isGenerating
              ? isDark
                ? 'cursor-not-allowed border-neutral-700 bg-neutral-900 text-neutral-400 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]'
                : 'cursor-not-allowed border-neutral-200 bg-neutral-900 text-neutral-300 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]'
              : isDark
              ? 'border-violet-500/50 bg-neutral-950 text-white shadow-[0_0_0_1px_rgba(168,85,247,0.24),0_0_42px_rgba(168,85,247,0.28)] hover:border-violet-400 hover:shadow-[0_0_0_1px_rgba(192,132,252,0.35),0_0_56px_rgba(168,85,247,0.34)]'
              : 'border-violet-300 bg-white text-neutral-950 shadow-[0_0_0_1px_rgba(216,180,254,0.8),0_0_46px_rgba(196,181,253,0.42)] hover:border-violet-400 hover:shadow-[0_0_0_1px_rgba(192,132,252,0.9),0_0_58px_rgba(192,132,252,0.48)]'
          }`}
        >
          <span className={`pointer-events-none absolute inset-0 opacity-80 ${
            isDark
              ? 'bg-[radial-gradient(circle_at_top,_rgba(192,132,252,0.16),_transparent_55%)]'
              : 'bg-[radial-gradient(circle_at_top,_rgba(216,180,254,0.35),_transparent_60%)]'
          }`} />
          <span className={`relative flex h-11 w-11 items-center justify-center rounded-2xl ${
            isGenerating
              ? isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-800 text-neutral-300'
              : isDark ? 'bg-violet-500/15 text-violet-300' : 'bg-violet-50 text-violet-600'
          }`}>
            {isGenerating ? (
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-current/40 border-t-current" />
            ) : (
              <SparkleIcon />
            )}
          </span>
          <span className="relative">{isGenerating ? 'Generating Recommendation...' : 'Generate Today’s Recommendation'}</span>
        </button>
      </div>
    </section>
  )
}

function CheckInModal({
  isOpen,
  physicalFeeling,
  mentalFeeling,
  notes,
  isGenerating,
  onClose,
  onPhysicalChange,
  onMentalChange,
  onNotesChange,
  onGenerate,
  theme = 'light',
}) {
  const isDark = theme === 'dark'
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Close recommendation prompts"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/45 backdrop-blur-sm"
      />
      <section className={`relative z-10 max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border p-8 shadow-[0_30px_120px_rgba(0,0,0,0.22)] ${
        isDark ? 'border-neutral-800 bg-neutral-900/98' : 'border-neutral-200 bg-white/98'
      }`}>
        <div className="max-w-3xl">
            <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Recommendation Prompts
            </p>
            <h2 className={`mt-4 text-4xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
              Fill this out, then generate today&apos;s recommendation.
            </h2>
            <p className={`mt-4 text-lg leading-8 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
              Your biometrics and recent running load are already on the page. These prompts let the model account
              for how your legs feel, how your head feels, and anything else you want it to weigh.
            </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              How do your legs feel?
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {['fresh', 'normal', 'heavy', 'sore', 'injured'].map((option) => (
                <PromptButton key={option} active={physicalFeeling === option} onClick={() => onPhysicalChange(option)} theme={theme}>
                  {capitalize(option)}
                </PromptButton>
              ))}
            </div>
          </div>

          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              What&apos;s your mental state?
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {['sharp', 'steady', 'stressed', 'drained'].map((option) => (
                <PromptButton key={option} active={mentalFeeling === option} onClick={() => onMentalChange(option)} theme={theme}>
                  {capitalize(option)}
                </PromptButton>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <label className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Anything else the coach should know?
          </label>
          <textarea
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder="Examples: poor sleep, lingering calf tightness, emotionally drained, limited time, want to lift arms only."
            className={`mt-4 min-h-32 w-full rounded-[1.5rem] border px-5 py-4 text-base leading-7 outline-none transition placeholder:text-neutral-400 focus:border-violet-400 ${
              isDark
                ? 'border-neutral-800 bg-neutral-950 text-neutral-100'
                : 'border-neutral-200 bg-stone-50 text-neutral-800'
            }`}
          />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className={`inline-flex items-center gap-3 rounded-full px-7 py-4 text-sm font-semibold transition ${
              isGenerating
                ? isDark
                  ? 'cursor-not-allowed bg-neutral-800 text-neutral-500'
                  : 'cursor-not-allowed bg-neutral-200 text-neutral-500'
                : isDark
                  ? 'bg-violet-600 text-white shadow-[0_12px_28px_rgba(109,40,217,0.28)] hover:bg-violet-500'
                  : 'bg-neutral-950 text-white shadow-[0_12px_28px_rgba(76,29,149,0.22)] hover:bg-neutral-800'
            }`}
          >
            {isGenerating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-neutral-700" />
                Generating Recommendation...
              </>
            ) : (
              'Generate Recommendation'
            )}
          </button>
        </div>
      </section>
    </div>
  )
}

function TodayActivityButton({ onOpen, currentDayStatus, theme = 'light' }) {
  const isDark = theme === 'dark'
  const statusText = currentDayStatus?.headline || 'No activity logged yet'

  return (
    <div className="mt-2 mb-3">
      <button
        type="button"
        onClick={onOpen}
        className={`inline-flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
          isDark
            ? 'border-sky-900/70 bg-sky-950/40 text-sky-200 hover:border-sky-700 hover:bg-sky-950/60'
            : 'border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-300 hover:bg-sky-100'
        }`}
      >
        <span className={`inline-flex h-2.5 w-2.5 rounded-full ${isDark ? 'bg-sky-400' : 'bg-sky-500'}`} />
        <span>Today&apos;s Activity</span>
        <span className={`${isDark ? 'text-sky-300/80' : 'text-sky-700/80'}`}>•</span>
        <span className={`font-medium ${isDark ? 'text-sky-100/85' : 'text-sky-900/80'}`}>{statusText}</span>
      </button>
    </div>
  )
}

function TodayActivityModal({ isOpen, onClose, currentDayStatus, recommendation, theme = 'light' }) {
  const isDark = theme === 'dark'
  if (!isOpen) return null

  const noActivityYet = !currentDayStatus
  const headline = currentDayStatus?.headline || 'Nothing logged yet today.'
  const detail =
    currentDayStatus?.detail ||
    'You have not logged a run or workout yet today.'

  let planRelationship = 'Today has not started yet.'
  if (recommendation && noActivityYet) {
    planRelationship = `Today’s recommendation is ${shortWorkoutTitle(recommendation.workout)}. You still have the full session ahead of you.`
  } else if (recommendation && currentDayStatus?.status === 'completed') {
    planRelationship = 'You have already covered today’s work, so the recommendation is effectively complete.'
  } else if (recommendation && currentDayStatus?.status === 'on_track') {
    planRelationship = 'You are essentially on plan for today and have already hit the day’s goal.'
  } else if (recommendation && currentDayStatus?.status === 'in_progress') {
    planRelationship = 'You have started today’s plan, but there is still some work left to finish.'
  } else if (recommendation && currentDayStatus?.status === 'cross_trained') {
    planRelationship = 'You have logged activity today, but the recommended run is still pending unless you intentionally swap the day.'
  } else if (!recommendation && noActivityYet) {
    planRelationship = 'Once a recommendation is generated, this will compare your logged activity against the day’s plan.'
  } else if (!recommendation) {
    planRelationship = 'Generate today’s recommendation to see how your logged activity compares to the plan.'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Close today's activity"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/45 backdrop-blur-sm"
      />
      <section className={`relative z-10 w-full max-w-3xl rounded-[2rem] border p-8 shadow-[0_30px_120px_rgba(0,0,0,0.22)] ${
        isDark ? 'border-neutral-800 bg-neutral-900/98' : 'border-neutral-200 bg-white/98'
      }`}>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-sky-300/80' : 'text-sky-700'}`}>
              Today&apos;s Activity
            </p>
            <h2 className={`mt-3 text-3xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
              {headline}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              isDark ? 'border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-sky-500' : 'border-neutral-200 bg-white text-neutral-700 hover:border-sky-300'
            }`}
          >
            Close
          </button>
        </div>

        <div className={`mt-6 rounded-[1.5rem] border px-5 py-4 ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-stone-50'}`}>
          <p className={`text-base leading-8 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>{detail}</p>
        </div>

        <div className={`mt-5 rounded-[1.5rem] border px-5 py-4 ${
          isDark ? 'border-sky-900/60 bg-sky-950/25' : 'border-sky-200 bg-sky-50/80'
        }`}>
          <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-sky-300/80' : 'text-sky-700'}`}>
            Status Against Plan
          </p>
          <p className={`mt-3 text-base leading-8 ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
            {planRelationship}
          </p>
        </div>
      </section>
    </div>
  )
}

function TrainingCard({
  recommendation,
  recommendationExplanation,
  today,
  onUpdateCheckIn,
  theme = 'light',
}) {
  if (!recommendation) return null

  const isDark = theme === 'dark'
  const sections = recommendation.explanation_sections ?? {}
  const adaptation = recommendation.daily_adaptation ?? {}
  const isLiftOffDay = /lifting off-day|no lifting/i.test(String(recommendation.lift_focus || ''))
  const liftBlocks = isLiftOffDay ? [] : formatLiftBlocks(recommendation.lift_guidance)
  const intensityLabel = simplifyIntensity(recommendation.intensity)
  const intensityClass = intensityColorClass(intensityLabel)

  return (
    <section className={`mx-auto max-w-[90rem] rounded-[2rem] border p-6 shadow-sm ${isDark ? `border-neutral-800 bg-neutral-900/95 ${darkGlow(true)}` : 'border-neutral-200 bg-white/95'}`}>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <p className={`text-xs font-medium uppercase tracking-[0.24em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              Today&apos;s Recommendation
            </p>
            <span className={`inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold ${
              isDark
                ? 'border-violet-800/60 bg-violet-950/45 text-violet-200'
                : 'border-violet-200 bg-violet-50 text-violet-700'
            }`}>
              {shortWorkoutTitle(recommendation.workout)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onUpdateCheckIn}
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${
            isDark
              ? 'border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-violet-500 hover:text-white'
              : 'border-neutral-200 bg-white text-neutral-700 hover:border-violet-300 hover:text-neutral-950'
          }`}
        >
          Update Check-In
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(23rem,0.95fr)]">
        <div className={`self-start rounded-[1.9rem] border p-6 shadow-sm ${isDark ? `border-neutral-800 bg-neutral-950 ${darkGlow(true)}` : 'border-neutral-200 bg-white'}`}>
          <div className={`flex items-center gap-2.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${isDark ? 'bg-emerald-950/70 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <RouteIcon />
            </div>
            <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Run
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="min-w-0">
              <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Distance
              </p>
              <p className={`mt-3 text-6xl font-semibold leading-none tracking-tight xl:text-[5rem] ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                {recommendation.run_distance_miles ?? '-'} mi
              </p>
            </div>

            <div className="min-w-0">
              <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Pace
              </p>
              <p className={`mt-3 text-[2.45rem] font-semibold leading-tight tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                {paceHeadline(recommendation.run_pace_guidance)}
              </p>
              <p className={`mt-3 text-base ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {paceSupportText(recommendation.run_pace_guidance)}
              </p>
            </div>
          </div>

          <div className={`mt-6 border-t pt-5 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
            <div className="min-w-0">
              <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Intensity
              </p>
              <p className={`mt-3 break-words text-4xl font-semibold leading-tight tracking-tight ${intensityClass}`}>
                {intensityLabel}
              </p>
              <p className={`mt-3 text-base ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {recommendation.duration_minutes ? `${recommendation.duration_minutes} min total` : ''}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-[1.9rem] border p-6 ${isDark ? `border-neutral-800 bg-neutral-950/80 ${darkGlow(true)}` : 'border-neutral-200 bg-stone-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-full ${isDark ? 'bg-violet-950/70 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
              <DumbbellIcon />
            </div>
            <div>
              <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Lift
              </p>
              <h3 className={`mt-2 text-4xl font-semibold leading-[1.02] tracking-tight xl:text-[3.4rem] ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                {shortLiftTitle(recommendation.lift_focus)}
              </h3>
            </div>
          </div>

          {isLiftOffDay ? (
            <p className={`mt-6 text-lg leading-8 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              No lift today. Keep all training stress in the run so recovery stays on track.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {liftBlocks.map((block, index) => (
                <div
                  key={`${block.name}-${index}`}
                  className={`rounded-2xl border px-5 py-4 text-base leading-7 ${isDark ? 'border-neutral-800 bg-neutral-900 text-neutral-300' : 'border-neutral-200 bg-white text-neutral-700'}`}
                >
                  <span className={`mr-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isDark ? 'bg-violet-950/80 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
                    {index + 1}
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-950'}`}>{block.name}</span>
                  {block.detail ? <span className={`${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}> {block.detail}</span> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {recommendationExplanation?.summary ? (
        <section className={`mt-6 rounded-[1.9rem] border p-6 ${
          isDark ? `border-sky-900/40 bg-sky-950/30 ${darkGlow(true)}` : 'border-sky-200 bg-sky-50/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-full ${
              isDark ? 'bg-sky-950/70 text-sky-300' : 'bg-white text-sky-700'
            }`}>
              <TargetIcon className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-sky-200/80' : 'text-sky-700'}`}>
                Coach Summary
              </p>
              <p className={`mt-1 text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Athlete-facing guidance built from the final recommendation
              </p>
            </div>
          </div>

          <p className={`mt-5 max-w-4xl text-xl leading-9 ${isDark ? 'text-white' : 'text-neutral-950'}`}>
            {recommendationExplanation.summary}
          </p>

          {Array.isArray(recommendationExplanation.whyBullets) && recommendationExplanation.whyBullets.length > 0 ? (
            <ul className={`mt-5 space-y-2 text-base leading-7 ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
              {recommendationExplanation.whyBullets.map((bullet, index) => (
                <li key={`${bullet}-${index}`} className="flex gap-3">
                  <span className={`mt-3 inline-block h-1.5 w-1.5 rounded-full ${isDark ? 'bg-sky-300' : 'bg-sky-700'}`} />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {recommendationExplanation.cautionNote ? (
            <p className={`mt-5 rounded-[1.25rem] border px-4 py-3 text-sm leading-7 ${
              isDark ? 'border-amber-900/50 bg-amber-950/35 text-amber-100' : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}>
              {recommendationExplanation.cautionNote}
            </p>
          ) : null}

          {recommendationExplanation.encouragement ? (
            <p className={`mt-5 text-sm italic ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {recommendationExplanation.encouragement}
            </p>
          ) : null}
        </section>
      ) : null}

      <details className={`mt-8 rounded-2xl border ${isDark ? `border-neutral-800 bg-neutral-950 ${darkGlow(true)}` : 'border-neutral-200 bg-white'}`}>
        <summary className={`cursor-pointer list-none px-5 py-4 text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
          Detailed Reasoning
        </summary>
        <div className={`space-y-5 border-t px-5 py-5 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <ReasonCard
            title="Overall"
            text={stripReasonPrefix(sections.overall, 'overall')}
            tone="violet"
            icon={<TargetIcon className="h-4 w-4" />}
            fullWidth
            theme={theme}
          />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className={`rounded-[1.75rem] border p-5 ${isDark ? 'border-emerald-900/40 bg-emerald-950/55' : 'border-emerald-200 bg-emerald-50/70'}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isDark ? 'bg-emerald-950 text-emerald-300' : 'bg-white text-emerald-700'}`}>
                  <RouteIcon className="h-4 w-4" />
                </div>
                <p className={`text-base font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-emerald-200' : 'text-emerald-900'}`}>
                  Run Logic
                </p>
              </div>
              <div className={`mt-4 rounded-[1.5rem] border ${isDark ? 'border-neutral-800 bg-neutral-950/80' : 'border-white/80 bg-white/90'}`}>
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isDark ? 'bg-neutral-900 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                      <AbacusIcon className="h-4 w-4" />
                    </div>
                    <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-200' : 'text-neutral-600'}`}>
                      Distance
                    </p>
                  </div>
                  <p className={`mt-3 text-[15px] leading-8 ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
                    {stripReasonPrefix(sections.run, 'run distance')}
                  </p>
                </div>
                <div className={`border-t px-5 py-4 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isDark ? 'bg-neutral-900 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                      <Icon path="M12 8v5l3 3M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z" className="h-4 w-4" />
                    </div>
                    <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-200' : 'text-neutral-600'}`}>
                      Pace
                    </p>
                  </div>
                  <p className={`mt-3 text-[15px] leading-8 ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
                    {stripReasonPrefix(sections.pace, 'pace')}
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-[1.75rem] border p-5 ${isDark ? 'border-violet-900/40 bg-violet-950/55' : 'border-violet-200 bg-violet-50/70'}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isDark ? 'bg-violet-950 text-violet-300' : 'bg-white text-violet-700'}`}>
                  <DumbbellIcon className="h-4 w-4" />
                </div>
                <p className={`text-base font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-violet-200' : 'text-violet-900'}`}>
                  Lift Logic
                </p>
              </div>
              <div className="mt-4">
                <ReasonCard title="Lifting" text={stripReasonPrefix(sections.lift, 'lifting')} tone="panel" icon={<DumbbellIcon className="h-4 w-4" />} theme={theme} />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <ReasonCard
              title="Recovery Influence"
              text={stripReasonPrefix(sections.recovery, 'recovery influence')}
              tone="neutral"
              icon={<TrendUpIcon className="h-4 w-4" />}
              theme={theme}
            />
            <div className={`rounded-[1.75rem] border p-5 ${
              isDark
                ? 'border-amber-800 bg-amber-950/70 shadow-[inset_4px_0_0_0_rgba(245,158,11,0.95)]'
                : 'border-amber-200 bg-amber-50/70 shadow-[inset_4px_0_0_0_rgba(245,158,11,0.85)]'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isDark ? 'bg-black/20 text-amber-300' : 'bg-white/90 text-amber-700'}`}>
                  <Icon path="M12 9v4m0 4h.01M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" className="h-4 w-4" />
                </div>
                <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-200' : 'text-neutral-600'}`}>
                  Warnings
                </p>
              </div>
              <ul className={`mt-4 space-y-3 text-[15px] leading-8 ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
                {(recommendation.warnings || []).filter(Boolean).map((warning, index) => (
                  <li key={`${warning}-${index}`} className="flex gap-3">
                    <span className={`${isDark ? 'text-amber-300' : 'text-amber-600'}`}>•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </details>
    </section>
  )
}

function WeeklyFocusCard({ weeklyFocus, theme = 'light' }) {
  if (!weeklyFocus) return null

  const isDark = theme === 'dark'

  return (
    <details open className={`group mt-8 overflow-hidden rounded-[2rem] border shadow-sm ${isDark ? `border-neutral-800 bg-neutral-900/95 ${darkGlow(true)}` : 'border-neutral-200 bg-white/95'}`}>
      <summary className="list-none cursor-pointer px-6 py-5 md:px-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Current Week
            </p>
            <div className={`mt-3 inline-flex rounded-[1.5rem] border px-5 py-3 ${isDark ? 'border-violet-800/60 bg-violet-950/50 text-white' : 'border-violet-100 bg-violet-50/80 text-neutral-950'}`}>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {weeklyFocus.phase || 'Weekly focus'}
              </h2>
            </div>
          </div>
          <span className={`text-2xl transition group-open:rotate-180 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>⌄</span>
        </div>
      </summary>

      <div className="px-6 pb-6 md:px-7 md:pb-7">
        <p className={`max-w-3xl text-lg leading-8 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
          {weeklyFocus.progression_note || weeklyFocus.race_connection || 'Weekly guidance will appear here.'}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-4">
          <FocusMetric label="Mileage Target" value={weeklyFocus.mileage_range || `${weeklyFocus.mileage_target || '-'} mi`} icon={<TargetIcon />} theme={theme} />
          <FocusMetric label="Long Run Goal" value={weeklyFocus.long_run_target || '-'} icon={<RunningShoeIcon />} theme={theme} />
          <FocusMetric label="Key Session" value={weeklyFocus.quality_session_target || '-'} icon={<KeyIcon />} theme={theme} />
          <FocusMetric label="Strength Goal" value={weeklyFocus.strength_target || '-'} icon={<DumbbellIcon />} theme={theme} />
        </div>
      </div>
    </details>
  )
}

function FocusMetric({ label, value, icon = null, theme = 'light' }) {
  const isDark = theme === 'dark'
  return (
    <div className={`rounded-[1.5rem] border px-5 py-4 ${isDark ? `border-neutral-800 bg-neutral-950/80 ${darkGlow(true)}` : 'border-neutral-200 bg-stone-50'}`}>
      {icon ? (
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isDark ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900'}`}>
          {icon}
        </div>
      ) : null}
      <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'} ${icon ? 'mt-4' : ''}`}>{label}</p>
      <p className={`mt-2 text-base leading-7 ${isDark ? 'text-white' : 'text-neutral-950'}`}>{value || '-'}</p>
    </div>
  )
}

function FocusList({ title, items = [], theme = 'light' }) {
  const isDark = theme === 'dark'
  return (
    <div className={`rounded-[1.5rem] border p-5 ${isDark ? `border-neutral-800 bg-neutral-950/80 ${darkGlow(true)}` : 'border-neutral-200 bg-stone-50'}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>{title}</p>
      <ul className={`mt-3 space-y-3 text-sm leading-7 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
        {(items || []).filter(Boolean).map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-3">
            <span className={`${isDark ? 'text-violet-300' : 'text-violet-700'}`}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ClarificationQuestions({ questions, onUseAnswer, theme = 'light' }) {
  if (!Array.isArray(questions) || questions.length === 0) return null
  const isDark = theme === 'dark'

  return (
    <section className={`mt-8 rounded-[2rem] border p-8 shadow-sm ${isDark ? 'border-amber-800/50 bg-amber-950/30' : 'border-amber-200 bg-amber-50/80'}`}>
      <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
        Coach Follow-Up
      </p>
      <h2 className={`mt-3 text-3xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
        A few details would sharpen today&apos;s call
      </h2>
      <div className="mt-6 space-y-4">
        {questions.map((question) => (
          <div key={question.id} className={`rounded-[1.4rem] border p-5 ${isDark ? 'border-neutral-800 bg-neutral-950/90' : 'border-neutral-200 bg-white'}`}>
            <p className={`text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>{question.prompt}</p>
            <p className={`mt-2 text-sm leading-7 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>{question.why_it_matters}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {(question.suggested_answers || []).map((answer) => (
                <PromptButton
                  key={`${question.id}-${answer}`}
                  active={false}
                  onClick={() => onUseAnswer(question.id, question.prompt, answer)}
                  theme={theme}
                >
                  {answer}
                </PromptButton>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function RecommendationOptions({ options, selectedKey, onSelect, theme = 'light' }) {
  if (!Array.isArray(options) || options.length === 0) return null
  const isDark = theme === 'dark'

  return (
    <div className="mb-4 mt-4">
      <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
        Today&apos;s Recommendation Path
      </p>
      <div className={`mt-3 inline-flex flex-wrap gap-2 rounded-[1.3rem] border p-2 ${
        isDark ? 'border-neutral-800 bg-neutral-950/80' : 'border-neutral-200 bg-white/80'
      }`}>
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelect(option.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedKey === option.key
                ? isDark
                  ? 'bg-violet-600 text-white shadow-[0_8px_24px_rgba(109,40,217,0.22)]'
                  : 'bg-violet-600 text-white shadow-[0_8px_24px_rgba(109,40,217,0.18)]'
                : isDark
                  ? 'bg-transparent text-neutral-300 hover:text-white'
                  : 'bg-transparent text-neutral-600 hover:text-neutral-950'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function TrainingRoadmap({ weeks, theme = 'light' }) {
  if (!Array.isArray(weeks) || weeks.length === 0) return null
  const isDark = theme === 'dark'

  return (
    <section className={`mt-8 rounded-[2rem] border p-8 shadow-sm ${isDark ? `border-neutral-800 bg-neutral-900/95 ${darkGlow(true)}` : 'border-neutral-200 bg-white/95'}`}>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Roadmap
          </p>
          <h2 className={`mt-3 text-4xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
            What The Next Weeks Likely Look Like
          </h2>
          <p className={`mt-3 max-w-3xl text-lg leading-8 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
            This is a directional progression view, not a locked schedule. The closer weeks are firmer; the later weeks stay intentionally flexible.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {weeks.map((week) => (
          <div key={week.week_start} className={`rounded-[1.6rem] border p-5 ${isDark ? `border-neutral-800 bg-neutral-950/85 ${darkGlow(true)}` : 'border-neutral-200 bg-stone-50'}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {week.label}
                </p>
                <h3 className={`mt-2 text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                  {week.phase}
                </h3>
              </div>
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${
                week.certainty === 'moderate'
                  ? isDark ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                  : week.certainty === 'light'
                    ? isDark ? 'bg-amber-950 text-amber-300' : 'bg-amber-100 text-amber-800'
                    : isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-700'
              }`}>
                {week.certainty}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <FocusMetric label="Primary Adaptation" value={capitalize(week.primary_adaptation || '')} theme={theme} />
              <FocusMetric label="Mileage Shape" value={week.mileage_range} theme={theme} />
              <FocusMetric label="Long Run Shape" value={week.long_run_target} theme={theme} />
              <FocusMetric label="Key Session Shape" value={week.quality_session_target} theme={theme} />
            </div>

            <div className={`mt-4 rounded-[1.35rem] border px-4 py-4 ${isDark ? `border-neutral-800 bg-neutral-900/90 ${darkGlow(true)}` : 'border-neutral-200 bg-white'}`}>
              <p className={`text-sm leading-7 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                {week.progression_note}
              </p>
              <p className={`mt-2 text-sm leading-7 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {week.confidence_note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function MasterTrainingCalendar({ cards, weeklyFocus, weeks, theme = 'light' }) {
  if (!Array.isArray(cards) || cards.length === 0 || !weeklyFocus) return null
  const isDark = theme === 'dark'
  const weekdayHeadings = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <section className={`mt-10 rounded-[2.3rem] border px-6 py-7 shadow-sm md:px-8 ${isDark ? `border-neutral-800 bg-neutral-900/95 ${darkGlow(true)}` : 'border-neutral-200 bg-white/95'}`}>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className={`text-4xl font-semibold tracking-tight md:text-5xl ${isDark ? 'text-white' : 'text-neutral-950'}`}>Training Calendar</h2>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className={`inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
              <span>This Week</span>
            </div>
            <div className={`flex items-center gap-5 text-sm ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
              <LegendDot color="bg-emerald-500" label="Easy" />
              <LegendDot color="bg-amber-400" label="Moderate" />
              <LegendDot color="bg-rose-500" label="Hard" />
            </div>
          </div>
          <p className={`mt-6 text-lg font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            {formatWeekSpan(cards)}
          </p>
        </div>
      </div>

      <div className={`mt-8 rounded-[1.8rem] border p-5 ${isDark ? `border-neutral-800 bg-neutral-950 ${darkGlow(true)}` : 'border-neutral-200 bg-stone-50'}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Current Week Schedule
            </p>
            <p className={`mt-2 text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
              {formatWeekSpan(cards)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2 xl:gap-3">
            {weekdayHeadings.map((heading) => (
              <p key={heading} className={`text-center text-sm font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                {heading}
              </p>
            ))}
            {cards.map((card) => (
              <CalendarCard key={card.day} card={card} theme={theme} />
            ))}
        </div>

        <details className={`group mt-6 border-t pt-6 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <summary className="list-none cursor-pointer">
            <div className="flex items-center justify-end gap-4">
              <span className={`text-2xl transition group-open:rotate-180 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>⌄</span>
            </div>
          </summary>

          <div className="mt-5">
            <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Weekly Focus
            </p>
            <div className={`mt-3 inline-flex items-center rounded-[1rem] border px-4 py-2 ${
              isDark
                ? 'border-violet-800/70 bg-violet-950/35 shadow-[inset_4px_0_0_0_rgba(168,85,247,0.9)]'
                : 'border-violet-200 bg-violet-50/85 shadow-[inset_4px_0_0_0_rgba(124,58,237,0.85)]'
            }`}>
              <h3 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-violet-100' : 'text-violet-900'}`}>
                {weeklyFocus.phase || 'Weekly focus'}
              </h3>
            </div>
            <p className={`mt-3 max-w-4xl text-lg leading-8 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
              {weeklyFocus.progression_note || weeklyFocus.race_connection || 'Weekly guidance will appear here.'}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-4">
              <FocusMetric label="Mileage" value={weeklyFocus.mileage_range || `${weeklyFocus.mileage_target || '-'} mi`} icon={<TargetIcon />} theme={theme} />
              <FocusMetric label="Key Session" value={weeklyFocus.quality_session_target || '-'} icon={<KeyIcon />} theme={theme} />
              <FocusMetric label="Long Run" value={weeklyFocus.long_run_target || '-'} icon={<RunningShoeIcon />} theme={theme} />
              <FocusMetric label="Strength" value={weeklyFocus.strength_target || '-'} icon={<DumbbellIcon />} theme={theme} />
            </div>

            {Array.isArray(weeks) && weeks.length > 0 ? (
              <div className={`mt-6 border-t pt-6 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
                <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Upcoming Training Blocks
                </p>
                <div className="mt-4 space-y-4">
                  {weeks.map((week, index) => (
                    <div
                      key={week.week_start}
                      className={`rounded-[1.4rem] border p-4 ${
                        isDark ? `border-neutral-800 bg-neutral-950/80 ${darkGlow(true)}` : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        Week {index + 2} · {formatRoadmapWeekSpan(week)}
                      </p>
                      <h4 className={`mt-2 text-xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                        {week.phase}
                      </h4>
                      <p className={`mt-2 max-w-4xl text-sm leading-6 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                        {week.summary || week.progression_note}
                      </p>
                      <div className={`mt-3 border-t pt-3 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className={`${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Mileage</span>
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-950'}`}>{week.mileage_range || '-'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </details>
      </div>
    </section>
  )
}

function TrainingCalendar({ cards, theme = 'light' }) {
  if (!Array.isArray(cards) || cards.length === 0) return null
  const isDark = theme === 'dark'

  const weekdayHeadings = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Training Calendar
          </p>
          <h2 className={`mt-3 text-4xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
            {monthHeading(cards)}
          </h2>
          <p className={`mt-3 max-w-3xl text-lg leading-8 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
            This calendar stays focused on the current week so you can see what already happened and what the immediate plan looks like next.
          </p>
        </div>

        <div className={`flex items-center gap-5 text-sm ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
          <LegendDot color="bg-emerald-500" label="Easy" />
          <LegendDot color="bg-amber-400" label="Moderate" />
          <LegendDot color="bg-rose-500" label="Hard" />
        </div>
      </div>

      <div className="mt-8 overflow-x-auto pb-2">
        <div className="grid min-w-[70rem] grid-cols-7 gap-3">
          {weekdayHeadings.map((heading) => (
            <p key={heading} className={`text-sm font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
              {heading}
            </p>
          ))}

          {cards.map((card) => (
            <CalendarCard key={card.day} card={card} theme={theme} />
          ))}
        </div>
      </div>
    </section>
  )
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-4 w-4 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  )
}

function CalendarCard({ card, theme = 'light' }) {
  const isDark = theme === 'dark'
  const activities = Array.isArray(card.activities) ? card.activities : []
  const stripeClass = calendarStripeClass(activities)
  const date = new Date(`${card.day}T12:00:00`)
  const weekdayShort = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date).toUpperCase()
  const dayNumber = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(date)

  return (
    <div
      className={`relative min-h-[15rem] overflow-hidden rounded-[1.3rem] border px-2.5 pb-3 pt-2.5 shadow-sm xl:min-h-[17rem] ${
        card.is_today
          ? isDark
            ? `border-2 border-white bg-neutral-900 ${darkGlow(true)}`
            : 'border-2 border-neutral-950 bg-white'
          : isDark
            ? `border-neutral-800 bg-neutral-900/90 ${darkGlow(true)}`
            : 'border-neutral-200 bg-white'
      }`}
    >
      {!card.is_today ? <div className={`absolute inset-y-3 left-0 w-1.5 rounded-full ${stripeClass}`} /> : null}

      {card.is_today ? (
        <div
          className={`-mx-3 -mt-2.5 mb-3 min-h-[5.1rem] px-3 pb-2.5 pt-2.5 ${
            isDark
              ? 'rounded-t-[1.15rem] border-neutral-200 bg-white text-neutral-950'
              : 'rounded-t-[1.15rem] border-neutral-950 bg-neutral-950 text-white'
          }`}
        >
          <p className="text-sm font-semibold tracking-tight">{weekdayShort}</p>
          <p className="mt-1.5 text-2xl font-semibold leading-none tracking-tight">{dayNumber}</p>
        </div>
      ) : (
        <div className="min-h-[5.1rem]">
          <p className={`text-sm font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
            {weekdayShort}
          </p>
          <p className={`mt-1.5 text-2xl font-semibold leading-none tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
            {dayNumber}
          </p>
        </div>
      )}

      <div className={`${activities.length === 0 ? 'min-h-[8rem]' : 'pt-2.5'}`}>
        {activities.length > 0 ? (
          <div className="space-y-2.5">
            {activities.map((activity, index) => (
              <CalendarActivity
                key={`${activity.name}-${index}-${activity.day || ''}`}
                activity={activity}
                theme={theme}
              />
            ))}
          </div>
        ) : (
          <div className="pt-2.5">
            <p className={`text-sm italic leading-6 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Rest day
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function CalendarActivity({ activity, theme = 'light' }) {
  const isDark = theme === 'dark'
  const isRun = /run/i.test(String(activity.name || '')) || /run/i.test(String(activity.sport || ''))
  const intensity = simplifyIntensity(activity.intensity || activity.workout_type || '')
  const liftLabel = calendarLiftFocus(activity)
  const showIntensityPill = isRun ? intensity !== '-' : Boolean(intensity && intensity !== '-' && liftLabel)

  return (
    <div className="pb-2.5 last:pb-0">
      {isRun ? (
        <>
          <p className={`text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
            {activity.distance_miles ? `${trimNumber(activity.distance_miles)} mi` : '-'}
          </p>
          <p className={`mt-1 text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{calendarPace(activity)}</p>
        </>
      ) : (
        liftLabel ? (
          <p className={`text-sm leading-6 ${isDark ? 'text-neutral-300' : 'text-neutral-500'}`}>
            {liftLabel}
          </p>
        ) : null
      )}

      {showIntensityPill ? (
        <span className={`mt-2 inline-flex rounded-2xl px-2.5 py-1 text-sm font-medium ${intensityPillClass(intensity)}`}>
          {intensity.toLowerCase()}
        </span>
      ) : null}
    </div>
  )
}

function RecommendationStat({
  icon,
  label,
  value,
  subtext,
  accent = 'text-neutral-950',
  iconTone = 'bg-violet-50 text-violet-600',
  valueClassName = 'text-5xl',
  subtextClassName = 'text-sm text-neutral-500',
  compact = false,
}) {
  return (
    <div className={`rounded-[1.75rem] border border-neutral-200 bg-white shadow-sm ${compact ? 'px-5 py-4' : 'px-5 py-5'}`}>
      <div className="flex items-center gap-2.5 text-neutral-500">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconTone}`}>
          {icon}
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">
          {label}
        </p>
      </div>
      <p className={`mt-4 break-words font-semibold leading-[0.94] tracking-tight ${accent} ${valueClassName}`}>{value}</p>
      {subtext ? <p className={`mt-3 leading-6 ${subtextClassName}`}>{subtext}</p> : null}
    </div>
  )
}

function ReasonCard({ title, text, tone = 'neutral', icon = null, fullWidth = false, theme = 'light' }) {
  if (!text) return null
  const isDark = theme === 'dark'

  const toneMap = {
    violet: isDark ? 'border-violet-800 bg-violet-900/90 shadow-[inset_4px_0_0_0_rgba(167,139,250,0.95)]' : 'border-violet-200 bg-violet-50/70 shadow-[inset_4px_0_0_0_rgba(124,58,237,0.85)]',
    amber: isDark ? 'border-amber-800 bg-amber-950/70 shadow-[inset_4px_0_0_0_rgba(245,158,11,0.95)]' : 'border-amber-200 bg-amber-50/70 shadow-[inset_4px_0_0_0_rgba(245,158,11,0.85)]',
    neutral: isDark ? 'border-neutral-800 bg-neutral-950/95 shadow-[inset_4px_0_0_0_rgba(115,115,115,0.9)]' : 'border-neutral-200 bg-stone-50 shadow-[inset_4px_0_0_0_rgba(161,161,170,0.8)]',
    panel: isDark ? 'border-neutral-800 bg-black/15' : 'border-white/80 bg-white/85',
  }

  return (
    <div className={`rounded-[1.75rem] border p-5 ${toneMap[tone]} ${fullWidth ? 'w-full' : ''} ${isDark ? darkGlow(true) : ''}`}>
      <div className="flex items-center gap-2.5">
        {icon ? (
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isDark ? 'bg-black/20 text-current' : 'bg-white/90 text-current'}`}>
            {icon}
          </div>
        ) : null}
        <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-200' : 'text-neutral-600'}`}>
          {title}
        </p>
      </div>
      <p className={`mt-3 text-[15px] leading-8 ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>{text}</p>
    </div>
  )
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : ''
}

function paceZoneLabel(label) {
  const text = String(label || '').toLowerCase()
  if (text.includes('easy')) return 'Zone 2 aerobic'
  if (text.includes('steady')) return 'Zone 3 steady'
  if (text.includes('threshold')) return 'Zone 4 threshold'
  if (text.includes('long')) return 'Zone 2-3 long run'
  return ''
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(`${dateString}T12:00:00`)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function formatRaceGoal(dateString) {
  if (!dateString) return 'TBD'
  const date = new Date(`${dateString}T12:00:00`)
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function monthHeading(cards) {
  return 'Training Calendar'
}

function formatWeekSpan(cards) {
  const first = cards[0]?.day
  const last = cards[cards.length - 1]?.day
  if (!first || !last) return ''
  const firstDate = new Date(`${first}T12:00:00`)
  const lastDate = new Date(`${last}T12:00:00`)
  const sameMonth = firstDate.getMonth() === lastDate.getMonth()
  const firstText = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(firstDate)
  const lastText = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(lastDate)
  const fullLastText = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(lastDate)
  return sameMonth ? `${firstText}-${lastText}` : `${firstText}-${fullLastText}`
}

function flattenActivityLog(activityLog) {
  const runs = Array.isArray(activityLog?.runs) ? activityLog.runs : []
  const strength = Array.isArray(activityLog?.strength) ? activityLog.strength : []
  return [...runs, ...strength]
}

function formatRoadmapWeekSpan(week) {
  if (!week?.week_start || !week?.week_end) return week?.label || ''
  const start = new Date(`${week.week_start}T12:00:00`)
  const end = new Date(`${week.week_end}T12:00:00`)
  const sameMonth = start.getMonth() === end.getMonth()
  const startText = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(start)
  const endText = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(end)
  const fullEndText = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(end)
  return sameMonth ? `${startText}-${endText}` : `${startText}-${fullEndText}`
}

function shortWorkoutTitle(value) {
  const text = String(value || '').trim().toLowerCase()
  if (text.includes('rest')) return 'Rest / Mobility'
  if (text.includes('easy')) return 'Easy Run'
  if (text.includes('recovery')) return 'Recovery Run'
  if (text.includes('tempo')) return 'Tempo Run'
  if (text.includes('long')) return 'Long Run'
  return value || 'Today’s Plan'
}

function simplifyIntensity(value) {
  const text = String(value || '').toLowerCase()
  if (text.includes('easy')) return 'Easy'
  if (text.includes('moderate') || text.includes('steady')) return 'Moderate'
  if (text.includes('hard')) return 'Hard'
  if (text.includes('rest')) return 'Rest'
  return value || '-'
}

function intensityColorClass(value) {
  const text = String(value || '').toLowerCase()
  if (text.includes('hard')) return 'text-red-600'
  if (text.includes('moderate')) return 'text-amber-500'
  if (text.includes('easy') || text.includes('recovery')) return 'text-emerald-600'
  return 'text-violet-700'
}

function intensityPillClass(value) {
  const text = String(value || '').toLowerCase()
  if (text.includes('hard')) return 'bg-red-50 text-red-600'
  if (text.includes('moderate')) return 'bg-amber-50 text-amber-600'
  if (text.includes('easy') || text.includes('recovery')) return 'bg-emerald-50 text-emerald-700'
  return 'bg-violet-100 text-violet-700'
}

function certaintyPillClass(value, theme = 'light') {
  const isDark = theme === 'dark'
  const text = String(value || '').toLowerCase()
  if (text.includes('moderate')) return isDark ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
  if (text.includes('light')) return isDark ? 'bg-amber-950 text-amber-300' : 'bg-amber-100 text-amber-800'
  return isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-700'
}

function calendarStripeClass(activities) {
  const first = activities[0]
  const kind = /run/i.test(String(first?.name || '')) || /run/i.test(String(first?.sport || ''))
    ? 'run'
    : /weight|strength|lift|mobility|stretch|yoga|pilates|core/i.test(String(first?.lift_focus || first?.name || first?.sport || ''))
      ? 'strength'
      : ''
  const intensity = simplifyIntensity(first?.intensity || first?.workout_type || '')
  const text = intensity.toLowerCase()
  if (text.includes('hard')) return 'bg-rose-500'
  if (text.includes('moderate')) return 'bg-amber-400'
  if (text.includes('easy') || text.includes('recovery')) return 'bg-emerald-500'
  if (kind === 'strength') return 'bg-sky-400'
  return 'bg-neutral-300'
}

function intensityIconTone(value) {
  const text = String(value || '').toLowerCase()
  if (text.includes('hard')) return 'bg-red-50 text-red-600'
  if (text.includes('moderate')) return 'bg-amber-50 text-amber-600'
  if (text.includes('easy') || text.includes('recovery')) return 'bg-emerald-50 text-emerald-700'
  return 'bg-violet-50 text-violet-600'
}

function shortPace(value) {
  const text = String(value || '').trim()
  if (!text) return '-'
  const match = text.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})(?:\s*min\/mi|\s*\/mi)?/i)
  if (match) return `${match[1]}–${match[2]}/mi`
  return text
}

function paceHeadline(value) {
  return shortPace(value)
}

function paceSupportText(value) {
  const text = String(value || '').toLowerCase()
  if (text.includes('easy')) return 'Easy aerobic range'
  if (text.includes('moderate') || text.includes('steady')) return 'Steady aerobic range'
  if (text.includes('hard')) return 'Hard effort range'
  return 'Target pace'
}

function shortLiftTitle(value) {
  const text = String(value || '').trim()
  if (!text) return 'No lift today'
  if (/lifting off-day|no lifting/i.test(text)) return 'No lift today'
  if (text.length <= 52) return text
  if (/single-leg|glute|posterior/i.test(text)) return 'Single-Leg + Posterior Chain'
  if (/upper/i.test(text)) return 'Upper Body + Core'
  return 'Strength Session'
}

function formatLiftBlocks(guidance) {
  const text = String(guidance || '').trim()
  if (!text) return []
  const setMatch = text.match(/(\d+)\s+(?:sets|rounds)\b/i)
  const setPrefix = setMatch ? `${setMatch[1]} sets` : ''
  const cleaned = text
    .replace(/\bafter the run\b.*?(?=(?:bulgarian|romanian|single-leg|split squat|glute bridge|hip thrust|dead bug|plank|calf raise|step-up))/i, '')
    .replace(/\b\d+\s*[–-]?\s*\d*\s*min(?:ute)?s?\b/gi, '')
    .replace(/\b\d+\s*rounds?\s*(?:of)?[:.]?/gi, '')
    .replace(/\bminutes?\s+total\b/gi, '')
    .replace(/^example circuit[:,]?\s*/i, '')
    .replace(/^circuit[:,]?\s*/i, '')
    .replace(/^then\s+/i, '')
    .replace(/keep .*$/i, '')
    .replace(/stop .*$/i, '')
    .replace(/move deliberately.*$/i, '')
    .replace(/controlled tempo.*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  const numberedMatches = Array.from(cleaned.matchAll(/(?:^|[\s;])\d+\)\s*([^;]+?)(?=(?:[\s;]\d+\)|$))/g))
  const numberedItems = numberedMatches.map((match) => match[1]?.trim()).filter(Boolean)

  const rawItems = numberedItems.length
    ? numberedItems
    : cleaned.split(/,\s*|\.\s*/).map((item) => item.trim())

  return rawItems
    .map((item) =>
      item
        .replace(/\([^)]*\)/g, '')
        .replace(/^\d+\)\s*/g, '')
        .replace(/\bper leg\b/gi, '/leg')
        .replace(/\beach leg\b/gi, '/leg')
        .replace(/\beach side\b/gi, '/side')
        .replace(/\bplus\b/gi, '')
        .replace(/\bafter the run\b/gi, '')
        .replace(/[.;]+$/g, '')
        .trim()
    )
    .filter((item) => item && !/^(total|minutes?|rounds?)\b/i.test(item))
    .map((item) => splitLiftExercise(item, setPrefix))
    .filter((item) => item.name && !/after the run|minutes total|rounds? of|session after|^total$|^total time$|^sets?$|^rounds?$/i.test(item.name))
    .slice(0, 5)
}

function splitLiftExercise(item, setPrefix = '') {
  const value = String(item || '').trim()
  if (!value) return { name: '', detail: '' }

  const normalized = value
    .replace(/^example\s*/i, '')
    .replace(/^plus\s*/i, '')
    .replace(/^circuit\s*/i, '')
    .replace(/^total\b[:\s-]*/i, '')
    .replace(/^session\b[:\s-]*/i, '')
    .replace(/^\d+\)\s*/g, '')
    .trim()

  const numberedChunk = normalized.match(/^(.*?)\s+(\d+\s*x\s*\d+(?:[–-]\d+)?(?:\/(?:leg|side))?|\d+(?:[–-]\d+)?(?:s)?(?:\/(?:leg|side))?)$/i)
  if (numberedChunk && !/^(after|later|run|day)$/i.test(numberedChunk[1].trim())) {
    return {
      name: titleCaseExercise(numberedChunk[1].replace(/[,:-]+$/g, '').trim()),
      detail: [setPrefix, numberedChunk[2].trim()].filter(Boolean).join(' · '),
    }
  }

  const numberFirst = normalized.match(/^(\d+(?:[–-]\d+)?(?:s)?(?:\/[a-z]+)?)\s+(.+)$/i)
  if (numberFirst) {
    return {
      name: titleCaseExercise(numberFirst[2].trim()),
      detail: [setPrefix, numberFirst[1].trim()].filter(Boolean).join(' · '),
    }
  }

  const match = normalized.match(/^(.*?)(\s\d.*)$/)
  if (match && !/minutes? total|rounds? of/i.test(match[1])) {
    return {
      name: titleCaseExercise(match[1].replace(/[,:-]+$/g, '').trim()),
      detail: [setPrefix, match[2].trim()].filter(Boolean).join(' · '),
    }
  }

  return { name: titleCaseExercise(normalized), detail: setPrefix }
}

function titleCaseExercise(text) {
  return String(text || '')
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase()
      if (['or', 'and', 'of', 'to'].includes(lower)) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')
}

function stripReasonPrefix(text, label) {
  const value = String(text || '').trim()
  if (!value) return ''
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return value.replace(new RegExp(`^${escaped}\\s*:\\s*`, 'i'), '')
}

function trimNumber(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return value
  return Number.isInteger(number) ? String(number) : number.toFixed(1)
}

function calendarPace(activity) {
  const paceText = String(activity.pace_text || activity.run_pace_guidance || '').trim()
  if (paceText) {
    const clockRange = paceText.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})(?:\s*min\/mi|\s*\/mi)?/i)
    if (clockRange) return `${clockRange[1]}-${clockRange[2]}/mi`

    const decimalRange = paceText.match(/(\d{1,2}\.\d{2})\s*[–-]\s*(\d{1,2}\.\d{2})\s*min\/mi/i)
    if (decimalRange) return `${decimalRange[1]}-${decimalRange[2]}/mi`
  }

  const pace = Number(activity.average_pace_min_per_mile)
  if (!Number.isFinite(pace) || pace <= 0) return '-'
  const minutes = Math.floor(pace)
  const seconds = Math.round((pace - minutes) * 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}/mi`
}

function calendarLiftFocus(activity) {
  const text = humanizeActivityLabel(activity.lift_focus || activity.name || '')
  if (!text || text === '-') return ''
  const compact = text
    .replace(/^lift$/i, 'Strength')
    .replace(/^weightlifting$/i, 'Weight Training')
    .replace(/^weight lifting$/i, 'Weight Training')
    .replace(/^weight training$/i, 'Weight Training')
    .replace(/^no lift today.*$/i, 'Off day')
    .replace(/\([^)]*\)/g, '')
    .replace(/[.;].*$/g, '')
    .replace(/,.*$/g, '')
    .replace(/\bkeep .*$/i, '')
    .replace(/\bmaintain .*$/i, '')
    .replace(/\bwithout .*$/i, '')
    .replace(/\bcreating .*$/i, '')
    .replace(/\band\b/gi, ' + ')
    .replace(/\bshort\b/gi, '')
    .replace(/\blow-volume\b/gi, '')
    .replace(/\blight strength\b/gi, '')
    .replace(/\bsession\b/gi, '')
    .replace(/\bshort\b/gi, '')
    .replace(/\bdurability\b/gi, 'Durability')
    .replace(/\bcontrol\b/gi, 'Control')
    .replace(/\bsingle-leg strength\b/gi, 'Single-Leg Strength')
    .replace(/\bsingle-leg stability\b/gi, 'Single-Leg')
    .replace(/\bsingle-leg control\b/gi, 'Single-Leg')
    .replace(/\bposterior chain\b/gi, 'Posterior Chain')
    .replace(/\blower-body\b/gi, 'Lower Body')
    .replace(/\bupper body\b/gi, 'Upper Body')
    .replace(/\bglutes\b/gi, 'Glutes')
    .replace(/\bcore\b/gi, 'Core')
    .replace(/\s*\+\s*/g, ' + ')
    .replace(/^lift$/i, 'Strength')
    .replace(/\s{2,}/g, ' ')
    .trim()
  if (/off day/i.test(compact)) return 'Off day'
  if (/^strength$/i.test(compact)) return ''
  if (/^weight training$/i.test(compact)) return 'Weight Training'
  if (/upper body/i.test(compact)) return /core/i.test(compact) ? 'Upper Body + Core' : 'Upper Body'
  if (/posterior chain/i.test(compact)) return /core/i.test(compact) ? 'Posterior Chain + Core' : /single-leg/i.test(compact) ? 'Posterior Chain + Single-Leg' : 'Posterior Chain'
  if (/single-leg strength|single-leg/i.test(compact)) return /glutes/i.test(compact) ? 'Single-Leg + Glutes' : 'Single-Leg'
  if (/lower body/i.test(compact)) return /single-leg/i.test(compact) ? 'Lower Body + Single-Leg' : 'Lower Body'
  if (/glutes/i.test(compact) && /core/i.test(compact)) return 'Glutes + Core'
  return compact || 'Strength'
}

function humanizeActivityLabel(value) {
  return String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function whoopRecoveryColor(value) {
  const number = Number(value)
  if (!number) return 'text-neutral-950'
  if (number >= 67) return 'text-emerald-600'
  if (number >= 34) return 'text-amber-500'
  return 'text-red-600'
}

function loadColor(recentMileage, weeklyMileageTarget) {
  const recent = Number(recentMileage)
  const target = Number(weeklyMileageTarget)
  if (!recent || !target) return 'text-neutral-950'
  return recent >= target * 0.85 ? 'text-emerald-600' : 'text-amber-500'
}

function currentDayStatusTone(status, theme = 'light') {
  const isDark = theme === 'dark'
  if (status === 'on_track') return isDark ? 'border-emerald-800 bg-emerald-950/30 text-emerald-100' : 'border-emerald-200 bg-emerald-50 text-emerald-900'
  if (status === 'in_progress') return isDark ? 'border-amber-800 bg-amber-950/30 text-amber-100' : 'border-amber-200 bg-amber-50 text-amber-900'
  return isDark ? 'border-sky-800 bg-sky-950/30 text-sky-100' : 'border-sky-200 bg-sky-50 text-sky-900'
}

function normalizePhysicalFeeling(value) {
  return value === 'injured' ? 'sore' : value
}

function normalizeClarificationValue(questionId, answer) {
  if (questionId === 'long_run_cap') {
    const match = String(answer || '').match(/(\d+(?:\.\d+)?)/)
    return match ? match[1] : answer
  }
  return answer
}

function ActivityLogSection({
  activityLog,
  noteDrafts,
  noteSaveState,
  onNoteChange,
  onSaveNote,
  theme = 'light',
}) {
  const isDark = theme === 'dark'
  const [filter, setFilter] = useState('all')
  const [selectedActivityKey, setSelectedActivityKey] = useState(null)
  const allActivities = flattenActivityLog(activityLog)
    .slice()
    .sort((a, b) => String(b.day || '').localeCompare(String(a.day || '')))
  const filterOptions = [
    { key: 'all', label: 'All Workouts', icon: <SparkleIcon className="h-4 w-4" /> },
    { key: 'runs', label: 'Running', icon: <RouteIcon className="h-4 w-4" /> },
    { key: 'strength', label: 'Weightlifting', icon: <DumbbellIcon className="h-4 w-4" /> },
  ]
  const filteredActivities = allActivities.filter((activity) => {
    if (filter === 'runs') return isRunActivity(activity)
    if (filter === 'strength') return !isRunActivity(activity)
    return true
  })
  const selectedActivity =
    filteredActivities.find((activity) => activity.activity_key === selectedActivityKey) || null
  const currentFilterLabel = filterOptions.find((option) => option.key === filter)?.label || 'All Workouts'

  function handleFilterChange(nextFilter) {
    setFilter(nextFilter)
    setSelectedActivityKey(null)
  }

  return (
    <section className={`mt-10 rounded-[2.3rem] border px-6 py-7 shadow-sm md:px-8 ${isDark ? `border-neutral-800 bg-neutral-900/95 ${darkGlow(true)}` : 'border-neutral-200 bg-white/95'}`}>
      <style>{`
        .workout-catalog-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(115, 115, 115, 0.7) transparent;
        }
        .workout-catalog-scroll::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .workout-catalog-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .workout-catalog-scroll::-webkit-scrollbar-thumb {
          background: rgba(115, 115, 115, 0.55);
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .workout-catalog-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.55);
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
      `}</style>
      <div>
        <h2 className={`text-4xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
          Workout Log
        </h2>
        <p className={`mt-3 max-w-3xl text-lg leading-8 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Review your completed workouts and add notes for future reference.
        </p>
      </div>

      <div className={`mt-6 inline-flex flex-wrap items-center gap-2 rounded-[1.1rem] border p-1.5 ${isDark ? 'border-neutral-800 bg-neutral-950/90' : 'border-neutral-200 bg-white'}`}>
        {filterOptions.map((option) => {
          const selected = option.key === filter
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => handleFilterChange(option.key)}
              className={`inline-flex items-center gap-2 rounded-[0.9rem] px-4 py-2.5 text-sm font-semibold transition ${
                selected
                  ? isDark
                    ? 'bg-white text-neutral-950'
                    : 'bg-neutral-950 text-white'
                  : isDark
                    ? 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                    : 'text-neutral-600 hover:bg-stone-50 hover:text-neutral-950'
              }`}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          )
        })}
      </div>

      <div className={`mt-6 overflow-hidden rounded-[2rem] border ${isDark ? `border-neutral-800 bg-neutral-950/90 ${darkGlow(true)}` : 'border-neutral-200 bg-white'}`}>
        <div className="grid h-[min(38rem,72vh)] grid-cols-1 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className={`min-h-0 border-b xl:border-b-0 xl:border-r ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
            <div className={`sticky top-0 z-10 border-b px-6 py-5 backdrop-blur ${isDark ? 'border-neutral-800 bg-neutral-950/95' : 'border-neutral-200 bg-white/95'}`}>
              <p className={`text-sm font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {currentFilterLabel}
              </p>
              <p className={`mt-2 text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                {filteredActivities.length} workouts
              </p>
            </div>

            <div className="workout-catalog-scroll h-[calc(min(38rem,72vh)-11rem)] overflow-y-auto">
              {filteredActivities.length > 0 ? filteredActivities.map((activity) => (
                <WorkoutCatalogListItem
                  key={activity.activity_key}
                  activity={activity}
                  isSelected={activity.activity_key === selectedActivityKey}
                  onSelect={() => setSelectedActivityKey(activity.activity_key)}
                  theme={theme}
                />
              )) : (
                <div className="px-6 py-10">
                  <p className={`text-base leading-7 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    No workouts match this filter yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="min-h-0">
            <div className="workout-catalog-scroll h-full overflow-y-auto px-6 py-6 md:px-8">
              {selectedActivity ? (
                <WorkoutCatalogDetail
                  activity={selectedActivity}
                  noteValue={noteDrafts[selectedActivity.activity_key] ?? selectedActivity.note ?? ''}
                  saveState={noteSaveState[selectedActivity.activity_key] || 'idle'}
                  onNoteChange={onNoteChange}
                  onSaveNote={onSaveNote}
                  theme={theme}
                />
              ) : (
                <WorkoutCatalogEmptyState theme={theme} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function isRunActivity(activity) {
  return /run/i.test(String(activity?.name || '')) || /run/i.test(String(activity?.sport || ''))
}

function workoutCatalogTitle(activity) {
  if (isRunActivity(activity)) {
    return humanizeActivityLabel(activity.workout_type || activity.name || 'Run')
  }
  return calendarLiftFocus(activity) || humanizeActivityLabel(activity.name || activity.sport || 'Workout')
}

function workoutCatalogSummary(activity) {
  if (isRunActivity(activity)) {
    const distance = activity.distance_miles ? `${trimNumber(activity.distance_miles)} mi` : '-'
    return `${distance} • ${calendarPace(activity)}`
  }
  return activity.duration_minutes ? `${activity.duration_minutes} min` : 'Strength session'
}

function workoutIntensityIndicator(activity) {
  const intensity = simplifyIntensity(activity.intensity || activity.workout_type || activity.name || '')
  const text = intensity.toLowerCase()
  if (text.includes('hard')) return 'bg-rose-500'
  if (text.includes('moderate')) return 'bg-amber-400'
  if (text.includes('easy') || text.includes('recovery')) return 'bg-emerald-500'
  if (isRunActivity(activity)) return 'bg-neutral-300'
  return 'bg-violet-500'
}

function WorkoutCatalogListItem({ activity, isSelected, onSelect, theme = 'light' }) {
  const isDark = theme === 'dark'
  const selectedClasses = isSelected
    ? isDark
      ? 'border-violet-500/70 bg-violet-950/25 shadow-[inset_4px_0_0_0_rgba(168,85,247,0.95)]'
      : 'border-violet-300 bg-violet-50 shadow-[inset_4px_0_0_0_rgba(139,92,246,0.95)]'
    : isDark
      ? 'border-transparent hover:bg-neutral-900/90'
      : 'border-transparent hover:bg-stone-50'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-4 border-b px-6 py-6 text-left transition ${selectedClasses} ${isDark ? 'border-neutral-800 text-white' : 'border-neutral-200 text-neutral-950'}`}
    >
      <div className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full ${workoutIntensityIndicator(activity)}`} />
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {formatDate(activity.day)}
        </p>
        <p className={`mt-2 text-[1.55rem] font-semibold leading-tight tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
          {workoutCatalogTitle(activity)}
        </p>
        <p className={`mt-2 text-lg ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
          {workoutCatalogSummary(activity)}
        </p>
      </div>
    </button>
  )
}

function WorkoutCatalogDetail({
  activity,
  noteValue,
  saveState,
  onNoteChange,
  onSaveNote,
  theme = 'light',
}) {
  const isDark = theme === 'dark'
  const isRun = isRunActivity(activity)
  const title = workoutCatalogTitle(activity)
  const buttonLabel = saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved' : 'Save note'
  const intensity = simplifyIntensity(activity.intensity || activity.workout_type || activity.name || '')
  const metrics = isRun
    ? [
        { label: 'Distance', value: activity.distance_miles ? `${trimNumber(activity.distance_miles)} mi` : '-' },
        { label: 'Pace', value: calendarPace(activity) },
        { label: 'Duration', value: activity.duration_minutes ? `${activity.duration_minutes} min` : '-' },
        { label: 'Intensity', value: intensity || '-' },
      ]
    : [
        { label: 'Workout', value: title },
        { label: 'Duration', value: activity.duration_minutes ? `${activity.duration_minutes} min` : '-' },
        ...(activity.strain ? [{ label: 'Strain', value: String(activity.strain) }] : []),
        ...(activity.lift_focus ? [{ label: 'Focus', value: calendarLiftFocus(activity) || '-' }] : []),
      ]
  const supportingText = isRun
    ? activity.duration_minutes
      ? `${activity.duration_minutes} min total`
      : 'Logged run'
    : activity.strain
      ? `WHOOP strain ${activity.strain}`
      : 'Logged lift'

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className={`h-3.5 w-3.5 rounded-full ${workoutIntensityIndicator(activity)}`} />
        <p className={`text-sm font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {isRun ? 'Running' : 'Weightlifting'}
        </p>
      </div>

      <h3 className={`mt-4 text-4xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
        {title}
      </h3>
      <p className={`mt-2 text-lg ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>{formatDate(activity.day)}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {metrics.map((item) => (
          <div
            key={`${activity.activity_key}-${item.label}`}
            className={`rounded-[1.35rem] border px-5 py-5 ${isDark ? `border-neutral-800 bg-neutral-900/90 ${darkGlow(true)}` : 'border-neutral-200 bg-stone-50'}`}
          >
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
              {item.label}
            </p>
            <p className={`mt-3 text-2xl font-semibold leading-tight tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className={`mt-6 rounded-[1.5rem] border px-5 py-5 ${isDark ? `border-neutral-800 bg-neutral-900/90 ${darkGlow(true)}` : 'border-neutral-200 bg-stone-50'}`}>
        <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          Notes & Reflection
        </p>
        <p className={`mt-3 text-sm leading-7 ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
          Capture how it felt, what went well, anything to adjust next time, and any signals the coach should remember.
        </p>
        <textarea
          value={noteValue}
          onChange={(event) => onNoteChange(activity.activity_key, event.target.value)}
          placeholder="How did this workout feel? Any observations, adjustments, soreness, or wins the coach should remember?"
          className={`mt-5 min-h-[16rem] w-full rounded-[1.2rem] border px-4 py-4 text-base leading-7 outline-none transition ${isDark ? 'border-neutral-700 bg-neutral-950 text-white placeholder:text-neutral-500' : 'border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400'}`}
        />
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
            Saved notes are reused the next time the model evaluates your training. {supportingText}
          </p>
          <button
            type="button"
            onClick={() => onSaveNote(activity.activity_key)}
            disabled={saveState === 'saving'}
            className={`rounded-full px-5 py-3 text-sm font-semibold ${isDark ? 'bg-white text-neutral-950 disabled:bg-neutral-700 disabled:text-neutral-400' : 'bg-neutral-950 text-white disabled:bg-neutral-200 disabled:text-neutral-500'}`}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function WorkoutCatalogEmptyState({ theme = 'light' }) {
  const isDark = theme === 'dark'

  return (
    <div className={`flex min-h-[30rem] items-center justify-center rounded-[1.6rem] border border-dashed text-center ${isDark ? 'border-neutral-800 bg-neutral-900/50 text-neutral-500' : 'border-neutral-200 bg-stone-50 text-neutral-400'}`}>
      <div className="max-w-sm px-6">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isDark ? 'bg-neutral-900 text-neutral-600' : 'bg-white text-neutral-300'}`}>
          <SparkleIcon className="h-7 w-7" />
        </div>
        <p className={`mt-6 text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
          Select a workout
        </p>
        <p className={`mt-3 text-base leading-7 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          Choose a workout from the left page to view full details and write notes.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('arc-theme') || 'light'
    } catch {
      return 'light'
    }
  })
  const [summaryData, setSummaryData] = useState(null)
  const [recommendationData, setRecommendationData] = useState(null)
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [physicalFeeling, setPhysicalFeeling] = useState('normal')
  const [mentalFeeling, setMentalFeeling] = useState('steady')
  const [notes, setNotes] = useState('')
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false)
  const [isTodayActivityOpen, setIsTodayActivityOpen] = useState(false)
  const [profileSettings, setProfileSettings] = useState(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [activityNoteDrafts, setActivityNoteDrafts] = useState({})
  const [activityNoteSaveState, setActivityNoteSaveState] = useState({})
  const isDark = theme === 'dark'

  useEffect(() => {
    try {
      localStorage.setItem('arc-theme', theme)
    } catch {
      // ignore storage issues in local/dev contexts
    }
  }, [theme])

  useEffect(() => {
    const nextDrafts = {}
    flattenActivityLog(summaryData?.activity_log).forEach((activity) => {
      nextDrafts[activity.activity_key] = activity.note || ''
    })
    if (summaryData?.activity_log) {
      setActivityNoteDrafts(nextDrafts)
    }
  }, [summaryData?.activity_log])

  async function loadDashboard(signal) {
    const response = await fetch('/api/dashboard', signal ? { signal } : undefined)
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }
    const payload = await response.json()
    setSummaryData(payload)
    setProfileSettings(payload.profile_settings ?? null)
  }

  useEffect(() => {
    const controller = new AbortController()

    loadDashboard(controller.signal).catch((err) => {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unknown error')
      }
    })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!isCheckInModalOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsCheckInModalOpen(false)
    }
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isCheckInModalOpen])

  useEffect(() => {
    if (!isTodayActivityOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsTodayActivityOpen(false)
    }
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isTodayActivityOpen])

  async function persistProfileSettings(nextSettings, { closeAfterSave = false } = {}) {
    setIsSavingProfile(true)
    setError('')
    try {
      const response = await fetch('/api/profile-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextSettings),
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || `Profile save failed with status ${response.status}`)
      }
      setProfileSettings(payload.profile_settings ?? nextSettings)
      await loadDashboard()
      if (closeAfterSave) setIsProfileOpen(false)
    } catch (err) {
      setError(err.message || 'Unknown error')
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handleGenerateRecommendation() {
    setIsGenerating(true)
    setError('')
    setIsCheckInModalOpen(false)
    try {
      const response = await fetch('/api/recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          physical_feeling: normalizePhysicalFeeling(physicalFeeling),
          mental_feeling: mentalFeeling,
          notes: physicalFeeling === 'injured' ? `${notes}\nPossible injury or sharp pain noted.`.trim() : notes,
        }),
      })

      if (!response.ok) {
        throw new Error(`Recommendation request failed with status ${response.status}`)
      }

      const payload = await response.json()
      setSummaryData(payload)
      setProfileSettings(payload.profile_settings ?? null)
      setRecommendationData(payload.recommendation ?? null)
    } catch (err) {
      setError(err.message || 'Unknown error')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSaveActivityNote(activityKey) {
    setActivityNoteSaveState((current) => ({ ...current, [activityKey]: 'saving' }))
    setError('')
    try {
      const response = await fetch('/api/activity-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_key: activityKey,
          note: activityNoteDrafts[activityKey] ?? '',
        }),
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || `Activity note save failed with status ${response.status}`)
      }
      setSummaryData(payload)
      setProfileSettings(payload.profile_settings ?? null)
      setActivityNoteSaveState((current) => ({ ...current, [activityKey]: 'saved' }))
      window.setTimeout(() => {
        setActivityNoteSaveState((current) => ({ ...current, [activityKey]: 'idle' }))
      }, 1400)
    } catch (err) {
      setActivityNoteSaveState((current) => ({ ...current, [activityKey]: 'idle' }))
      setError(err.message || 'Unknown error')
    }
  }

  if (error) return <ErrorScreen message={error} theme={theme} />
  if (!summaryData) return <DashboardLoading theme={theme} />

  const profile = summaryData.profile ?? {}
  const summary = summaryData.summary ?? {}
  const previousRun = summary.previous_run ?? {}
  const currentDayStatus = summary.current_day_status ?? null
  const adaptiveWeeklyTarget = Number(summaryData.weekly_focus?.mileage_target || 0)
  const recoveryAccent = whoopRecoveryColor(summary.latest_recovery)
  const loadAccent = loadColor(summary.recent_mileage, adaptiveWeeklyTarget)

  const handleProfileFieldChange = (field, value) => {
    setProfileSettings((current) => ({ ...(current ?? {}), [field]: value }))
  }

  const handleSaveProfile = async () => {
    if (!profileSettings) return
    await persistProfileSettings(profileSettings, { closeAfterSave: true })
  }

  return (
    <main
      className={`min-h-screen ${
        isDark
          ? 'bg-[radial-gradient(circle_at_top,_rgba(58,28,112,0.26),_transparent_34%),radial-gradient(circle_at_50%_28%,_rgba(76,29,149,0.14),_transparent_30%),radial-gradient(circle_at_50%_72%,_rgba(49,25,97,0.12),_transparent_38%),linear-gradient(180deg,_#17131d_0%,_#1c1628_18%,_#241c37_38%,_#1b1725_60%,_#241c37_82%,_#151219_100%)] text-neutral-50'
          : 'bg-[radial-gradient(circle_at_top,_#f4f0ff,_#f7f4ee_48%,_#f7f4ee)] text-neutral-950'
      }`}
    >
      <div className="mx-auto max-w-7xl px-8 py-10">
        <Header
          name={profile.name}
          today={summaryData.today}
          goalRaceDate={profile.goal_race_date}
          theme={theme}
          onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        <RecommendationLauncher
          onOpen={() => setIsCheckInModalOpen(true)}
          theme={theme}
          hasRecommendation={Boolean(recommendationData)}
          isGenerating={isGenerating}
        />

        <CheckInModal
          isOpen={isCheckInModalOpen}
          physicalFeeling={physicalFeeling}
          mentalFeeling={mentalFeeling}
          notes={notes}
          isGenerating={isGenerating}
          onClose={() => setIsCheckInModalOpen(false)}
          onPhysicalChange={setPhysicalFeeling}
          onMentalChange={setMentalFeeling}
          onNotesChange={setNotes}
          onGenerate={handleGenerateRecommendation}
          theme={theme}
        />

        <TodayActivityModal
          isOpen={isTodayActivityOpen}
          onClose={() => setIsTodayActivityOpen(false)}
          currentDayStatus={currentDayStatus}
          recommendation={recommendationData}
          theme={theme}
        />

        {recommendationData ? (
          <div className="mt-2">
            <TrainingCard
              recommendation={recommendationData}
              recommendationExplanation={summaryData.recommendation_explanation}
              today={summaryData.today}
              onUpdateCheckIn={() => setIsCheckInModalOpen(true)}
              theme={theme}
            />
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-6 py-10 md:grid-cols-2 xl:grid-cols-3">
          <StatCard
            icon={<Icon path="M12 6v6l4 2M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z" />}
            label="Sleep"
            value={summary.latest_sleep_hours ? `${summary.latest_sleep_hours.toFixed(1)} hrs` : '-'}
            subtext="Latest WHOOP sleep duration"
            iconTone={theme === 'dark' ? 'bg-white text-neutral-900' : 'bg-neutral-100 text-neutral-900'}
            theme={theme}
          />
          <StatCard
            icon={<Icon path="M3 12h4l2-5l4 10l2-5h6" />}
            label="Recovery"
            value={summary.latest_recovery ? `${summary.latest_recovery}%` : '-'}
            subtext="Latest WHOOP recovery score"
            accent={recoveryAccent}
            iconTone={
              theme === 'dark'
                ? 'bg-[#ecfff7] text-emerald-600'
                : summary.latest_recovery >= 67
                  ? 'bg-emerald-50 text-emerald-600'
                  : summary.latest_recovery >= 34
                    ? 'bg-amber-50 text-amber-500'
                    : 'bg-red-50 text-red-600'
            }
            theme={theme}
          />
          <StatCard
            icon={<HeartOutlineIcon />}
            label="Resting HR"
            value={summary.latest_resting_hr ? `${summary.latest_resting_hr}` : '-'}
            subtext="Most recent resting heart rate"
            accent="text-violet-700"
            iconTone={theme === 'dark' ? 'bg-white text-violet-600' : 'bg-violet-50 text-violet-700'}
            theme={theme}
          />
          <StatCard
            icon={<Icon path="M13 2L4 14h6l-1 8l9-12h-6l1-8Z" />}
            label="Yesterday’s Strain"
            value={summary.latest_strain ? `${summary.latest_strain}` : '-'}
            subtext="WHOOP strain from yesterday"
            accent="text-sky-600"
            iconTone={theme === 'dark' ? 'bg-white text-sky-600' : 'bg-sky-50 text-sky-600'}
            theme={theme}
          />
          <StatCard
            icon={<RouteIcon />}
            label="Last Run Mileage"
            value={previousRun.distance_miles ? `${previousRun.distance_miles} mi` : '-'}
            subtext={
              previousRun.day
                ? `${formatDate(previousRun.day)} · ${previousRun.duration_minutes || 0} min`
                : 'Most recent run'
            }
            iconTone={theme === 'dark' ? 'bg-white text-neutral-900' : 'bg-neutral-100 text-neutral-900'}
            theme={theme}
          />
          <StatCard
            icon={<Icon path="M5 19h4V9H5zm5 0h4V5h-4zm5 0h4v-7h-4z" />}
            label="Weekly Mileage Progress"
            value={
              summary.recent_mileage && adaptiveWeeklyTarget
                ? `${summary.recent_mileage.toFixed(1)} / ${adaptiveWeeklyTarget.toFixed(1)} mi`
                : summary.recent_mileage
                  ? `${summary.recent_mileage.toFixed(1)} mi`
                  : '-'
            }
            subtext="Mileage completed toward this week's adaptive target"
            accent={loadAccent}
            iconTone={
              theme === 'dark'
                ? loadAccent === 'text-emerald-600'
                  ? 'bg-[#ecfff7] text-emerald-600'
                  : 'bg-[#fff6e8] text-amber-500'
                : loadAccent === 'text-emerald-600'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-amber-50 text-amber-500'
            }
            theme={theme}
          />
        </section>

        <TodayActivityButton
          onOpen={() => setIsTodayActivityOpen(true)}
          currentDayStatus={currentDayStatus}
          theme={theme}
        />

        <MasterTrainingCalendar
          cards={summaryData.activity_calendar}
          weeklyFocus={summaryData.weekly_focus}
          weeks={summaryData.training_roadmap}
          theme={theme}
        />

        <ActivityLogSection
          activityLog={summaryData.activity_log}
          noteDrafts={activityNoteDrafts}
          noteSaveState={activityNoteSaveState}
          onNoteChange={(activityKey, value) => {
            setActivityNoteDrafts((current) => ({ ...current, [activityKey]: value }))
            setActivityNoteSaveState((current) => ({ ...current, [activityKey]: 'idle' }))
          }}
          onSaveNote={handleSaveActivityNote}
          theme={theme}
        />
      </div>

      <ProfileSettingsPanel
        isOpen={isProfileOpen}
        profileSettings={profileSettings}
        isSaving={isSavingProfile}
        onClose={() => setIsProfileOpen(false)}
        onChange={handleProfileFieldChange}
        onSave={handleSaveProfile}
        theme={theme}
      />
    </main>
  )
}

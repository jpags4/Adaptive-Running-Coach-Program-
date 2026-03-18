import { useEffect, useState } from 'react'

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
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 16.5h8.6l2.2-3.1 2.6 1 3.6 2.1H21" />
      <path d="M6 16.5v-2.7l2.1-1.8h2.7l1.8-3.7h1.7l1.9 1.8" />
      <path d="M13.9 10.7l1.8 1.4" />
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
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 10v4M7 8v8M17 8v8M20 10v4" />
      <path d="M7 12h10" />
    </svg>
  )
}

function TargetIcon({ className = 'h-5 w-5' }) {
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
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
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
          ? 'bg-[radial-gradient(circle_at_top,_#2b1f3f,_#111111_45%,_#111111)] text-neutral-50'
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

function ErrorScreen({ message, theme = 'light' }) {
  const isDark = theme === 'dark'
  return (
    <main
      className={`min-h-screen ${
        isDark
          ? 'bg-[radial-gradient(circle_at_top,_#2b1f3f,_#111111_45%,_#111111)] text-neutral-50'
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

function Header({ name, today, goalRaceDate, theme, onToggleTheme }) {
  const isDark = theme === 'dark'
  return (
    <header className={`flex items-start justify-between gap-8 border-b pb-8 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
      <div>
        <h1 className={`text-6xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
          Good morning, {name || 'Athlete'}
        </h1>
        <p className={`mt-3 text-2xl ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{formatDate(today)}</p>
        <p className={`mt-10 text-sm font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
          Adaptive Running Coach
        </p>
      </div>

      <div className="flex flex-col items-end gap-6 pt-1 text-right">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
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
    <div className={`min-h-[14rem] rounded-[1.9rem] border px-6 py-6 shadow-sm ${isDark ? 'border-neutral-800 bg-neutral-900/95' : 'border-neutral-200 bg-white/90'}`}>
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

function CheckInCard({
  physicalFeeling,
  mentalFeeling,
  notes,
  isGenerating,
  isCollapsed,
  onOpen,
  onPhysicalChange,
  onMentalChange,
  onNotesChange,
  onGenerate,
  theme = 'light',
}) {
  const isDark = theme === 'dark'
  if (isCollapsed) {
    return (
      <section className={`rounded-[2rem] border p-6 shadow-sm ${isDark ? 'border-neutral-800 bg-neutral-900/95' : 'border-neutral-200 bg-white/90'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Daily Check-In
            </p>
            <p className={`mt-2 text-base ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Legs: <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-950'}`}>{capitalize(physicalFeeling)}</span>
              {' · '}
              Mind: <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-950'}`}>{capitalize(mentalFeeling)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onOpen}
            className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
              isDark
                ? 'border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-violet-500 hover:text-white'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-violet-300 hover:text-neutral-950'
            }`}
          >
            Update Check-In
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={`rounded-[2rem] border p-8 shadow-sm ${isDark ? 'border-neutral-800 bg-neutral-900/95' : 'border-neutral-200 bg-white/90'}`}>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-3xl">
          <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Daily Check-In
          </p>
          <h2 className={`mt-4 text-4xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
            Let&apos;s get started with a few questions, then generate today&apos;s recommendation.
          </h2>
          <p className={`mt-4 text-lg leading-8 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
            Your biometrics and recent running load are already here. This check-in lets the model
            account for sore legs, stress, and how you actually feel before it locks in the plan.
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className={`inline-flex items-center gap-3 rounded-full px-6 py-4 text-sm font-semibold transition ${
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

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            How do your legs feel?
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {['fresh', 'normal', 'heavy', 'sore', 'injured'].map((option) => (
              <PromptButton
                key={option}
                active={physicalFeeling === option}
                onClick={() => onPhysicalChange(option)}
                theme={theme}
              >
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
              <PromptButton
                key={option}
                active={mentalFeeling === option}
                onClick={() => onMentalChange(option)}
                theme={theme}
              >
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
          className={`mt-4 min-h-28 w-full rounded-[1.5rem] border px-5 py-4 text-base leading-7 outline-none transition placeholder:text-neutral-400 focus:border-violet-400 ${
            isDark
              ? 'border-neutral-800 bg-neutral-950 text-neutral-100'
              : 'border-neutral-200 bg-stone-50 text-neutral-800'
          }`}
        />
      </div>
    </section>
  )
}

function TrainingCard({ recommendation, today, theme = 'light' }) {
  if (!recommendation) return null

  const isDark = theme === 'dark'
  const sections = recommendation.explanation_sections ?? {}
  const summary = stripReasonPrefix(
    Array.isArray(recommendation.explanation) ? recommendation.explanation[0] : '',
    'overall'
  )
  const isLiftOffDay = /lifting off-day|no lifting/i.test(String(recommendation.lift_focus || ''))
  const liftBlocks = isLiftOffDay ? [] : formatLiftBlocks(recommendation.lift_guidance)
  const intensityLabel = simplifyIntensity(recommendation.intensity)
  const intensityClass = intensityColorClass(intensityLabel)

  return (
    <section className={`rounded-[2rem] border p-8 shadow-sm ${isDark ? 'border-neutral-800 bg-neutral-900/95' : 'border-neutral-200 bg-white/95'}`}>
      <div className="flex flex-wrap items-center gap-4">
        <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          Today’s Training
        </p>
        <span className={`rounded-full px-4 py-2 text-sm font-semibold ${intensityPillClass(intensityLabel)}`}>
          {shortWorkoutTitle(recommendation.workout)}
        </span>
      </div>

      <div className={`mt-8 rounded-[1.75rem] border px-5 py-4 text-lg leading-8 ${
        isDark
          ? 'border-violet-900/40 bg-[linear-gradient(135deg,_rgba(109,40,217,0.22),_rgba(255,255,255,0.015))] text-neutral-100'
          : 'border-violet-100 bg-[linear-gradient(135deg,_rgba(109,40,217,0.12),_rgba(0,0,0,0.015))] text-neutral-800'
      }`}>
        {summary || 'Your recommendation summary will appear here.'}
      </div>

      <div className="mt-10 grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)]">
        <div className={`self-start rounded-[1.75rem] border p-5 shadow-sm ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-white'}`}>
          <div className={`flex items-center gap-2.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDark ? 'bg-emerald-950/70 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <RouteIcon />
            </div>
            <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Run
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="min-w-0">
              <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Distance
              </p>
              <p className={`mt-2 text-6xl font-semibold leading-none tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                {recommendation.run_distance_miles ?? '-'} mi
              </p>
            </div>

            <div className="min-w-0">
              <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Pace
              </p>
              <p className={`mt-2 text-3xl font-semibold leading-tight tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                {paceHeadline(recommendation.run_pace_guidance)}
              </p>
              <p className={`mt-2 text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {paceSupportText(recommendation.run_pace_guidance)}
              </p>
            </div>
          </div>

          <div className={`mt-6 border-t pt-5 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
            <div className="min-w-0">
              <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Intensity
              </p>
              <p className={`mt-2 break-words text-4xl font-semibold leading-tight tracking-tight ${intensityClass}`}>
                {intensityLabel}
              </p>
              <p className={`mt-2 text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {recommendation.duration_minutes ? `${recommendation.duration_minutes} min total` : ''}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-[1.75rem] border p-6 ${isDark ? 'border-neutral-800 bg-neutral-950/80' : 'border-neutral-200 bg-stone-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isDark ? 'bg-violet-950/70 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
              <DumbbellIcon />
            </div>
            <div>
              <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Lift
              </p>
              <h3 className={`mt-1 text-3xl font-semibold leading-[1.05] tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
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
                  className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${isDark ? 'border-neutral-800 bg-neutral-900 text-neutral-300' : 'border-neutral-200 bg-white text-neutral-700'}`}
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

      <details className={`mt-8 rounded-2xl border ${isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-white'}`}>
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
            Past days show what you actually did. Future days are projections based on your current progress and update as new data comes in.
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
  const isRestDay = activities.length === 0
  const date = new Date(`${card.day}T12:00:00`)
  const weekdayShort = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date).toUpperCase()
  const dayNumber = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(date)

  return (
    <div
      className={`relative min-h-[6.2rem] overflow-hidden rounded-[1.3rem] border px-3 pb-3 pt-2.5 shadow-sm ${
        card.is_today
          ? isDark
            ? 'border-2 border-white bg-neutral-900'
            : 'border-2 border-neutral-950 bg-white'
          : isDark
            ? 'border-neutral-800 bg-neutral-900/90'
            : 'border-neutral-200 bg-white'
      }`}
    >
      {!card.is_today ? <div className={`absolute inset-y-3 left-0 w-1.5 rounded-full ${stripeClass}`} /> : null}

      {card.is_today ? (
        <div
          className={`-mx-3 -mt-2.5 mb-2.5 px-3 pb-2.5 pt-2.5 ${
            isDark
              ? 'rounded-t-[1.15rem] border-neutral-200 bg-white text-neutral-950'
              : 'rounded-t-[1.15rem] border-neutral-950 bg-neutral-950 text-white'
          }`}
        >
          <p className="text-sm font-semibold tracking-tight">{weekdayShort}</p>
          <p className="mt-1.5 text-2xl font-semibold leading-none tracking-tight">{dayNumber}</p>
        </div>
      ) : (
        <div>
          <p className={`text-sm font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
            {weekdayShort}
          </p>
          <p className={`mt-1.5 text-2xl font-semibold leading-none tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
            {dayNumber}
          </p>
        </div>
      )}

      <div
        className={`${
          card.is_today ? '' : 'mt-3'
        } ${isRestDay ? 'pt-1.5' : `border-t pt-2.5 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}`}
      >
        {activities.length === 0 ? (
          <p className={`text-base italic ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>Rest Day</p>
        ) : (
          <div className="space-y-2.5">
            {activities.map((activity, index) => (
              <CalendarActivity
                key={`${activity.name}-${index}-${activity.day || ''}`}
                activity={activity}
                theme={theme}
              />
            ))}
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

  return (
    <div className="border-b border-neutral-200 pb-2.5 last:border-b-0 last:pb-0">
      {isRun ? (
        <>
          <p className={`text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
            {activity.distance_miles ? `${trimNumber(activity.distance_miles)} mi` : '-'}
          </p>
          <p className={`mt-1 text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{calendarPace(activity)}</p>
        </>
      ) : (
        <p className={`text-sm leading-6 ${isDark ? 'text-neutral-300' : 'text-neutral-500'}`}>
          {calendarLiftFocus(activity)}
        </p>
      )}

      <span className={`mt-2 inline-flex rounded-2xl px-2.5 py-1 text-sm font-medium ${intensityPillClass(intensity)}`}>
        {intensity.toLowerCase()}
      </span>
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
    <div className={`rounded-[1.75rem] border p-5 ${toneMap[tone]} ${fullWidth ? 'w-full' : ''}`}>
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
  const first = cards[0]?.day
  if (!first) return 'Training Calendar'
  const date = new Date(`${first}T12:00:00`)
  return `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date)} Training Calendar`
}

function shortWorkoutTitle(value) {
  const text = String(value || '').trim().toLowerCase()
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

function calendarStripeClass(activities) {
  const first = activities[0]
  const intensity = simplifyIntensity(first?.intensity || first?.workout_type || '')
  const text = intensity.toLowerCase()
  if (text.includes('hard')) return 'bg-rose-500'
  if (text.includes('moderate')) return 'bg-amber-400'
  if (text.includes('easy') || text.includes('recovery')) return 'bg-emerald-500'
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
  const text = String(activity.lift_focus || activity.name || '').trim()
  if (!text) return 'Strength'
  const compact = text
    .replace(/^lift$/i, 'Strength')
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
  if (/upper body/i.test(compact)) return /core/i.test(compact) ? 'Upper Body + Core' : 'Upper Body'
  if (/posterior chain/i.test(compact)) return /core/i.test(compact) ? 'Posterior Chain + Core' : /single-leg/i.test(compact) ? 'Posterior Chain + Single-Leg' : 'Posterior Chain'
  if (/single-leg strength|single-leg/i.test(compact)) return /glutes/i.test(compact) ? 'Single-Leg + Glutes' : 'Single-Leg'
  if (/lower body/i.test(compact)) return /single-leg/i.test(compact) ? 'Lower Body + Single-Leg' : 'Lower Body'
  if (/glutes/i.test(compact) && /core/i.test(compact)) return 'Glutes + Core'
  return compact || 'Strength'
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

function normalizePhysicalFeeling(value) {
  return value === 'injured' ? 'sore' : value
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
  const [isCheckInCollapsed, setIsCheckInCollapsed] = useState(false)
  const isDark = theme === 'dark'

  useEffect(() => {
    try {
      localStorage.setItem('arc-theme', theme)
    } catch {
      // ignore storage issues in local/dev contexts
    }
  }, [theme])

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      try {
        const response = await fetch('/api/dashboard')
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const payload = await response.json()
        if (!cancelled) setSummaryData(payload)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unknown error')
      }
    }

    loadDashboard()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleGenerateRecommendation() {
    setIsGenerating(true)
    setError('')
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
      setRecommendationData(payload.recommendation ?? null)
      setIsCheckInCollapsed(true)
    } catch (err) {
      setError(err.message || 'Unknown error')
    } finally {
      setIsGenerating(false)
    }
  }

  if (error) return <ErrorScreen message={error} theme={theme} />
  if (!summaryData) return <DashboardLoading theme={theme} />

  const profile = summaryData.profile ?? {}
  const summary = summaryData.summary ?? {}
  const previousRun = summary.previous_run ?? {}
  const recoveryAccent = whoopRecoveryColor(summary.latest_recovery)
  const loadAccent = loadColor(summary.recent_mileage, profile.weekly_mileage_target)

  return (
    <main
      className={`min-h-screen ${
        isDark
          ? 'bg-[radial-gradient(circle_at_top,_#2b1f3f,_#111111_45%,_#111111)] text-neutral-50'
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
        />

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
            label="Yesterday’s Miles"
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
            label="7-Day Load"
            value={summary.recent_mileage ? `${summary.recent_mileage.toFixed(1)} mi` : '-'}
            subtext="Running load this week"
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

        <CheckInCard
          physicalFeeling={physicalFeeling}
          mentalFeeling={mentalFeeling}
          notes={notes}
          isGenerating={isGenerating}
          isCollapsed={isCheckInCollapsed}
          onOpen={() => setIsCheckInCollapsed(false)}
          onPhysicalChange={setPhysicalFeeling}
          onMentalChange={setMentalFeeling}
          onNotesChange={setNotes}
          onGenerate={handleGenerateRecommendation}
          theme={theme}
        />

        {recommendationData ? (
          <div className="mt-8">
            <TrainingCard recommendation={recommendationData} today={summaryData.today} theme={theme} />
          </div>
        ) : null}

        <TrainingCalendar cards={summaryData.activity_calendar} theme={theme} />
      </div>
    </main>
  )
}

import { useEffect, useRef, useState } from 'react'

const DARK_HOVER_GLOW = 'transition duration-200 hover:border-violet-500/55 hover:shadow-[0_0_0_1px_rgba(168,85,247,0.18),0_0_34px_rgba(168,85,247,0.18)]'

function darkGlow(enabled) {
  return enabled ? DARK_HOVER_GLOW : ''
}

function GlobalUiStyles() {
  return (
    <style>{`
      @keyframes violetCurrent {
        0% {
          background-position: 200% center;
          filter: drop-shadow(0 0 0.18rem rgba(168, 85, 247, 0.08));
        }
        100% {
          background-position: -200% center;
          filter: drop-shadow(0 0 0.3rem rgba(168, 85, 247, 0.14));
        }
      }

      html,
      body,
      #root {
        background: #090909;
      }

      html,
      body,
      #root {
        scrollbar-width: thin;
        scrollbar-color: #2f2f2f #050505;
      }

      html::-webkit-scrollbar,
      body::-webkit-scrollbar,
      #root::-webkit-scrollbar {
        width: 10px;
        background: #050505;
      }

      html::-webkit-scrollbar-track,
      body::-webkit-scrollbar-track,
      #root::-webkit-scrollbar-track {
        background: #050505;
      }

      html::-webkit-scrollbar-thumb,
      body::-webkit-scrollbar-thumb,
      #root::-webkit-scrollbar-thumb {
        background: #2f2f2f;
        border-radius: 999px;
        border: 2px solid #050505;
      }

      html::-webkit-scrollbar-thumb:hover,
      body::-webkit-scrollbar-thumb:hover,
      #root::-webkit-scrollbar-thumb:hover {
        background: #444444;
      }

      html::-webkit-scrollbar-corner,
      body::-webkit-scrollbar-corner,
      #root::-webkit-scrollbar-corner {
        background: #050505;
      }

      /* Scrollbar styling only — background is controlled by React theme */
      .recommendation-modal-scroll {
        scrollbar-width: thin;
        scrollbar-color: #3f3f3f transparent;
      }

      .recommendation-modal-scroll::-webkit-scrollbar {
        width: 8px;
      }

      .recommendation-modal-scroll::-webkit-scrollbar-track {
        background: transparent;
      }

      .recommendation-modal-scroll::-webkit-scrollbar-thumb {
        background: #3f3f3f;
        border-radius: 999px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }

      .recommendation-modal-scroll::-webkit-scrollbar-thumb:hover {
        background: #6d28d9;
        border: 2px solid transparent;
        background-clip: padding-box;
      }
    `}</style>
  )
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
        isDark
          ? 'border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-violet-500 hover:text-white'
          : 'border-neutral-200 bg-white text-neutral-600 hover:border-violet-300 hover:text-neutral-900'
      }`}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8Z" />
        </svg>
      )}
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

function BarChartIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  )
}

function RunningShoeIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M21.481 14.068l-2.2-6.585a1 1 0 0 0-.949-.683a4.865 4.865 0 0 1-2.893-.907A7.623 7.623 0 0 1 13.976 2.78a1 1 0 0 0-1.683-.487l-6 6a1 1 0 0 0 .016 1.43l12.537 12a1 1 0 0 0 1.4-.016l1.654-1.658a3.75 3.75 0 0 0 0-5.3a1.751 1.751 0 0 1-.419-.681Zm-.992 4.567l-.967.967L8.43 8.984l4.114-4.114a7.358 7.358 0 0 0 1.486 2.437A6.076 6.076 0 0 0 17.6 8.757l1.983 5.943a3.778 3.778 0 0 0 .906 1.464a1.75 1.75 0 0 1 0 2.471ZM1 17a1 1 0 0 1 1-1h8a1 1 0 0 1 0 2H2a1 1 0 0 1-1-1Zm0-4a1 1 0 0 1 1-1H6a1 1 0 0 1 0 2H2a1 1 0 0 1-1-1Zm0 8a1 1 0 0 1 1-1H14a1 1 0 0 1 0 2H2a1 1 0 0 1-1-1Z" />
    </svg>
  )
}

function HeartOutlineIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 20.25s-7-4.67-7-10.48c0-2.63 2-4.52 4.47-4.52c1.42 0 2.57.65 3.53 1.98c.96-1.33 2.11-1.98 3.53-1.98c2.47 0 4.47 1.89 4.47 4.52c0 5.81-7 10.48-7 10.48Z" />
      <path d="M6.35 11.65h2.05l1.15-2.2l1.55 4.2l1.45-3h2.9" />
    </svg>
  )
}

function BatteryIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Battery body outline */}
      <rect x="1" y="7" width="18" height="10" rx="1.5" ry="1.5" />
      {/* Battery terminal */}
      <line x1="19" y1="10" x2="23" y2="10" />
      <line x1="19" y1="14" x2="23" y2="14" />
      <line x1="23" y1="10" x2="23" y2="14" />
      {/* Lightning bolt — centered in body */}
      <polyline points="12,9.5 9.5,12.5 12,12.5 9.5,14.5" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
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

function BikeIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 12.5 8.5 9.5M8.5 9.5H16m-7.5 0 2.25 6m0 0L13 11m-2.25 4.5H6.5m6.5-4.5h2.94a2 2 0 0 0 1.84-1.22L19 7.5M18.5 15.5h-3" />
      <circle cx="18.5" cy="15.5" r="3.5" />
      <circle cx="6.5" cy="15.5" r="3.5" />
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
      className={`min-h-screen overflow-x-hidden ${
        isDark
          ? 'bg-[radial-gradient(circle_at_top,_rgba(58,28,112,0.26),_transparent_34%),radial-gradient(circle_at_50%_28%,_rgba(76,29,149,0.14),_transparent_30%),radial-gradient(circle_at_50%_72%,_rgba(49,25,97,0.12),_transparent_38%),linear-gradient(180deg,_#17131d_0%,_#1c1628_18%,_#241c37_38%,_#1b1725_60%,_#241c37_82%,_#151219_100%)] text-neutral-50'
          : 'bg-[radial-gradient(circle_at_top,_#f4f0ff,_#f7f4ee_48%,_#f7f4ee)] text-neutral-950'
      }`}
    >
      <GlobalUiStyles />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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

function firstNameFromDisplayName(name) {
  const text = String(name || '').trim()
  if (!text) return 'Runner'
  return text.split(/\s+/)[0] || 'Runner'
}

function heroTodayLine() {
  const now = new Date()
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(now)
}

function parseLocalDateOnly(dateString) {
  if (!dateString) return null
  const [year, month, day] = String(dateString).split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function raceWeeksOutLabel(goalRaceDate) {
  const raceDate = parseLocalDateOnly(goalRaceDate)
  if (!raceDate) return 'GOAL TBD'
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msPerDay = 24 * 60 * 60 * 1000
  const daysUntilRace = Math.ceil((raceDate.getTime() - today.getTime()) / msPerDay)
  if (daysUntilRace < 0) return 'RACE COMPLETE'
  if (daysUntilRace <= 6) return 'RACE WEEK'
  const weeksOut = Math.ceil(daysUntilRace / 7)
  return `${weeksOut} ${weeksOut === 1 ? 'WEEK' : 'WEEKS'} OUT`
}

// ─── Scroll-reveal hook ────────────────────────────────────────────────────
// Uses IntersectionObserver (no external dep). Fires synchronously on first
// render so elements already in view don't flash invisible on load.
function useFadeInView({ threshold = 0.08, rootMargin = '0px 0px -5% 0px' } = {}) {
  const ref = useRef(null)
  // Start visible — IO will correct immediately if element is out of view.
  // This prevents a one-frame invisible flash on initial load for the first section.
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return { ref, isVisible }
}

function FadeSection({ children, className = '', delay = 0 }) {
  const { ref, isVisible } = useFadeInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0px)' : 'translateY(22px)',
        transition: `opacity 550ms cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform 550ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
// ───────────────────────────────────────────────────────────────────────────

function useTypedText(text, enabled, speed = 28) {
  const [typed, setTyped] = useState('')
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setTyped('')
      setComplete(false)
      return
    }

    setTyped('')
    setComplete(false)
    let index = 0
    const tick = () => {
      index += 1
      setTyped(text.slice(0, index))
      if (index >= text.length) {
        setComplete(true)
        return
      }
      window.setTimeout(tick, speed)
    }

    const timeoutId = window.setTimeout(tick, speed)
    return () => window.clearTimeout(timeoutId)
  }, [enabled, speed, text])

  return { typed, complete }
}

function TypedHeroLine({ text, enabled, accent = false, theme = 'light', className = '' }) {
  const isDark = theme === 'dark'
  const { typed } = useTypedText(text, enabled, 26)

  return (
    <div
      className={`${className} inline-flex max-w-full items-center gap-1 uppercase tracking-[0.04em] ${
        accent
          ? isDark ? 'text-teal-300' : 'text-teal-700'
          : isDark ? 'text-neutral-100/92' : 'text-neutral-900'
      }`}
    >
      <span className="min-w-0">{typed}</span>
    </div>
  )
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
      <GlobalUiStyles />
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

  // Build typed strings
  const fullGreeting = `${timeOfDayGreeting()}, ${name || 'Runner'}`
  const now = new Date()
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now).toUpperCase()
  const monthDay = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(now).toUpperCase()
  const year = now.getFullYear()
  const datePrefixStr = `TODAY IS ${weekday}, `
  const dateSuffixStr = `${monthDay}, ${year}`
  const dateFullStr = `${datePrefixStr}${dateSuffixStr}`
  const moveStr = "LET'S MOVE"

  // Chained typewriter: greeting → date → move
  const [started, setStarted] = useState(false)
  const { typed: greetingTyped, complete: greetingDone } = useTypedText(fullGreeting, started, 28)
  const { typed: dateTyped, complete: dateDone } = useTypedText(dateFullStr, greetingDone, 32)
  const { typed: moveTyped, complete: moveDone } = useTypedText(moveStr, dateDone, 36)

  // After move finishes typing, trigger the exit transition
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    setStarted(false)
    setTransitioning(false)
    const t = window.setTimeout(() => setStarted(true), 200)
    return () => window.clearTimeout(t)
  }, [name, today, goalRaceDate])

  useEffect(() => {
    if (!moveDone) return
    const t = window.setTimeout(() => setTransitioning(true), 500)
    return () => window.clearTimeout(t)
  }, [moveDone])

  // Split the date into prefix ("TODAY IS SUNDAY, ") and suffix ("MARCH 29")
  const dateTypedPrefix = dateTyped.slice(0, datePrefixStr.length)
  const dateTypedSuffix = dateTyped.slice(datePrefixStr.length)

  return (
    <header className="mx-auto flex w-full max-w-[1200px] flex-col justify-between gap-6 pb-8 md:flex-row md:items-start md:gap-8">
      <div className="min-w-0 flex-1">
        {/* Greeting — types in, gradient stays */}
        <h1
          className={`max-w-full text-[clamp(2rem,3.8vw,3.4rem)] font-bold leading-[1.12] tracking-[-0.02em] pb-2 ${
            isDark
              ? 'animate-[violetCurrent_6s_linear_infinite] bg-[linear-gradient(90deg,#ffffff_0%,#c084fc_25%,#8b5cf6_50%,#c084fc_75%,#ffffff_100%)] bg-[length:200%_auto] bg-clip-text text-transparent [text-shadow:0_0_20px_rgba(139,92,246,0.15)]'
              : 'text-neutral-950'
          }`}
        >
          {greetingTyped || '\u00A0'}
        </h1>

        <div className="mt-2 flex flex-col gap-1">
          {/* Date line: prefix collapses + fades, suffix slides left and stays */}
          <div
            className={`flex items-baseline overflow-hidden text-[clamp(1.2rem,2.5vw,1.8rem)] font-semibold italic uppercase tracking-[0.04em] leading-[1.25] ${
              isDark ? 'text-neutral-100/92' : 'text-neutral-900'
            }`}
          >
            <span
              className="overflow-hidden whitespace-nowrap"
              style={{
                maxWidth: transitioning ? '0px' : '600px',
                opacity: transitioning ? 0 : 1,
                transition: 'max-width 700ms ease-in-out, opacity 550ms ease-in-out',
              }}
            >
              {dateTypedPrefix}
            </span>
            <span>{dateTypedSuffix}</span>
          </div>

          {/* LET'S MOVE — fades out to the right after transition */}
          <div
            className={`text-[clamp(1.1rem,2vw,1.4rem)] font-semibold uppercase tracking-[0.04em] leading-[1.2] ${
              isDark ? 'text-neutral-100/92' : 'text-neutral-900'
            }`}
            style={{
              opacity: transitioning ? 0 : moveTyped.length > 0 ? 1 : 0,
              transform: transitioning ? 'translateX(24px)' : 'translateX(0px)',
              transition: 'opacity 550ms ease-in-out, transform 550ms ease-in-out',
            }}
          >
            {moveTyped || '\u00A0'}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-4 md:items-end">
        <div className="flex shrink-0 items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={onOpenProfile}
            title="Profile settings"
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
              isDark
                ? 'border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-violet-500 hover:text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-violet-300 hover:text-neutral-900'
            }`}
            aria-label="Open profile settings"
          >
            <UserCircleIcon className="h-5 w-5" />
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        <div className="w-full max-w-[220px] text-left md:text-right">
          <p className={`text-[1.5rem] font-medium tracking-[-0.01em] ${isDark ? 'text-neutral-100/95' : 'text-neutral-950'}`}>
            Half-Marathon
          </p>
          <p className={`mt-1 text-[0.98rem] uppercase tracking-[0.04em] ${isDark ? 'text-neutral-300/72' : 'text-neutral-500/90'}`}>
            {raceWeeksOutLabel(goalRaceDate).toLowerCase()}
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
  iconTone = 'text-violet-600',
  iconBg = null,
  theme = 'light',
  progress = null,
  progressColor = null,
  visual = null,
}) {
  const isDark = theme === 'dark'
  const resolvedAccent =
    isDark && !/(emerald|amber|red|sky|violet|white|blue|cyan|orange|green|purple|teal|indigo)/.test(accent)
      ? 'text-white'
      : accent
  const containerBg = iconBg ?? (isDark ? 'bg-white/8' : 'bg-neutral-100')
  return (
    <div
      className={`relative flex flex-col rounded-2xl border px-5 py-5 transition duration-200 ${
        isDark
          ? 'border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.045)] hover:border-violet-500/60 hover:shadow-[0_0_0_1px_rgba(168,85,247,0.28),0_8px_36px_rgba(168,85,247,0.22),0_4px_20px_rgba(0,0,0,0.55)]'
          : 'border-neutral-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07),0_1px_3px_rgba(0,0,0,0.04)] hover:border-violet-300 hover:shadow-[0_0_0_1px_rgba(192,132,252,0.4),0_8px_28px_rgba(192,132,252,0.2),0_2px_12px_rgba(0,0,0,0.07)]'
      }`}
      style={isDark ? { background: 'linear-gradient(145deg, #1c1827 0%, #110f1b 100%)' } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`text-[0.68rem] font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
          {label}
        </p>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${containerBg} ${iconTone}`}>
          {icon}
        </div>
      </div>
      <p className={`mt-4 tabular-nums text-[2.3rem] font-bold leading-none tracking-[-0.03em] sm:text-[2.6rem] ${resolvedAccent}`}>{value}</p>
      <p className={`mt-2 break-words text-xs leading-6 ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>{subtext}</p>
      {visual != null ? visual : null}
    </div>
  )
}

function RadialArc({ pct = 0, color = '#a78bfa', size = 48 }) {
  const r = 17
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  const dash = Math.min(pct / 100, 1) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="3.5" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </svg>
  )
}

function HeartWave({ color = '#a78bfa' }) {
  return (
    <div className="mt-3 w-full overflow-hidden">
      <svg viewBox="0 0 100 26" className="w-full h-6" preserveAspectRatio="none">
        <polyline
          points="0,13 10,13 16,2 22,24 28,7 33,18 39,13 50,13 56,2 62,24 68,7 73,18 79,13 100,13"
          fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"
        />
      </svg>
    </div>
  )
}

function StrainSegments({ value = 0, maxValue = 21, color = '#fb923c' }) {
  const segs = 10
  const filled = Math.round((Math.min(value, maxValue) / maxValue) * segs)
  return (
    <div className="mt-3 flex gap-[3px]">
      {Array.from({ length: segs }).map((_, i) => (
        <div
          key={i}
          className="h-[5px] flex-1 rounded-full"
          style={{ backgroundColor: i < filled ? color : 'rgba(255,255,255,0.08)' }}
        />
      ))}
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
          className={`group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border px-8 py-5 text-center text-xl font-bold tracking-wide transition duration-200 ${
            isGenerating
              ? isDark
                ? 'cursor-not-allowed border-neutral-700 bg-neutral-800 text-neutral-400'
                : 'cursor-not-allowed border-neutral-300 bg-neutral-200 text-neutral-400'
              : isDark
              ? 'border-violet-500/30 text-white shadow-[0_4px_24px_rgba(124,58,237,0.55),0_0_0_1px_rgba(167,139,250,0.2)] hover:shadow-[0_8px_40px_rgba(124,58,237,0.7),0_0_0_1px_rgba(167,139,250,0.35)] hover:scale-[1.01] active:scale-[0.99]'
              : 'border-violet-600/20 text-white shadow-[0_4px_24px_rgba(109,40,217,0.45),0_2px_8px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgba(109,40,217,0.6)] hover:scale-[1.01] active:scale-[0.99]'
          }`}
          style={
            isGenerating
              ? undefined
              : { background: isDark ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }
          }
        >
          <span className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${
            isGenerating ? 'bg-white/10 text-white/50' : 'bg-white/15 text-white'
          }`}>
            {isGenerating ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
  hasPain,
  painSeverity,
  painLocation,
  painWithRunning,
  painWithWalking,
  painWithCycling,
  isGenerating,
  onClose,
  onPhysicalChange,
  onMentalChange,
  onNotesChange,
  onHasPainChange,
  onPainSeverityChange,
  onPainLocationChange,
  onPainWithRunningChange,
  onPainWithWalkingChange,
  onPainWithCyclingChange,
  onGenerate,
  theme = 'light',
}) {
  const isDark = theme === 'dark'
  if (!isOpen) return null
  const legsOptions = ['fresh', 'normal', 'heavy', 'sore']
  const mentalOptions = ['sharp', 'steady', 'stressed', 'drained']

  const choiceButtonClasses = (active) =>
    `min-h-[4.1rem] w-full rounded-[1.35rem] border px-4 py-4 text-left text-base font-medium transition duration-150 ${
      active
        ? isDark
          ? 'border-violet-500/70 bg-violet-600/90 text-white shadow-[0_0_0_1px_rgba(168,85,247,0.3),0_8px_28px_rgba(109,40,217,0.4)]'
          : 'border-violet-300 bg-violet-600 text-white shadow-[0_10px_28px_rgba(109,40,217,0.22)]'
        : isDark
          ? 'border-neutral-700/60 bg-neutral-900/70 text-neutral-300 hover:border-violet-500/50 hover:bg-neutral-800/80 hover:text-white hover:shadow-[0_0_0_1px_rgba(168,85,247,0.15)]'
          : 'border-neutral-200 bg-stone-50 text-neutral-700 hover:border-violet-300 hover:text-neutral-950'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Close recommendation prompts"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/45 backdrop-blur-sm"
      />
      <section className={`relative z-10 flex max-h-[90vh] w-full max-w-[72rem] flex-col overflow-hidden rounded-[2rem] border shadow-[0_30px_120px_rgba(0,0,0,0.22)] ${
        isDark ? 'border-neutral-800 bg-neutral-900/98' : 'border-neutral-200 bg-white/98'
      }`}>
        <div
          className="recommendation-modal-scroll flex-1 overflow-y-auto px-7 pb-0 pt-7 md:px-8 md:pt-8"
          style={{ background: isDark ? 'linear-gradient(180deg, #110f1b 0%, #0d0b14 100%)' : '#ffffff' }}
        >
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-3xl">
              <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                Recommendation Prompts
              </p>
              <h2 className={`mt-4 max-w-4xl text-[2.45rem] font-semibold leading-[1.08] tracking-tight md:text-[2.85rem] ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                Fill this out, then generate today&apos;s recommendation.
              </h2>
              <p className={`mt-4 max-w-3xl text-[1.04rem] leading-8 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Your biometrics and recent running load are already on the page. These prompts let the model account
                for how your legs feel, how your head feels, and anything else you want it to weigh.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-lg transition ${
                isDark
                  ? 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-violet-500 hover:text-white'
                  : 'border-neutral-200 bg-white text-neutral-500 hover:border-violet-300 hover:text-neutral-900'
              }`}
              aria-label="Close recommendation prompts"
            >
              ×
            </button>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                How do your legs feel?
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {legsOptions.map((option) => (
                  <button key={option} type="button" onClick={() => onPhysicalChange(option)} className={choiceButtonClasses(physicalFeeling === option)}>
                    {capitalize(option)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                What&apos;s your mental state?
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {mentalOptions.map((option) => (
                  <button key={option} type="button" onClick={() => onMentalChange(option)} className={choiceButtonClasses(mentalFeeling === option)}>
                    {capitalize(option)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-9">
            <div
              className={`rounded-[1.75rem] border p-6 ${isDark ? 'border-neutral-700/50' : 'border-neutral-200 bg-stone-50/95'}`}
              style={isDark ? { background: 'linear-gradient(145deg, #1c1827 0%, #110f1b 100%)' } : undefined}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    Pain check-in
                  </p>
                  <p className={`mt-2 text-sm leading-7 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Use this only if pain is part of today&apos;s training decision.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onHasPainChange(!hasPain)}
                  className={`inline-flex items-center gap-3 rounded-full border px-3 py-2 text-sm font-medium transition ${
                    hasPain
                      ? isDark
                        ? 'border-violet-500/80 bg-violet-600/20 text-white'
                        : 'border-violet-300 bg-violet-50 text-violet-700'
                      : isDark
                        ? 'border-neutral-800 bg-neutral-950 text-neutral-300'
                        : 'border-neutral-200 bg-white text-neutral-700'
                  }`}
                  aria-pressed={hasPain}
                >
                  <span> Pain present </span>
                  <span className={`relative inline-flex h-6 w-11 rounded-full transition ${hasPain ? (isDark ? 'bg-violet-500/90' : 'bg-violet-500') : (isDark ? 'bg-neutral-800' : 'bg-neutral-300')}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${hasPain ? 'left-[1.35rem]' : 'left-0.5'}`} />
                  </span>
                </button>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ${hasPain ? 'mt-6 max-h-[30rem] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className={`text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                      Severity
                    </label>
                    <select
                      value={painSeverity}
                      onChange={(event) => onPainSeverityChange(event.target.value)}
                      className={`mt-3 w-full rounded-[1.2rem] border px-4 py-3 text-sm outline-none transition ${isDark ? 'border-neutral-800 bg-neutral-900 text-neutral-100' : 'border-neutral-200 bg-white text-neutral-800'}`}
                    >
                      {['none', 'mild', 'moderate', 'severe'].map((option) => (
                        <option key={option} value={option}>{capitalize(option)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                      Location
                    </label>
                    <select
                      value={painLocation}
                      onChange={(event) => onPainLocationChange(event.target.value)}
                      className={`mt-3 w-full rounded-[1.2rem] border px-4 py-3 text-sm outline-none transition ${isDark ? 'border-neutral-800 bg-neutral-900 text-neutral-100' : 'border-neutral-200 bg-white text-neutral-800'}`}
                    >
                      {['none', 'foot', 'ankle', 'shin', 'calf', 'knee', 'hamstring', 'quad', 'hip', 'low_back', 'other'].map((option) => (
                        <option key={option} value={option}>{option === 'low_back' ? 'Low Back' : capitalize(option.replace('_', ' '))}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <label className={`flex items-center gap-3 text-sm ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
                    <input type="checkbox" checked={painWithRunning} onChange={(event) => onPainWithRunningChange(event.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-violet-600 focus:ring-violet-500" />
                    Pain shows up when running
                  </label>
                  <label className={`flex items-center gap-3 text-sm ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
                    <input type="checkbox" checked={painWithWalking} onChange={(event) => onPainWithWalkingChange(event.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-violet-600 focus:ring-violet-500" />
                    Pain shows up when walking
                  </label>
                  <label className={`flex items-center gap-3 text-sm ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
                    <input type="checkbox" checked={painWithCycling} onChange={(event) => onPainWithCyclingChange(event.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-violet-600 focus:ring-violet-500" />
                    Pain shows up when cycling
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-9 pb-6">
            <label className={`block text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Anything else the coach should know?
            </label>
            <textarea
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              placeholder="Examples: poor sleep, lingering calf tightness, emotionally drained, limited time, want to lift arms only."
              className={`mt-4 min-h-[8.5rem] w-full rounded-[1.5rem] border px-5 py-4 text-base leading-7 outline-none transition placeholder:text-neutral-600 focus:border-violet-500/60 focus:shadow-[0_0_0_1px_rgba(168,85,247,0.2)] ${
                isDark
                  ? 'border-neutral-700/60 bg-neutral-900/60 text-neutral-100'
                  : 'border-neutral-200 bg-stone-50 text-neutral-800'
              }`}
            />
          </div>
        </div>

        <div
          className={`sticky bottom-0 border-t px-7 py-5 md:px-8 ${
            isDark ? 'border-neutral-700/50' : 'border-neutral-200 bg-white/98'
          }`}
          style={isDark ? { background: 'rgba(13, 11, 20, 0.98)' } : undefined}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className={`text-sm font-medium transition ${
                isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              Cancel
            </button>
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
  const isLiftOffDay = /lifting off-day|no lifting/i.test(String(recommendation.lift_focus || ''))
  const liftBlocks = isLiftOffDay ? [] : formatLiftBlocks(recommendation.lift_guidance)
  const intensityLabel = simplifyIntensity(recommendation.intensity)
  const intensityClass = intensityColorClass(intensityLabel)
  const primaryModality = String(recommendation.primary_modality || recommendation.daily_adaptation?.primary_modality || 'run').toLowerCase()
  const isBikeDay = primaryModality === 'bike'
  const isMakeupDay = Boolean(recommendation.daily_adaptation?.is_makeup_day)
  const missedWorkout = String(recommendation.daily_adaptation?.missed_workout || '')
  const bikeZone = String(recommendation.bike_zone || recommendation.run_pace_guidance || '').trim()
  const bikeCadence = String(recommendation.bike_cadence || '').trim()
  const enduranceNotes = Array.isArray(recommendation.endurance_notes) ? recommendation.endurance_notes.filter(Boolean) : []
  const [isCoachSummaryExpanded, setIsCoachSummaryExpanded] = useState(false)

  useEffect(() => {
    setIsCoachSummaryExpanded(false)
  }, [recommendationExplanation?.summary, recommendation?.date, recommendation?.workout])

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

      {/* Run + Lift — equal-width balanced panels */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* Run / Bike panel */}
        <div className={`rounded-[1.9rem] border p-6 shadow-sm ${isDark ? `border-neutral-800 bg-neutral-950 ${darkGlow(true)}` : 'border-neutral-200 bg-white'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDark ? 'bg-emerald-950/70 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              {isBikeDay ? <BikeIcon /> : <RunningShoeIcon />}
            </div>
            <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {isBikeDay ? 'Bike' : 'Run'}
            </p>
          </div>

          <div className="mt-5">
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              {isBikeDay ? 'Duration' : 'Distance'}
            </p>
            <p className={`mt-2 tabular-nums text-[3.4rem] font-bold leading-none tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
              {isBikeDay ? `${recommendation.duration_minutes ?? '-'} min` : `${recommendation.run_distance_miles ?? '-'} mi`}
            </p>
          </div>

          <div className="mt-4">
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              {isBikeDay ? 'Zone' : 'Pace'}
            </p>
            <p className={`mt-2 text-2xl font-semibold leading-tight tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
              {isBikeDay ? (bikeZone || 'By feel') : paceHeadline(recommendation.run_pace_guidance)}
            </p>
            <p className={`mt-1 text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {isBikeDay ? (bikeCadence ? `Cadence ${bikeCadence}` : 'Keep the effort smooth and aerobic.') : paceSupportText(recommendation.run_pace_guidance)}
            </p>
          </div>

          <div className={`mt-5 border-t pt-4 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              Intensity
            </p>
            <p className={`mt-2 text-2xl font-semibold leading-tight tracking-tight ${intensityClass}`}>
              {intensityLabel}
            </p>
            <p className={`mt-1 text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {isBikeDay
                ? (enduranceNotes[0] || '')
                : (recommendation.duration_minutes ? `${recommendation.duration_minutes} min total` : '')}
            </p>
          </div>
        </div>

        {/* Lift panel */}
        <div className={`rounded-[1.9rem] border p-6 ${isDark ? `border-neutral-800 bg-neutral-950/80 ${darkGlow(true)}` : 'border-neutral-200 bg-stone-50'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isDark ? 'bg-violet-950/70 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
              <DumbbellIcon />
            </div>
            <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Lift
            </p>
          </div>

          <div className="mt-5">
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              Focus
            </p>
            <p className={`mt-2 text-[3.4rem] font-bold leading-tight tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
              {shortLiftTitle(recommendation.lift_focus)}
            </p>
          </div>

          <div className={`mt-5 border-t pt-4 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
            {isLiftOffDay ? (
              <p className={`text-sm leading-7 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {isBikeDay
                  ? 'No lift today. Let the bike session carry the load.'
                  : 'No lift today. Keep all training stress in the run.'}
              </p>
            ) : (
              <div className="space-y-2.5">
                {liftBlocks.map((block, index) => (
                  <div
                    key={`${block.name}-${index}`}
                    className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm leading-6 ${isDark ? 'border-neutral-800 bg-neutral-900 text-neutral-300' : 'border-neutral-200 bg-white text-neutral-700'}`}
                  >
                    <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isDark ? 'bg-violet-950/80 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
                      {index + 1}
                    </span>
                    <span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-950'}`}>{block.name}</span>
                      {block.detail ? <span className={isDark ? ' text-neutral-400' : ' text-neutral-600'}> {block.detail}</span> : null}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coach Summary — includes makeup day callout when relevant */}
      {(recommendationExplanation?.summary || isMakeupDay) ? (
        <section className={`mt-6 overflow-hidden rounded-[1.9rem] border ${
          isDark ? `border-sky-900/40 bg-sky-950/30 ${darkGlow(true)}` : 'border-sky-200 bg-sky-50/80'
        }`}>
          {isMakeupDay && (
            <div className={`flex items-start gap-3 border-b px-6 py-4 text-sm ${
              isDark
                ? 'border-amber-900/40 bg-amber-950/25 text-amber-300'
                : 'border-amber-200/60 bg-amber-50/80 text-amber-700'
            }`}>
              <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M8 5v3l1.5 1.5" />
              </svg>
              <span>
                <strong>Makeup day</strong> — yesterday&apos;s {missedWorkout ? <span className="font-semibold">{missedWorkout.toLowerCase()}</span> : 'planned session'} was missed. Volume is slightly reduced to avoid stacking load.
              </span>
            </div>
          )}

          {recommendationExplanation?.summary ? (
            <>
              <button
                type="button"
                aria-expanded={isCoachSummaryExpanded}
                onClick={() => setIsCoachSummaryExpanded((current) => !current)}
                className="w-full cursor-pointer px-6 py-6 text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      isDark ? 'bg-sky-950/70 text-sky-300' : 'bg-white text-sky-700'
                    }`}>
                      <TargetIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-sky-200/80' : 'text-sky-700'}`}>
                        Coach Summary
                      </p>
                      <p className={`mt-5 max-w-4xl text-xl leading-9 ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                        {recommendationExplanation.summary}
                      </p>
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`mt-1 shrink-0 text-2xl transition duration-200 ${isCoachSummaryExpanded ? 'rotate-180' : ''} ${isDark ? 'text-sky-200/70' : 'text-sky-700'}`}
                  >
                    ⌄
                  </span>
                </div>
              </button>

              {isCoachSummaryExpanded ? (
                <div className="px-6 pb-6">
                  {Array.isArray(recommendationExplanation.whyBullets) && recommendationExplanation.whyBullets.length > 0 ? (
                    <ul className={`space-y-2 text-base leading-7 ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
                      {recommendationExplanation.whyBullets.slice(0, 2).map((bullet, index) => (
                        <li key={`${bullet}-${index}`} className="flex gap-3">
                          <span className={`mt-3 inline-block h-1.5 w-1.5 rounded-full ${isDark ? 'bg-sky-300' : 'bg-sky-700'}`} />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {recommendationExplanation.decisionDrivers ? (
                    <div className={`mt-5 rounded-[1.25rem] border px-4 py-4 ${
                      isDark ? 'border-neutral-800 bg-neutral-950/70' : 'border-white/80 bg-white/90'
                    }`}>
                      <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-sky-200/80' : 'text-sky-700'}`}>
                        What Drove This Decision
                      </p>
                      <p className={`mt-2 text-sm leading-7 ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
                        {recommendationExplanation.decisionDrivers}
                      </p>
                    </div>
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
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      ) : null}
    </section>
  )
}

function WeeklyFocusCard({ weeklyFocus, theme = 'light' }) {
  if (!weeklyFocus) return null

  const isDark = theme === 'dark'
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className={`mt-8 overflow-hidden rounded-[2rem] border shadow-sm ${isDark ? `border-neutral-800 bg-neutral-900/95 ${darkGlow(true)}` : 'border-neutral-200 bg-white/95'}`}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="w-full cursor-pointer px-6 py-5 text-left md:px-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Current Week
            </p>
            <div className={`mt-3 inline-flex rounded-[1.5rem] border px-5 py-3 ${isDark ? 'border-violet-800/60 bg-violet-950/50 text-white' : 'border-violet-100 bg-violet-50/80 text-neutral-950'}`}>
              <h2 className="text-3xl font-semibold uppercase italic tracking-[0.025em] md:text-4xl">
                {weeklyFocus.phase || 'Weekly focus'}
              </h2>
            </div>
          </div>
          <span className={`text-2xl transition duration-200 ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>⌄</span>
        </div>
      </button>

      {isOpen ? (
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
      ) : null}
    </div>
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

function MasterTrainingCalendar({ weeklyPlans, theme = 'light' }) {
  if (!Array.isArray(weeklyPlans) || weeklyPlans.length === 0) return null
  const isDark = theme === 'dark'
  const weekdayHeadings = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const currentWeekPlan = weeklyPlans[0]
  const futureWeekPlans = weeklyPlans.slice(1)
  const currentWeekCards = Array.isArray(currentWeekPlan?.days) ? currentWeekPlan.days : []
  const [isFuturePlannerExpanded, setIsFuturePlannerExpanded] = useState(false)
  const [selectedFutureWeekIndex, setSelectedFutureWeekIndex] = useState(0)

  useEffect(() => {
    setIsFuturePlannerExpanded(false)
    setSelectedFutureWeekIndex(0)
  }, [weeklyPlans?.[0]?.week_key])

  const safeFutureIndex = Math.min(selectedFutureWeekIndex, Math.max(0, futureWeekPlans.length - 1))
  const selectedFutureWeek = futureWeekPlans[safeFutureIndex] || null
  const selectedFutureFocus = selectedFutureWeek?.weekly_focus || {}
  const selectedFutureProjection = selectedFutureWeek?.future_projection || {}

  return (
    <section className={`mt-10 rounded-[2.3rem] border px-6 py-7 shadow-sm md:px-8 ${isDark ? `border-neutral-800 bg-neutral-900/95 ${darkGlow(true)}` : 'border-neutral-200 bg-white/95'}`}>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className={`text-4xl font-semibold tracking-tight md:text-5xl ${isDark ? 'text-white' : 'text-neutral-950'}`}>Training Calendar</h2>
          <div className={`mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
            {/* Intensity stripe legend */}
            <LegendDot color="bg-emerald-500" label="Easy" />
            <LegendDot color="bg-amber-400" label="Moderate" />
            <LegendDot color="bg-rose-500" label="Hard" />
            {/* Activity type icon legend */}
            <span className={`h-4 w-px ${isDark ? 'bg-neutral-700' : 'bg-neutral-300'}`} aria-hidden="true" />
            <LegendIcon
              icon={<svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9 1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>}
              label="Run"
              color={isDark ? 'text-cyan-400' : 'text-cyan-600'}
            />
            <LegendIcon
              icon={<svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/></svg>}
              label="Weights"
              color={isDark ? 'text-orange-400' : 'text-orange-600'}
            />
            <LegendIcon
              icon={<svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zm-1.97 11.48-1.7 3.02V16h-2v-3.5h2V11l1.7 3.02V13H14v1.5h-1.3v.98z"/></svg>}
              label="Rest"
              color={isDark ? 'text-neutral-500' : 'text-neutral-400'}
            />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <p className={`text-lg font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              {formatWeekSpan(currentWeekCards)}
            </p>
            {currentWeekPlan?.is_current_week ? (
              <div className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500/85' : 'text-neutral-500/85'}`}>
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                <span>This Week</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className={`mt-8 overflow-hidden rounded-[1.8rem] border ${isDark ? `border-neutral-800 bg-neutral-950 ${darkGlow(true)}` : 'border-neutral-200 bg-stone-50'}`}>
        <div className="overflow-x-auto p-5">
        <div className="grid min-w-[46rem] grid-cols-7 gap-2 xl:gap-3">
            {weekdayHeadings.map((heading) => (
              <p key={heading} className={`text-center text-sm font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                {heading}
              </p>
            ))}
            {currentWeekCards.map((card) => (
              <CalendarCard key={card.day} card={card} theme={theme} />
            ))}
        </div>

        {futureWeekPlans.length > 0 ? (
          <div className={`mt-6 border-t pt-5 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
            {/* Future Planner header row */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" className={`h-4 w-4 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} fill="currentColor" aria-hidden="true">
                  <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
                </svg>
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Upcoming Weeks
                </p>
              </div>
              {/* Week selector pills */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFutureWeekIndex((v) => Math.max(0, v - 1))}
                  disabled={safeFutureIndex === 0}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                    safeFutureIndex === 0
                      ? isDark ? 'cursor-not-allowed border-neutral-800 text-neutral-700' : 'cursor-not-allowed border-neutral-200 text-neutral-300'
                      : isDark ? 'border-neutral-700 text-neutral-300 hover:border-violet-500 hover:text-violet-300' : 'border-neutral-300 text-neutral-600 hover:border-violet-400 hover:text-violet-700'
                  }`}
                  aria-label="Previous future week"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.5 5l-5 5 5 5" /></svg>
                </button>
                <span className={`min-w-[5.5rem] text-center text-xs font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Week {safeFutureIndex + 2} <span className={`font-normal ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>/ {weeklyPlans.length}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFutureWeekIndex((v) => Math.min(futureWeekPlans.length - 1, v + 1))}
                  disabled={safeFutureIndex === futureWeekPlans.length - 1}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                    safeFutureIndex === futureWeekPlans.length - 1
                      ? isDark ? 'cursor-not-allowed border-neutral-800 text-neutral-700' : 'cursor-not-allowed border-neutral-200 text-neutral-300'
                      : isDark ? 'border-neutral-700 text-neutral-300 hover:border-violet-500 hover:text-violet-300' : 'border-neutral-300 text-neutral-600 hover:border-violet-400 hover:text-violet-700'
                  }`}
                  aria-label="Next future week"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 5l5 5-5 5" /></svg>
                </button>
              </div>
            </div>

            {/* Future week content — always visible, no expand/collapse */}
            {selectedFutureWeek ? (
              <div className={`rounded-[1.2rem] border px-5 py-4 ${isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-neutral-200 bg-white'}`}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                  <div className="min-w-0 flex-1">
                    <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
                      {formatRoadmapWeekSpan(selectedFutureWeek)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] ${
                        isDark
                          ? 'border-violet-800/70 bg-violet-950/40 text-violet-300'
                          : 'border-violet-200 bg-violet-50 text-violet-800'
                      }`}>
                        {selectedFutureProjection.phaseTitle || selectedFutureWeek?.focus_title || selectedFutureFocus.phase || 'Weekly focus'}
                      </span>
                      {(selectedFutureProjection.targetMileage || selectedFutureProjection.longRunTarget) ? (
                        <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                          isDark ? 'border-neutral-700 bg-neutral-900 text-neutral-300' : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                        }`}>
                          {[
                            selectedFutureProjection.targetMileage ? `${trimNumber(selectedFutureProjection.targetMileage)} mi` : '',
                            selectedFutureProjection.longRunTarget ? `${trimNumber(selectedFutureProjection.longRunTarget)} mi long` : '',
                          ].filter(Boolean).join(' · ')}
                        </span>
                      ) : null}
                    </div>
                    <p className={`mt-3 text-sm leading-7 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      {selectedFutureWeek?.focus_summary || selectedFutureProjection.summary || selectedFutureFocus.progression_note || selectedFutureFocus.race_connection || 'Future guidance will appear here.'}
                    </p>
                    {selectedFutureProjection.keySessionSummary ? (
                      <p className={`mt-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
                        {selectedFutureProjection.keySessionSummary}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      </div>
    </section>
  )
}

function TrainingCalendar({ cards, theme = 'light' }) {
  if (!Array.isArray(cards) || cards.length === 0) return null
  const isDark = theme === 'dark'

  const weekdayHeadings = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  )
}

function LegendIcon({ icon, label, color = 'text-neutral-500' }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={color}>{icon}</span>
      <span>{label}</span>
    </div>
  )
}

function localDateKey() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function CalendarCard({ card, theme = 'light' }) {
  const isDark = theme === 'dark'
  const activities = Array.isArray(card.activities) ? card.activities : []
  const stripeClass = calendarStripeClass(activities)
  const date = new Date(`${card.day}T12:00:00`)
  const isToday = card.day === localDateKey()
  const weekdayShort = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date).toUpperCase()
  const dayNumber = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(date)

  return (
    <div
      className={`relative min-h-[15rem] overflow-hidden rounded-[1.3rem] border px-2.5 pb-3 pt-2.5 shadow-sm xl:min-h-[17rem] ${
        isToday
          ? isDark
            ? `border-2 border-white bg-neutral-900 ${darkGlow(true)}`
            : 'border-2 border-neutral-950 bg-white'
          : isDark
            ? `border-neutral-800 bg-neutral-900/90 ${darkGlow(true)}`
            : 'border-neutral-200 bg-white'
      }`}
    >
      {!isToday ? <div className={`absolute inset-x-0 top-0 h-[3px] ${stripeClass} opacity-90`} /> : null}

      {isToday ? (
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
          isToday ? <div className="pt-2.5" /> : (
            <div className="flex h-full min-h-[6rem] items-center justify-center">
              <svg
                viewBox="0 0 28 16"
                className={`w-14 ${isDark ? 'text-neutral-500' : 'text-neutral-300'}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-label="Rest day"
              >
                {/* Battery body */}
                <rect x="0.7" y="0.7" width="23" height="14.6" rx="2.2" />
                {/* Battery terminal */}
                <path d="M23.7 5.5 L27.3 5.5 L27.3 10.5 L23.7 10.5" />
                {/* Lightning bolt — solid fill, centered */}
                <path
                  d="M14.5 2.5 L10 8.5 H13.5 L11.5 13.5 L17 7.5 H13.5 Z"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </div>
          )
        )}
      </div>
    </div>
  )
}

function CalendarActivity({ activity, theme = 'light' }) {
  const isDark = theme === 'dark'
  const category = activityCategory(activity)
  const isRun = category === 'running'
  const isSpin = category === 'spin'
  const isStrength = category === 'weightlifting'
  const intensity = activityIntensityLabel(activity)
  const showIntensityPill = intensity !== '-'

  // Activity type icon
  const ActivityTypeIcon = isRun ? (
    // Running shoe (person running)
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9 1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
    </svg>
  ) : isStrength ? (
    // Dumbbell
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/>
    </svg>
  ) : isSpin ? (
    // Bike
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6l-2.2-2.5zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/>
    </svg>
  ) : null

  return (
    <div className="pb-2.5 last:pb-0">
      {isRun ? (
        <>
          <div className="flex items-center gap-1.5">
            <span className={`${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{ActivityTypeIcon}</span>
            <p className={`text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
              {activity.distance_miles ? `${trimNumber(activity.distance_miles)} mi` : '-'}
            </p>
          </div>
          <p className={`mt-0.5 text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{calendarPace(activity)}</p>
        </>
      ) : isSpin ? (
        <>
          <div className="flex items-center gap-1.5">
            <span className={`${isDark ? 'text-violet-400' : 'text-violet-600'}`}>{ActivityTypeIcon}</span>
            <p className={`text-base font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
              Spin
            </p>
          </div>
          <p className={`mt-0.5 text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            {[
              activity.duration_minutes ? `${activity.duration_minutes} min` : '',
              activity.strain ? `Strain ${trimNumber(activity.strain)}` : '',
            ].filter(Boolean).join(' • ') || 'Bike session'}
          </p>
        </>
      ) : isStrength ? (
        <>
          <div className="flex items-center gap-1.5">
            <span className={`${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{ActivityTypeIcon}</span>
            <p className={`text-base font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
              Weights
            </p>
          </div>
          {(activity.duration_minutes || activity.strain) ? (
            <p className={`mt-0.5 text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {[
                activity.duration_minutes ? `${activity.duration_minutes} min` : '',
                activity.strain ? `Strain ${trimNumber(activity.strain)}` : '',
              ].filter(Boolean).join(' • ')}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <p className={`text-base font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
            {activity.title || activitySourceLabel(activity) || 'Activity'}
          </p>
          {(activity.duration_minutes || activity.strain) ? (
            <p className={`mt-0.5 text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {[activity.duration_minutes ? `${activity.duration_minutes} min` : '', activity.strain ? `Strain ${trimNumber(activity.strain)}` : ''].filter(Boolean).join(' • ')}
            </p>
          ) : null}
        </>
      )}

      {showIntensityPill ? (
        <span className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${intensityPillClass(intensity, theme)}`}>
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
  const spin = Array.isArray(activityLog?.spin) ? activityLog.spin : []
  const activity = Array.isArray(activityLog?.activity) ? activityLog.activity : []
  return [...runs, ...strength, ...spin, ...activity]
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
  if (text.includes('recovery')) return 'Recovery'
  if (text.includes('easy')) return 'Easy'
  if (text.includes('moderate') || text.includes('steady')) return 'Moderate'
  if (text.includes('hard')) return 'Hard'
  if (text.includes('rest')) return 'Rest'
  return '-'
}

function intensityColorClass(value) {
  const text = String(value || '').toLowerCase()
  if (text.includes('hard')) return 'text-red-600'
  if (text.includes('moderate')) return 'text-amber-500'
  if (text.includes('easy') || text.includes('recovery')) return 'text-emerald-600'
  return 'text-neutral-400'
}

function intensityPillClass(value, theme = 'light') {
  const isDark = theme === 'dark'
  const text = String(value || '').toLowerCase()
  if (text.includes('hard')) return isDark ? 'bg-red-950/60 text-red-300' : 'bg-red-50 text-red-600'
  if (text.includes('moderate')) return isDark ? 'bg-amber-950/60 text-amber-300' : 'bg-amber-50 text-amber-600'
  if (text.includes('easy') || text.includes('recovery')) return isDark ? 'bg-emerald-950/60 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
  return isDark ? 'bg-neutral-800/60 text-neutral-300' : 'bg-neutral-100 text-neutral-600'
}

function activityIntensityDotClass(activity) {
  const token = String(activity?.intensity_color || '').toLowerCase()
  if (token === 'hard') return 'bg-rose-500'
  if (token === 'moderate') return 'bg-amber-400'
  if (token === 'easy' || token === 'recovery') return 'bg-emerald-500'
  const intensity = activityIntensityLabel(activity).toLowerCase()
  if (intensity.includes('hard')) return 'bg-rose-500'
  if (intensity.includes('moderate')) return 'bg-amber-400'
  if (intensity.includes('easy') || intensity.includes('recovery')) return 'bg-emerald-500'
  return 'bg-neutral-400'
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
  const dotClass = activityIntensityDotClass(first)
  return dotClass === 'bg-neutral-400' ? 'bg-neutral-300' : dotClass
}

function intensityIconTone(value) {
  const text = String(value || '').toLowerCase()
  if (text.includes('hard')) return 'bg-red-50 text-red-600'
  if (text.includes('moderate')) return 'bg-amber-50 text-amber-600'
  if (text.includes('easy') || text.includes('recovery')) return 'bg-emerald-50 text-emerald-700'
  return 'bg-neutral-100 text-neutral-600'
}

function activityIntensityLabel(activity) {
  return simplifyIntensity(activity?.intensity_label || activity?.intensity || activity?.effort || '')
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
    { key: 'runs', label: 'Running', icon: <RunningShoeIcon className="h-4 w-4" /> },
    { key: 'strength', label: 'Weightlifting', icon: <DumbbellIcon className="h-4 w-4" /> },
    { key: 'spin', label: 'Spin', icon: <BikeIcon className="h-4 w-4" /> },
  ]
  const filteredActivities = allActivities.filter((activity) => {
    if (filter === 'runs') return isRunActivity(activity)
    if (filter === 'strength') return activityCategory(activity) === 'weightlifting'
    if (filter === 'spin') return activityCategory(activity) === 'spin'
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

function activityCategory(activity) {
  const explicit = String(activity?.category || '').trim().toLowerCase()
  if (explicit) return explicit
  const source = `${activity?.name || ''} ${activity?.sport || ''} ${activity?.raw_type || ''}`.toLowerCase()
  if (/run|running|treadmill|track|jog/.test(source)) return 'running'
  if (/weight|strength|lift|gym|resistance|weights/.test(source)) return 'weightlifting'
  if (/spin|cycling|bike|peloton|ride/.test(source)) return 'spin'
  return 'activity'
}

function isRunActivity(activity) {
  return activityCategory(activity) === 'running'
}

function activityCategoryLabel(activity) {
  const category = activityCategory(activity)
  if (category === 'running') return 'Running'
  if (category === 'weightlifting') return 'Weightlifting'
  if (category === 'spin') return 'Spin'
  return 'Activity'
}

function activitySourceLabel(activity) {
  return humanizeActivityLabel(activity?.source_title || activity?.raw_type || activity?.name || activity?.sport || '')
}

function workoutCatalogTitle(activity) {
  const category = activityCategory(activity)
  if (category === 'running') return 'Run'
  if (category === 'weightlifting') return 'Weight Training'
  if (category === 'spin') return 'Spin'
  return 'Activity'
}

function workoutCatalogSummary(activity) {
  const category = activityCategory(activity)
  if (category === 'running') {
    const distance = activity.distance_miles ? `${trimNumber(activity.distance_miles)} mi` : '-'
    return `${distance} • ${calendarPace(activity)}`
  }
  if (category === 'weightlifting') {
    return activity.duration_minutes ? `${activity.duration_minutes} min` : 'Strength session'
  }
  if (category === 'spin') {
    const bits = []
    if (activity.duration_minutes) bits.push(`${activity.duration_minutes} min`)
    if (activity.strain) bits.push(`Strain ${trimNumber(activity.strain)}`)
    if (!bits.length && activity.distance_miles) bits.push(`${trimNumber(activity.distance_miles)} mi`)
    return bits.join(' • ') || 'Bike session'
  }
  const bits = []
  if (activity.duration_minutes) bits.push(`${activity.duration_minutes} min`)
  if (activity.strain) bits.push(`Strain ${trimNumber(activity.strain)}`)
  return bits.join(' • ') || activitySourceLabel(activity) || 'Logged activity'
}

function workoutIntensityIndicator(activity) {
  return activityIntensityDotClass(activity)
}

function WorkoutCatalogListItem({ activity, isSelected, onSelect, theme = 'light' }) {
  const isDark = theme === 'dark'
  const category = activityCategory(activity)
  const isRun = category === 'running'
  const isStrength = category === 'weightlifting'
  const isSpin = category === 'spin'

  // Pick icon + color per activity type
  const iconColor = isRun
    ? isDark ? 'text-cyan-400' : 'text-cyan-600'
    : isStrength
      ? isDark ? 'text-orange-400' : 'text-orange-600'
      : isSpin
        ? isDark ? 'text-violet-400' : 'text-violet-600'
        : isDark ? 'text-neutral-400' : 'text-neutral-500'
  const iconBgColor = isRun
    ? isDark ? 'bg-cyan-500/12' : 'bg-cyan-50'
    : isStrength
      ? isDark ? 'bg-orange-500/12' : 'bg-orange-50'
      : isSpin
        ? isDark ? 'bg-violet-500/12' : 'bg-violet-50'
        : isDark ? 'bg-neutral-800' : 'bg-neutral-100'

  const ActivityIcon = isRun ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9 1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>
  ) : isStrength ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/></svg>
  ) : isSpin ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6l-2.2-2.5zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/></svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
  )

  const selectedClasses = isSelected
    ? isDark
      ? 'bg-violet-950/20 shadow-[inset_3px_0_0_0_rgba(168,85,247,0.9)]'
      : 'bg-violet-50 shadow-[inset_3px_0_0_0_rgba(139,92,246,0.9)]'
    : isDark
      ? 'hover:bg-neutral-900/60'
      : 'hover:bg-stone-50/80'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3.5 border-b px-5 py-4 text-left transition ${selectedClasses} ${isDark ? 'border-neutral-800/70' : 'border-neutral-100'}`}
    >
      {/* Activity type icon */}
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBgColor} ${iconColor}`}>
        {ActivityIcon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={`text-[0.7rem] font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            {formatDate(activity.day)}
          </p>
          {/* Intensity dot */}
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${workoutIntensityIndicator(activity)}`} />
        </div>
        <p className={`mt-0.5 text-base font-semibold leading-snug tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
          {workoutCatalogTitle(activity)}
        </p>
        <p className={`mt-0.5 text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
          {workoutCatalogSummary(activity)}
        </p>
      </div>

      {/* Selection chevron */}
      {isSelected ? (
        <svg viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.5 5l5 5-5 5" />
        </svg>
      ) : null}
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
  const category = activityCategory(activity)
  const isRun = category === 'running'
  const title = workoutCatalogTitle(activity)
  const buttonLabel = saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved' : 'Save note'
  const intensity = activityIntensityLabel(activity)
  const metrics = isRun
    ? [
        { label: 'Distance', value: activity.distance_miles ? `${trimNumber(activity.distance_miles)} mi` : '-' },
        { label: 'Pace', value: calendarPace(activity) },
        { label: 'Duration', value: activity.duration_minutes ? `${activity.duration_minutes} min` : '-' },
        { label: 'Intensity', value: intensity },
      ]
    : category === 'weightlifting'
      ? [
          { label: 'Workout', value: title },
          { label: 'Duration', value: activity.duration_minutes ? `${activity.duration_minutes} min` : '-' },
          ...(activity.strain ? [{ label: 'Strain', value: String(activity.strain) }] : []),
          ...(activity.lift_focus ? [{ label: 'Focus', value: calendarLiftFocus(activity) || '-' }] : []),
        ]
      : category === 'spin'
        ? [
            { label: 'Workout', value: title },
            { label: 'Duration', value: activity.duration_minutes ? `${activity.duration_minutes} min` : '-' },
            ...(activity.strain ? [{ label: 'Strain', value: trimNumber(activity.strain) }] : []),
            ...(activity.distance_miles ? [{ label: 'Distance', value: `${trimNumber(activity.distance_miles)} mi` }] : []),
          ]
        : [
            { label: 'Workout', value: title },
            ...(activity.duration_minutes ? [{ label: 'Duration', value: `${activity.duration_minutes} min` }] : []),
            ...(activity.strain ? [{ label: 'Strain', value: trimNumber(activity.strain) }] : []),
            ...(activity.calories ? [{ label: 'Calories', value: trimNumber(activity.calories) }] : []),
            ...(activity.raw_type && activity.raw_type !== activitySourceLabel(activity) ? [{ label: 'Type', value: humanizeActivityLabel(activity.raw_type) }] : []),
          ]
  const supportingText = isRun
    ? activity.duration_minutes
      ? `${activity.duration_minutes} min total`
      : 'Logged run'
    : category === 'weightlifting'
      ? activity.strain
        ? `WHOOP strain ${activity.strain}`
        : 'Logged lift'
      : category === 'spin'
        ? activity.strain
          ? `WHOOP strain ${activity.strain}`
          : 'Logged bike session'
        : activity.strain
          ? `WHOOP strain ${activity.strain}`
          : 'Logged activity'

  const detailCategory = activityCategory(activity)
  const detailIsRun = detailCategory === 'running'
  const detailIsStrength = detailCategory === 'weightlifting'
  const detailIsSpin = detailCategory === 'spin'
  const detailIconColor = detailIsRun
    ? isDark ? 'text-cyan-400' : 'text-cyan-600'
    : detailIsStrength
      ? isDark ? 'text-orange-400' : 'text-orange-600'
      : detailIsSpin
        ? isDark ? 'text-violet-400' : 'text-violet-600'
        : isDark ? 'text-neutral-400' : 'text-neutral-500'
  const detailIconBg = detailIsRun
    ? isDark ? 'bg-cyan-500/12' : 'bg-cyan-50'
    : detailIsStrength
      ? isDark ? 'bg-orange-500/12' : 'bg-orange-50'
      : detailIsSpin
        ? isDark ? 'bg-violet-500/12' : 'bg-violet-50'
        : isDark ? 'bg-neutral-800' : 'bg-neutral-100'
  const DetailIcon = detailIsRun ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9 1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>
  ) : detailIsStrength ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/></svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6l-2.2-2.5zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/></svg>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${detailIconBg} ${detailIconColor}`}>
          {DetailIcon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${workoutIntensityIndicator(activity)}`} />
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              {activityCategoryLabel(activity)} · {formatDate(activity.day)}
            </p>
          </div>
          <h3 className={`mt-1 text-3xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
            {title}
          </h3>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-2">
        {metrics.map((item) => (
          <div
            key={`${activity.activity_key}-${item.label}`}
            className={`rounded-[1.1rem] border px-4 py-4 ${isDark ? `border-neutral-800 bg-neutral-900/80` : 'border-neutral-100 bg-stone-50'}`}
          >
            <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              {item.label}
            </p>
            <p className={`mt-2 text-xl font-semibold leading-tight tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className={`mt-5 rounded-[1.2rem] border px-5 py-5 ${isDark ? `border-neutral-800 bg-neutral-900/80` : 'border-neutral-100 bg-stone-50'}`}>
        <div className="flex items-center justify-between gap-3">
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Notes & Reflection
          </p>
          <button
            type="button"
            onClick={() => onSaveNote(activity.activity_key)}
            disabled={saveState === 'saving'}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              saveState === 'saved'
                ? isDark ? 'bg-emerald-950/60 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                : isDark ? 'bg-white text-neutral-950 hover:bg-neutral-100 disabled:bg-neutral-700 disabled:text-neutral-400' : 'bg-neutral-950 text-white hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-500'
            }`}
          >
            {buttonLabel}
          </button>
        </div>
        <textarea
          value={noteValue}
          onChange={(event) => onNoteChange(activity.activity_key, event.target.value)}
          placeholder="How did it feel? Any soreness, wins, or notes for next time?"
          className={`mt-4 min-h-[13rem] w-full rounded-[0.9rem] border px-4 py-3.5 text-sm leading-7 outline-none transition resize-none ${isDark ? 'border-neutral-700/80 bg-neutral-950 text-white placeholder:text-neutral-600' : 'border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400'}`}
        />
        <p className={`mt-2.5 text-xs ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
          Notes are shared with the coach when generating your next recommendation.
        </p>
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
  const [hasPain, setHasPain] = useState(false)
  const [painSeverity, setPainSeverity] = useState('none')
  const [painLocation, setPainLocation] = useState('none')
  const [painWithRunning, setPainWithRunning] = useState(false)
  const [painWithWalking, setPainWithWalking] = useState(false)
  const [painWithCycling, setPainWithCycling] = useState(false)
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false)
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
          has_pain: hasPain,
          pain_severity: hasPain ? painSeverity : 'none',
          pain_location: hasPain ? painLocation : 'none',
          pain_with_running: hasPain ? painWithRunning : false,
          pain_with_walking: hasPain ? painWithWalking : false,
          pain_with_cycling: hasPain ? painWithCycling : null,
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
  const roundedAdaptiveWeeklyTarget = adaptiveWeeklyTarget ? Math.round(adaptiveWeeklyTarget) : 0
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
      <GlobalUiStyles />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
            hasPain={hasPain}
            painSeverity={painSeverity}
            painLocation={painLocation}
            painWithRunning={painWithRunning}
            painWithWalking={painWithWalking}
            painWithCycling={painWithCycling}
            isGenerating={isGenerating}
            onClose={() => setIsCheckInModalOpen(false)}
            onPhysicalChange={setPhysicalFeeling}
            onMentalChange={setMentalFeeling}
            onNotesChange={setNotes}
            onHasPainChange={(value) => {
              setHasPain(value)
              if (!value) {
                setPainSeverity('none')
                setPainLocation('none')
                setPainWithRunning(false)
                setPainWithWalking(false)
                setPainWithCycling(false)
              }
            }}
            onPainSeverityChange={setPainSeverity}
            onPainLocationChange={setPainLocation}
            onPainWithRunningChange={setPainWithRunning}
            onPainWithWalkingChange={setPainWithWalking}
            onPainWithCyclingChange={setPainWithCycling}
            onGenerate={handleGenerateRecommendation}
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

        <FadeSection>
        <section className="py-8">
          {/* Row 1: Sleep | Recovery | Resting HR — Row 2: Strain | Weekly Mileage (2-col wide) */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {/* --- Row 1 --- */}
            <StatCard
              icon={<Icon path="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />}
              label="Sleep"
              value={summary.latest_sleep_hours ? `${summary.latest_sleep_hours.toFixed(1)} hrs` : '-'}
              subtext="Latest WHOOP sleep duration"
              accent={isDark ? 'text-blue-300' : 'text-blue-700'}
              iconBg={isDark ? 'bg-blue-500/15' : 'bg-blue-50'}
              iconTone={isDark ? 'text-blue-400' : 'text-blue-600'}
              theme={theme}
              visual={summary.latest_sleep_hours ? (
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-[0.6rem] font-medium uppercase tracking-wide ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>Goal: 8 hrs</span>
                  <RadialArc pct={Math.min(100, (summary.latest_sleep_hours / 8) * 100)} color={isDark ? '#60a5fa' : '#3b82f6'} size={44} />
                </div>
              ) : null}
            />
            <StatCard
              icon={<BatteryIcon />}
              label="Recovery"
              value={summary.latest_recovery ? `${summary.latest_recovery}%` : '-'}
              subtext="Latest WHOOP recovery score"
              accent={
                summary.latest_recovery >= 67
                  ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                  : summary.latest_recovery >= 34
                    ? (isDark ? 'text-amber-400' : 'text-amber-600')
                    : (isDark ? 'text-red-400' : 'text-red-600')
              }
              iconBg={
                summary.latest_recovery >= 67
                  ? (isDark ? 'bg-emerald-500/15' : 'bg-emerald-50')
                  : summary.latest_recovery >= 34
                    ? (isDark ? 'bg-amber-500/15' : 'bg-amber-50')
                    : (isDark ? 'bg-red-500/15' : 'bg-red-50')
              }
              iconTone={
                summary.latest_recovery >= 67
                  ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                  : summary.latest_recovery >= 34
                    ? (isDark ? 'text-amber-400' : 'text-amber-600')
                    : (isDark ? 'text-red-400' : 'text-red-600')
              }
              theme={theme}
              visual={summary.latest_recovery != null ? (
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-[0.6rem] font-medium uppercase tracking-wide ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
                    {summary.latest_recovery >= 67 ? 'Peak' : summary.latest_recovery >= 34 ? 'Moderate' : 'Low'}
                  </span>
                  <RadialArc
                    pct={summary.latest_recovery}
                    color={
                      summary.latest_recovery >= 67
                        ? (isDark ? '#34d399' : '#10b981')
                        : summary.latest_recovery >= 34
                          ? (isDark ? '#fbbf24' : '#d97706')
                          : (isDark ? '#f87171' : '#ef4444')
                    }
                    size={44}
                  />
                </div>
              ) : null}
            />
            <StatCard
              icon={<HeartOutlineIcon />}
              label="Resting HR"
              value={summary.latest_resting_hr ? `${summary.latest_resting_hr} bpm` : '-'}
              subtext="Most recent resting heart rate"
              accent={isDark ? 'text-violet-300' : 'text-violet-700'}
              iconBg={isDark ? 'bg-violet-500/15' : 'bg-violet-50'}
              iconTone={isDark ? 'text-violet-400' : 'text-violet-700'}
              theme={theme}
            />

            {/* --- Row 2: Strain (1 col) + Mileage bar (2 cols) --- */}
            <StatCard
              icon={<Icon path="M13 10V3L4 14h7v7l9-11h-7z" />}
              label="Yesterday's Strain"
              value={summary.latest_strain ? `${summary.latest_strain}` : '-'}
              subtext="WHOOP strain from yesterday"
              accent={
                (summary.latest_strain || 0) >= 14
                  ? (isDark ? 'text-red-400' : 'text-red-600')
                  : (isDark ? 'text-orange-400' : 'text-orange-600')
              }
              iconBg={
                (summary.latest_strain || 0) >= 14
                  ? (isDark ? 'bg-red-500/15' : 'bg-red-50')
                  : (isDark ? 'bg-orange-500/15' : 'bg-orange-50')
              }
              iconTone={
                (summary.latest_strain || 0) >= 14
                  ? (isDark ? 'text-red-400' : 'text-red-600')
                  : (isDark ? 'text-orange-400' : 'text-orange-600')
              }
              theme={theme}
              visual={summary.latest_strain ? (
                <StrainSegments
                  value={summary.latest_strain}
                  color={(summary.latest_strain || 0) >= 14 ? (isDark ? '#f87171' : '#ef4444') : (isDark ? '#fb923c' : '#ea580c')}
                />
              ) : null}
            />

            {/* Weekly Mileage Progress — spans 2 columns in the 3-col grid */}
            {summary.recent_mileage != null && adaptiveWeeklyTarget > 0 ? (() => {
              const pct = Math.min(100, (summary.recent_mileage / adaptiveWeeklyTarget) * 100)
              const isOnTrack = loadAccent === 'text-emerald-600'
              const accentBar = isOnTrack ? 'bg-emerald-500' : 'bg-amber-400'
              const accentText = isOnTrack
                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                : isDark ? 'text-amber-400' : 'text-amber-500'
              const mileBadgeBg = isOnTrack
                ? isDark ? 'bg-emerald-950/70 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                : isDark ? 'bg-amber-950/70 text-amber-400' : 'bg-amber-50 text-amber-700'
              const mileIconBg = isOnTrack
                ? isDark ? 'bg-emerald-950/60 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                : isDark ? 'bg-amber-950/60 text-amber-400' : 'bg-amber-50 text-amber-500'
              const remaining = Math.max(0, roundedAdaptiveWeeklyTarget - summary.recent_mileage)
              return (
                <div
                  className={`col-span-2 flex flex-col justify-between rounded-2xl border px-6 py-5 transition duration-200 ${
                    isDark
                      ? 'border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.045)] hover:border-violet-500/60'
                      : 'border-neutral-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]'
                  }`}
                  style={isDark ? { background: 'linear-gradient(145deg, #1c1827 0%, #110f1b 100%)' } : undefined}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className={`text-[0.68rem] font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        Weekly Mileage
                      </p>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className={`text-[2.3rem] font-bold tabular-nums leading-none tracking-[-0.03em] sm:text-[2.6rem] ${accentText}`}>
                          {summary.recent_mileage.toFixed(1)}
                        </span>
                        <span className={`text-base ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          / {roundedAdaptiveWeeklyTarget} mi
                        </span>
                        <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${mileBadgeBg}`}>
                          {Math.round(pct)}%
                        </span>
                      </div>
                      <p className={`mt-1.5 text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        {remaining > 0 ? `${remaining.toFixed(1)} mi to hit your ${roundedAdaptiveWeeklyTarget} mi target` : 'Weekly target reached!'}
                      </p>
                    </div>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${mileIconBg}`}>
                      <BarChartIcon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-5">
                    <div className={`h-3 overflow-hidden rounded-full ${isDark ? 'bg-neutral-800/80' : 'bg-neutral-100'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${accentBar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className={`mt-2 flex justify-between text-[0.7rem] ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
                      <span>0 mi</span>
                      <span>{roundedAdaptiveWeeklyTarget} mi</span>
                    </div>
                  </div>
                </div>
              )
            })() : (
              /* Fallback if no mileage data — still occupies the 2-col slot */
              <div className={`col-span-2 flex items-center justify-center rounded-2xl border px-6 py-5 ${
                isDark ? 'border-neutral-700/50' : 'border-neutral-200 bg-white'
              }`}
                style={isDark ? { background: 'linear-gradient(145deg, #1c1827 0%, #110f1b 100%)' } : undefined}
              >
                <p className={`text-sm ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>No mileage data</p>
              </div>
            )}
          </div>
        </section>
        </FadeSection>

        <FadeSection delay={60}>
        <MasterTrainingCalendar
          weeklyPlans={summaryData.weekly_plan_views}
          theme={theme}
        />
        </FadeSection>

        <FadeSection delay={120}>
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
        </FadeSection>
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

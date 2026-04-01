import { useEffect, useRef, useState } from 'react'

const DARK_HOVER_GLOW = 'transition duration-200 hover:border-violet-500/55 hover:shadow-[0_0_0_1px_rgba(168,85,247,0.18),0_0_34px_rgba(168,85,247,0.18)]'
const LIGHT_HOVER_GLOW = 'transition duration-200 hover:border-violet-300/60 hover:shadow-[0_0_0_1px_rgba(192,132,252,0.2),0_0_28px_rgba(192,132,252,0.14)]'

function darkGlow(enabled) {
  return enabled ? DARK_HOVER_GLOW : ''
}

function lightGlow(enabled) {
  return enabled ? LIGHT_HOVER_GLOW : ''
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

      @keyframes iconVioletSweepDark {
        0%, 100% { color: #8b5cf6; }
        33% { color: #c084fc; }
        66% { color: #7c3aed; }
      }

      @keyframes iconVioletSweepLight {
        0%, 100% { color: #6d28d9; }
        33% { color: #7c3aed; }
        66% { color: #4f46e5; }
      }

      @keyframes snakeRotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
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

function WingedFootIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 247.87216 205.46603"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M 47.076189,204.88647 C 33.71135,202.30522 13.770607,194.96424 6.847878,190.07682 c -6.73735458,-4.75653 -8.431816,-9.75326 -5.3984956,-15.91939 2.4472936,-4.97486 6.8145436,-6.74865 15.5595766,-6.31964 17.85366,0.87587 19.622056,0.71298 23.462515,-2.16106 1.988092,-1.48779 11.06119,-9.71847 20.162441,-18.29037 9.101249,-8.57189 19.383114,-17.81292 22.848585,-20.5356 3.465472,-2.72268 7.596622,-6.89232 9.180333,-9.26587 l 2.879476,-4.31555 -4.093735,-9.55712 C 87.931511,95.501392 87.35652,93.133082 87.366767,86.899862 c 0.02205,-13.41216 3.19028,-21.8177 11.008822,-29.20716 6.815661,-6.44163 16.145111,-10.31126 36.211481,-15.01965 26.03802,-6.109589 34.04467,-8.693799 41.70506,-13.460653 10.06999,-6.266278 25.2766,-17.239384 31.26355,-22.5598085 8.91096,-7.91891 14.02985,-8.73585 16.43836,-2.623453 1.60356,4.069534 0.69299,8.0343665 -3.54377,15.4304465 -1.90191,3.320156 -3.44298,6.335586 -3.42459,6.700956 0.0184,0.36537 0.9488,1.820282 2.06759,3.233137 2.03041,2.564108 2.04004,2.565225 5.24251,0.607849 1.76459,-1.078537 5.06456,-3.542438 7.33326,-5.475334 5.92195,-5.045395 9.82953,-6.292413 12.96034,-4.135998 4.76931,3.284975 4.27903,9.433872 -1.47911,18.550149 -2.93399,4.645099 -2.95137,4.755099 -1.08457,6.866569 2.31568,2.61916 3.50171,8.74252 2.56329,13.23388 -0.3827,1.83163 -2.06747,4.97246 -3.74393,6.97961 -2.97371,3.56027 -3.00325,3.70148 -1.21018,5.78425 2.6801,3.11312 2.32607,8.52657 -0.84328,12.89457 -3.56227,4.9095 -11.22535,10.69978 -16.81465,12.70529 -3.73791,1.3412 -4.47527,2.03527 -4.25148,4.001888 0.65168,5.72675 -1.76029,9.42462 -10.75563,16.48983 -0.23952,0.18811 0.0997,0.90456 0.7537,1.59211 3.67996,3.86837 -0.58284,11.33861 -7.76016,13.5991 -2.78372,0.87672 -3.99632,2.0673 -5.25098,5.15562 -3.15348,7.76224 -15.38574,12.8694 -26.20904,10.94271 -3.47622,-0.61882 -6.39009,-1.06895 -6.47526,-1.00028 -0.0851,0.0687 -0.60582,4.07129 -1.15702,8.89473 -1.31135,11.47536 -4.15176,16.20524 -12.07683,20.11057 -5.39919,2.66061 -6.57075,2.8168 -21.84427,2.91227 l -16.13909,0.10088 -6.97456,3.87786 c -3.836,2.13283 -10.140111,6.25128 -14.009138,9.15212 -12.354229,9.26269 -18.144219,11.7005 -28.857328,12.15007 -5.13174,0.21535 -11.401893,-0.008 -13.933675,-0.49752 z m 18.040073,-6.44896 c 7.551609,-1.28808 11.397693,-3.21718 21.40736,-10.73743 4.088666,-3.0718 9.113897,-6.52512 11.167167,-7.67402 3.466261,-1.93955 3.732821,-2.43058 3.727621,-6.86657 -0.008,-6.71084 -1.536071,-11.74564 -5.356151,-17.64626 -3.48704,-5.38623 -14.518739,-14.06948 -17.874652,-14.06948 -1.087323,0 -8.940189,6.55899 -17.746561,14.82255 -8.687913,8.1524 -17.605099,15.73904 -19.81597,16.85919 -4.675032,2.36865 -7.418974,2.56603 -21.237071,1.52766 C 9.207,173.88808 9.205,173.88841 7.508523,176.61013 c -1.319646,2.11715 -1.453,3.20097 -0.600002,4.87641 2.255155,4.42956 27.702507,14.77523 41.422395,16.84036 8.867221,1.33471 9.581224,1.33942 16.785346,0.11061 z M 146.68085,170.9579 c 6.25852,-3.60832 8.11688,-7.85957 7.77316,-17.78219 -0.26203,-7.56442 -0.38539,-7.90888 -3.90232,-10.8964 -5.00338,-4.25022 -15.36599,-6.91403 -25.35652,-6.51812 -8.22294,0.32586 -12.09443,1.97422 -19.24892,8.19559 -2.79426,2.42981 -2.91073,2.8009 -1.59205,5.07217 3.76908,6.49179 6.16457,12.73547 6.86821,17.9015 0.76499,5.61641 0.81601,5.68448 4.78312,6.38096 2.20545,0.3872 8.99987,0.59822 15.09873,0.46894 9.62476,-0.20402 11.68137,-0.57667 15.57659,-2.82245 z m 37.63964,-30.9365 c 2.20473,-1.26681 4.15983,-3.12884 4.34468,-4.13786 0.28433,-1.55196 -0.48797,-1.84165 -5.01353,-1.88056 -2.94229,-0.0252 -7.35923,-0.4537 -9.8154,-0.952 -4.23613,-0.85938 -4.68339,-0.70763 -8.69759,2.9511 -2.32749,2.12139 -4.05606,4.04746 -3.84126,4.28014 0.21481,0.23268 2.54594,1.05059 5.1803,1.81755 5.9267,1.72551 12.56924,0.95177 17.8428,-2.07837 z m -82.24201,-6.09335 c 3.73482,-2.97161 7.83527,-5.9033 9.11214,-6.51486 2.46365,-1.17999 2.4376,-1.83364 -0.35283,-8.85403 -1.19807,-3.01419 -1.89564,-3.5253 -4.81144,-3.5253 -2.90284,0 -4.04427,0.82519 -7.671641,5.54608 -2.34379,3.05034 -5.890629,7.10162 -7.881881,9.00285 -3.077132,2.93799 -3.380665,3.60545 -2.022594,4.44758 0.878828,0.54495 2.687722,1.94471 4.019765,3.11057 1.33204,1.16584 2.51101,2.13554 2.61991,2.15487 0.10892,0.0193 3.25377,-2.39617 6.988571,-5.36776 z m 60.87356,-4.73381 c 0.80255,-1.85157 0.74579,-2.89296 -0.22466,-4.12215 -1.08119,-1.36946 -3.58646,-1.59567 -14.97063,-1.35178 -13.1308,0.28132 -13.68436,0.38299 -13.98059,2.56803 -0.36841,2.71749 2.30453,3.8301 14.37762,5.98465 9.17508,1.63736 13.10884,0.81895 14.79826,-3.07875 z m -35.39955,-4.12217 c 0,-3.97716 -0.57183,-5.38861 -3.50949,-8.66255 -4.22634,-4.71013 -5.15688,-9.05447 -3.64008,-16.993958 1.34862,-7.05906 4.97796,-13.24494 9.4509,-16.10819 6.76502,-4.33046 20.19143,-8.47063 36.20708,-11.16483 30.75048,-5.17294 52.7422,-15.027 66.44269,-29.77168 5.00971,-5.391534 10.35728,-15.284932 8.59547,-15.902269 -0.58454,-0.204823 -3.4213,1.52523 -6.30392,3.844563 -2.88262,2.319333 -9.31114,6.789781 -14.2856,9.934329 -24.19891,15.297067 -29.15617,17.266947 -53.91074,21.422607 -41.60183,6.98388 -49.23787,11.29402 -52.99167,29.91097 -0.62082,3.07894 -1.13026,7.11965 -1.13209,8.979358 -0.005,5.09867 7.95299,28.00807 9.92045,28.55886 4.61326,1.29149 5.157,0.86477 5.157,-4.04721 z m 71.88557,1.10785 c 3.57278,-1.56924 4.59733,-4.13294 2.06061,-5.15622 -0.78342,-0.31602 -7.23894,-0.67537 -14.3456,-0.79857 -13.05228,-0.22626 -17.39306,0.77061 -17.39306,3.99434 0,3.01981 23.70151,4.58546 29.67805,1.96045 z m -31.494,-10.27554 c 4.67127,-1.47121 6.40678,-4.11332 4.78906,-7.29082 -0.75754,-1.48798 -1.65887,-1.95982 -2.79894,-1.46523 -0.92487,0.40122 -10.49994,0.9478 -21.27793,1.21462 -10.77799,0.26681 -20.23772,0.70425 -21.0216,0.97207 -1.03142,0.35241 -0.47605,1.48967 2.00988,4.11575 l 3.43513,3.6288 15.46,0.0336 c 9.04058,0.0197 17.09781,-0.48229 19.4044,-1.20874 z m 38.65755,-5.73061 c 2.37231,-2.01386 3.981,-4.35351 4.1765,-6.07427 0.383,-3.37094 0.47044,-3.36441 -16.39704,-1.22503 -6.63261,0.84125 -13.03751,1.54436 -14.23312,1.56249 -1.99986,0.0303 -2.08819,0.3077 -1.10381,3.46624 0.58851,1.8883 1.2287,4.06953 1.42267,4.84717 0.2744,1.10009 2.78556,1.33455 11.31447,1.0564 10.52916,-0.34339 11.11411,-0.48678 14.82033,-3.633 z m -99.14795,-2.38942 c 0,-0.50112 -1.31952,-2.65656 -2.93228,-4.78986 -3.55136,-4.697588 -4.50449,-9.897348 -3.1619,-17.249428 1.70937,-9.36061 5.12615,-13.48545 15.56497,-18.79052 9.44528,-4.80015 11.37543,-5.42422 35.83436,-11.58625 22.29036,-5.6157 35.55435,-11.99589 49.55842,-23.838407 7.31429,-6.185314 12.06219,-12.550315 15.14244,-20.299839 2.17957,-5.4835525 0.32663,-5.2196625 -6.52637,0.929468 -10.46284,9.388184 -33.70214,24.884187 -42.5966,28.403467 -3.37878,1.336881 -13.8244,4.165241 -23.21249,6.285251 -34.64834,7.82422 -43.46974,12.13065 -48.555991,23.70403 -2.14205,4.87409 -2.60852,7.51356 -2.63368,14.90253 -0.0275,8.08319 0.30399,9.69104 3.3217,16.110028 3.158121,6.71768 3.550501,7.13067 6.774861,7.13067 1.88241,0 3.42256,-0.41001 3.42256,-0.91114 z m 61.87095,-7.56682 c 1.61925,-0.647158 3.71952,-1.914348 4.66728,-2.815968 1.56017,-1.48424 1.58145,-1.92749 0.22485,-4.68517 -1.41426,-2.87489 -1.6275,-2.95688 -3.79948,-1.46088 -2.45753,1.69268 -20.52149,3.6607 -33.87055,3.69012 -8.19191,0.0181 -9.99916,0.94859 -9.99916,5.148438 l 0,2.59636 19.91649,-0.64813 c 10.95407,-0.35647 21.24133,-1.17762 22.86057,-1.82477 z m 31.45961,-4.770368 c 18.03752,-2.74929 23.26745,-4.85265 31.03091,-12.48001 3.47219,-3.41131 4.10934,-6.02552 1.93162,-7.92541 -1.00696,-0.87849 -3.04154,-0.27195 -8.29077,2.47161 -8.29288,4.33437 -21.86511,8.2947 -34.7604,10.14297 -5.15831,0.73934 -9.52096,1.44863 -9.69478,1.57621 -0.17382,0.12757 -0.0104,1.94436 0.36308,4.03729 0.64572,3.61825 0.87724,3.80532 4.70929,3.80532 2.21661,0 8.83658,-0.73259 14.71105,-1.62798 z m -46.60079,-7.9569 c 6.63261,-0.64629 12.65439,-1.69056 13.38173,-2.32062 0.72734,-0.63005 1.99908,-2.52103 2.82608,-4.20217 l 1.50365,-3.05661 -4.83597,0.71807 c -13.7324,2.03905 -31.47946,7.45246 -33.01957,10.07203 -0.31661,0.5385 1.32169,0.73845 3.76197,0.45914 2.37755,-0.27213 9.7495,-1.02356 16.38211,-1.66984 z m -44.29099,-6.26105 c 0.46705,-1.83546 0.38794,-2.15768 -0.25935,-1.05639 -0.51225,0.87152 -1.23377,2.77303 -1.60338,4.22558 -0.46705,1.83546 -0.38794,2.15767 0.25935,1.05639 0.51225,-0.87152 1.23377,-2.77303 1.60338,-4.22558 z m 90.50018,-2.20343 c 13.39538,-2.9709 21.75248,-6.37345 29.86003,-12.15737 7.48873,-5.34246 9.7313,-9.47017 7.89839,-14.53791 -0.55562,-1.53623 -1.44616,-2.79315 -1.97898,-2.79315 -0.53281,0 -4.50096,2.66604 -8.8181,5.92453 -4.31715,3.25849 -10.33659,7.24488 -13.37654,8.85864 -7.24479,3.84591 -22.08071,9.33414 -29.58213,10.94328 -5.14828,1.10435 -6.06379,1.66413 -6.67944,4.08396 -0.39238,1.5423 -0.53361,2.9932 -0.31384,3.22423 0.62028,0.65202 11.91992,-1.09089 22.99061,-3.54621 z m -2.49425,-33.03709 c 14.23137,-7.634537 17.12387,-9.564019 16.8331,-11.228745 -0.53373,-3.055733 -3.70979,-2.199818 -9.16305,2.469348 -3.03466,2.598317 -8.37604,6.479227 -11.86974,8.624257 -7.40983,4.54939 -7.64691,4.74383 -5.76598,4.72888 0.78302,-0.006 5.26757,-2.07341 9.96567,-4.59374 z" />
    </svg>
  )
}

function DaySufficientDisplay({ theme = 'light' }) {
  const isDark = theme === 'dark'
  const message = "You killed it today. Focus on resting and fueling so that you can attack tomorrow's plan."
  const [footVisible, setFootVisible] = useState(false)
  const [started, setStarted] = useState(false)
  const { typed } = useTypedText(message, started, 26)

  useEffect(() => {
    const footTimer = window.setTimeout(() => setFootVisible(true), 100)
    const textTimer = window.setTimeout(() => setStarted(true), 700)
    return () => {
      window.clearTimeout(footTimer)
      window.clearTimeout(textTimer)
    }
  }, [])

  const shimmer = isDark
    ? 'animate-[violetCurrent_6s_linear_infinite] bg-[linear-gradient(90deg,#ffffff_0%,#c084fc_25%,#8b5cf6_50%,#c084fc_75%,#ffffff_100%)] bg-[length:200%_auto] bg-clip-text text-transparent'
    : 'animate-[violetCurrent_6s_linear_infinite] bg-[linear-gradient(90deg,#171717_0%,#7c3aed_28%,#4f46e5_50%,#7c3aed_72%,#171717_100%)] bg-[length:200%_auto] bg-clip-text text-transparent'

  return (
    <section className="pt-2 pb-3">
      <div className="flex flex-col items-center gap-4">
        {/* Winged foot — fades in, color sweep */}
        <span
          style={{
            animation: isDark ? 'iconVioletSweepDark 6s linear infinite' : 'iconVioletSweepLight 6s linear infinite',
            display: 'block',
            opacity: footVisible ? 1 : 0,
            transition: 'opacity 0.8s ease-in',
          }}
        >
          <WingedFootIcon className="h-20 w-auto" />
        </span>
        {/* Typed message — centered, shimmer */}
        <div className="max-w-lg text-center">
          <p className="relative text-xl font-semibold leading-relaxed tracking-tight">
            <span aria-hidden="true" className="block select-none opacity-0">{message}</span>
            <span className={`absolute inset-0 ${shimmer}`}>{typed || '\u00A0'}</span>
          </p>
        </div>
      </div>
    </section>
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
  const fullGreeting = `${timeOfDayGreeting()}, ${firstNameFromDisplayName(name)}`
  const now = new Date()
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now).toUpperCase()
  const monthDay = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(now).toUpperCase()
  const year = now.getFullYear()
  const datePrefixStr = `TODAY IS ${weekday}, `
  const dateSuffixStr = `${monthDay}, ${year}`
  const dateFullStr = `${datePrefixStr}${dateSuffixStr}`
  const moveStr = "LET'S MOVE"

  // Greeting fades in, then date + move type in sequence
  const [greetingVisible, setGreetingVisible] = useState(false)
  const [greetingDone, setGreetingDone] = useState(false)
  const { typed: dateTyped, complete: dateDone } = useTypedText(dateFullStr, greetingDone, 32)
  const { typed: moveTyped, complete: moveDone } = useTypedText(moveStr, dateDone, 36)

  // After move finishes typing, trigger the exit transition
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    setGreetingVisible(false)
    setGreetingDone(false)
    setTransitioning(false)
    // Small delay then fade in; signal done after fade completes so date starts typing
    const showTimer = window.setTimeout(() => setGreetingVisible(true), 150)
    const doneTimer = window.setTimeout(() => setGreetingDone(true), 750)
    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(doneTimer)
    }
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
    <header className="mx-auto flex w-full max-w-[1200px] flex-col justify-between gap-6 pb-3 md:flex-row md:items-start md:gap-8">
      <div className="min-w-0 flex-1">
        {/* Greeting — fades in */}
        <h1
          className="relative max-w-full text-[clamp(2rem,3.8vw,3.4rem)] font-bold leading-[1.12] tracking-[-0.02em] pb-2"
        >
          {/* Invisible block placeholder — pre-sizes h1 */}
          <span aria-hidden="true" className="block select-none opacity-0">{fullGreeting}</span>
          <span
            className="absolute inset-0 bg-clip-text text-transparent"
            style={{
              backgroundImage: isDark
                ? 'linear-gradient(158deg, #c8c8d4 0%, #ffffff 30%, #9898aa 52%, #ffffff 72%, #d4d4de 100%)'
                : 'linear-gradient(158deg, #1a1a1a 0%, #484848 28%, #0e0e0e 50%, #3c3c3c 72%, #1c1c1c 100%)',
              opacity: greetingVisible ? 1 : 0,
              transition: 'opacity 0.55s ease-in',
            }}
          >{fullGreeting}</span>
        </h1>

        <div className="mt-0 flex flex-col gap-1">
          {/* Date line: prefix collapses + fades, suffix slides left and stays */}
          <div
            className={`flex items-baseline overflow-hidden min-h-[1.5rem] text-[1.5rem] font-semibold uppercase tracking-[0.04em] leading-[1.25] ${
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
      <aside className={`absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l px-6 py-6 shadow-2xl ${isDark ? `border-neutral-800 bg-neutral-950 text-white ${darkGlow(true)}` : `border-neutral-200 bg-stone-50 text-neutral-950 ${lightGlow(true)}`}`}>
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
          <section className={`rounded-[1.75rem] border p-5 ${isDark ? `border-neutral-800 bg-neutral-900/90 ${darkGlow(true)}` : `border-neutral-200 bg-white ${lightGlow(true)}`}`}>
            <h3 className="text-2xl font-semibold tracking-tight">Athlete</h3>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {renderInput('Name', 'athlete_name')}
              {renderInput('Goal Race Date', 'goal_race_date', 'text', '2026-05-10')}
              {renderInput('Goal Half Time', 'goal_half_marathon_time', 'text', '1:45:00')}
              {renderInput('Recent Benchmark', 'recent_race_result', 'text', '10K in 48:30')}
            </div>
          </section>

          <section className={`rounded-[1.75rem] border p-5 ${isDark ? `border-neutral-800 bg-neutral-900/90 ${darkGlow(true)}` : `border-neutral-200 bg-white ${lightGlow(true)}`}`}>
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

          <section className={`rounded-[1.75rem] border p-5 ${isDark ? `border-neutral-800 bg-neutral-900/90 ${darkGlow(true)}` : `border-neutral-200 bg-white ${lightGlow(true)}`}`}>
            <h3 className="text-2xl font-semibold tracking-tight">Integrations</h3>
            <div className="mt-5 grid grid-cols-1 gap-5">
              {[
                ['Strava', profileSettings.strava],
                ['WHOOP', profileSettings.whoop],
              ].map(([label, provider]) => (
                <div key={label} className={`rounded-[1.4rem] border p-4 ${isDark ? `border-neutral-800 bg-neutral-950/90 ${darkGlow(true)}` : `border-neutral-200 bg-stone-50 ${lightGlow(true)}`}`}>
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
              <label className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${isDark ? `border-neutral-800 bg-neutral-950 ${darkGlow(true)}` : `border-neutral-200 bg-white ${lightGlow(true)}`}`}>
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

function SnakeBorderButton({ isDark, label }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-[2px]">
      {/* Rotating conic-gradient snake */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: '400%',
          height: '400%',
          top: '-150%',
          left: '-150%',
          background: isDark
            ? 'conic-gradient(transparent 0deg, transparent 205deg, #7c3aed 242deg, #c084fc 268deg, #e879f9 278deg, #c084fc 292deg, #7c3aed 318deg, transparent 355deg)'
            : 'conic-gradient(transparent 0deg, transparent 205deg, #5b21b6 242deg, #7c3aed 268deg, #8b5cf6 278deg, #7c3aed 292deg, #5b21b6 318deg, transparent 355deg)',
          animation: 'snakeRotate 2.2s linear infinite',
          transformOrigin: 'center',
        }}
      />
      <div className={`relative rounded-[14px] px-6 py-3 ${isDark ? 'bg-[#1c1628]' : 'bg-[#f4f0ff]'}`}>
        <span className={`whitespace-nowrap font-bold text-xl tracking-wide ${isDark ? 'text-violet-300' : 'text-violet-700'}`}>
          {label}
        </span>
      </div>
    </div>
  )
}

function RecommendationLauncher({ onOpen, theme = 'light', hasRecommendation = false, isGenerating = false }) {
  const isDark = theme === 'dark'
  if (hasRecommendation) return null

  const shimmer = isDark
    ? 'animate-[violetCurrent_6s_linear_infinite] bg-[linear-gradient(90deg,#ffffff_0%,#c084fc_25%,#8b5cf6_50%,#c084fc_75%,#ffffff_100%)] bg-[length:200%_auto] bg-clip-text text-transparent'
    : 'animate-[violetCurrent_6s_linear_infinite] bg-[linear-gradient(90deg,#171717_0%,#7c3aed_28%,#4f46e5_50%,#7c3aed_72%,#171717_100%)] bg-[length:200%_auto] bg-clip-text text-transparent'

  return (
    <section className="pt-2 pb-3">
      <div className="flex justify-center">
        <div
          role="button"
          tabIndex={0}
          onClick={isGenerating ? undefined : onOpen}
          onKeyDown={isGenerating ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') onOpen() }}
          className={`group relative inline-block overflow-hidden select-none ${isGenerating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {/* ── IDLE STATE: Generate | Foot | Recommendation ── */}
          {!isGenerating && (
            <div className="flex items-center justify-center gap-5 transition-opacity duration-300 group-hover:opacity-0 group-hover:pointer-events-none">
              {/* "Generate" with violetCurrent shimmer */}
              <span className={`text-3xl font-bold tracking-tight ${shimmer}`}>
                Generate
              </span>

              {/* Winged foot — color-sweep shimmer, runs off right on hover */}
              <span
                className="inline-block transition-[transform,opacity] duration-500 ease-in group-hover:translate-x-[600%] group-hover:opacity-0"
                style={{
                  animation: isDark
                    ? 'iconVioletSweepDark 6s linear infinite'
                    : 'iconVioletSweepLight 6s linear infinite',
                }}
              >
                <WingedFootIcon className="h-20 w-auto" />
              </span>

              {/* "Recommendation" with violetCurrent shimmer */}
              <span className={`text-3xl font-bold tracking-tight ${shimmer}`}>
                Recommendation
              </span>
            </div>
          )}

          {/* ── HOVER / GENERATING STATE: Snake border button ── */}
          <div
            className={`flex items-center justify-center transition-opacity duration-300 ${
              isGenerating
                ? 'opacity-100 pointer-events-auto'
                : 'absolute inset-0 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
            }`}
            style={{ transitionDelay: isGenerating ? '0ms' : '120ms' }}
          >
            <SnakeBorderButton
              isDark={isDark}
              label={isGenerating ? 'Generating…' : 'I want to move it, move it'}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function SurveySlider({ label, lowLabel, highLabel, value, onChange, isDark }) {
  const pct = ((value - 1) / 9) * 100
  const sliderColor = value <= 4 ? '#ef4444' : value <= 6 ? '#f59e0b' : '#22c55e'
  const dotBg = value <= 4 ? 'bg-red-500' : value <= 6 ? 'bg-amber-400' : 'bg-emerald-500'
  const dotGlow = value <= 4
    ? 'shadow-[0_0_8px_2px_rgba(239,68,68,0.75)]'
    : value <= 6
    ? 'shadow-[0_0_8px_2px_rgba(245,158,11,0.75)]'
    : 'shadow-[0_0_8px_2px_rgba(34,197,94,0.75)]'
  const trackBg = isDark ? '#2a2a2a' : '#e5e5e5'

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {label}
        </p>
        <span className={`h-3 w-3 rounded-full ${dotBg} ${dotGlow} transition-all duration-200`} />
      </div>
      <input
        type="range"
        min="1"
        max="10"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer appearance-none rounded-full"
        style={{
          height: '6px',
          background: `linear-gradient(to right, ${sliderColor} ${pct}%, ${trackBg} ${pct}%)`,
          accentColor: sliderColor,
        }}
      />
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>{lowLabel}</span>
        <span className={`text-sm font-semibold tabular-nums ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>{value} / 10</span>
        <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>{highLabel}</span>
      </div>
    </div>
  )
}

function CheckInModal({
  isOpen,
  physicalFeeling,
  mentalFeeling,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Close recommendation prompts"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/45 backdrop-blur-sm"
      />
      <section className={`relative z-10 flex max-h-[90vh] w-full max-w-[52rem] flex-col overflow-hidden rounded-[2rem] border shadow-[0_30px_120px_rgba(0,0,0,0.22)] ${
        isDark ? 'border-neutral-800 bg-neutral-900/98' : 'border-neutral-200 bg-white/98'
      }`}>
        <div
          className="recommendation-modal-scroll flex-1 overflow-y-auto px-7 pb-0 pt-7 md:px-10 md:pt-9"
          style={{ background: isDark ? 'linear-gradient(180deg, #110f1b 0%, #0d0b14 100%)' : '#ffffff' }}
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                Daily Check-In
              </p>
              <h2 className={`mt-3 text-[2.1rem] font-semibold leading-[1.1] tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                How are you feeling today?
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-lg transition ${
                isDark
                  ? 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-violet-500 hover:text-white'
                  : 'border-neutral-200 bg-white text-neutral-500 hover:border-violet-300 hover:text-neutral-900'
              }`}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="mt-9 space-y-9">
            <SurveySlider
              label="Legs"
              lowLabel="Destroyed"
              highLabel="Fresh"
              value={physicalFeeling}
              onChange={onPhysicalChange}
              isDark={isDark}
            />
            <SurveySlider
              label="Mind"
              lowLabel="Drained"
              highLabel="Sharp"
              value={mentalFeeling}
              onChange={onMentalChange}
              isDark={isDark}
            />
          </div>

          <div className="mt-9 pb-6">
              <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Experiencing pain?
              </p>
              <button
                type="button"
                onClick={() => onHasPainChange(!hasPain)}
                className={`mt-3 inline-flex items-center gap-3 rounded-full border px-3 py-2 text-sm font-medium transition ${
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
                <span>{hasPain ? 'Yes' : 'No'}</span>
                <span className={`relative inline-flex h-6 w-11 rounded-full transition ${hasPain ? (isDark ? 'bg-violet-500/90' : 'bg-violet-500') : (isDark ? 'bg-neutral-800' : 'bg-neutral-300')}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-200 ${hasPain ? 'left-[1.35rem]' : 'left-0.5'}`} />
                </span>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${hasPain ? 'mt-6 max-h-[30rem] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                    Pain when running
                  </label>
                  <label className={`flex items-center gap-3 text-sm ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
                    <input type="checkbox" checked={painWithWalking} onChange={(event) => onPainWithWalkingChange(event.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-violet-600 focus:ring-violet-500" />
                    Pain when walking
                  </label>
                  <label className={`flex items-center gap-3 text-sm ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
                    <input type="checkbox" checked={painWithCycling} onChange={(event) => onPainWithCyclingChange(event.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-violet-600 focus:ring-violet-500" />
                    Pain when cycling
                  </label>
                </div>
              </div>
          </div>
        </div>

        <div
          className={`sticky bottom-0 border-t px-7 py-5 md:px-10 ${isDark ? 'border-neutral-700/50' : 'border-neutral-200 bg-white/98'}`}
          style={isDark ? { background: 'rgba(13, 11, 20, 0.98)' } : undefined}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className={`text-sm font-medium transition ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-950'}`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating}
              className={`inline-flex items-center gap-3 rounded-full px-7 py-4 text-sm font-semibold transition ${
                isGenerating
                  ? isDark ? 'cursor-not-allowed bg-neutral-800 text-neutral-500' : 'cursor-not-allowed bg-neutral-200 text-neutral-500'
                  : isDark ? 'bg-violet-600 text-white shadow-[0_12px_28px_rgba(109,40,217,0.28)] hover:bg-violet-500' : 'bg-neutral-950 text-white shadow-[0_12px_28px_rgba(76,29,149,0.22)] hover:bg-neutral-800'
              }`}
            >
              {isGenerating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-neutral-700" />
                  Generating...
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
    <section className={`mx-auto max-w-[90rem] rounded-[2rem] border p-6 shadow-sm ${isDark ? `border-neutral-800 bg-neutral-900/95 ${darkGlow(true)}` : `border-neutral-200 bg-white/95 ${lightGlow(true)}`}`}>
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
        <div className={`rounded-[1.9rem] border p-6 shadow-sm ${isDark ? `border-neutral-800 bg-neutral-950 ${darkGlow(true)}` : `border-neutral-200 bg-white ${lightGlow(true)}`}`}>
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
        <div className={`rounded-[1.9rem] border p-6 ${isDark ? `border-neutral-800 bg-neutral-950/80 ${darkGlow(true)}` : `border-neutral-200 bg-stone-50 ${lightGlow(true)}`}`}>
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isDark ? 'bg-violet-950/70 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
              <DumbbellIcon />
            </div>
            <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Strength
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
          isDark ? `border-sky-900/40 bg-sky-950/30 ${darkGlow(true)}` : `border-sky-200 bg-sky-50/80 ${lightGlow(true)}`
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
    <div className={`mt-8 overflow-hidden rounded-[2rem] border shadow-sm ${isDark ? `border-neutral-800 bg-neutral-900/95 ${darkGlow(true)}` : `border-neutral-200 bg-white/95 ${lightGlow(true)}`}`}>
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
    <div className={`rounded-[1.5rem] border px-5 py-4 ${isDark ? `border-neutral-800 bg-neutral-950/80 ${darkGlow(true)}` : `border-neutral-200 bg-stone-50 ${lightGlow(true)}`}`}>
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
    <div className={`rounded-[1.5rem] border p-5 ${isDark ? `border-neutral-800 bg-neutral-950/80 ${darkGlow(true)}` : `border-neutral-200 bg-stone-50 ${lightGlow(true)}`}`}>
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
    <section className={`mt-8 rounded-[2rem] border p-8 shadow-sm ${isDark ? `border-neutral-800 bg-neutral-900/95 ${darkGlow(true)}` : `border-neutral-200 bg-white/95 ${lightGlow(true)}`}`}>
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
          <div key={week.week_start} className={`rounded-[1.6rem] border p-5 ${isDark ? `border-neutral-800 bg-neutral-950/85 ${darkGlow(true)}` : `border-neutral-200 bg-stone-50 ${lightGlow(true)}`}`}>
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

            <div className={`mt-4 rounded-[1.35rem] border px-4 py-4 ${isDark ? `border-neutral-800 bg-neutral-900/90 ${darkGlow(true)}` : `border-neutral-200 bg-white ${lightGlow(true)}`}`}>
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

  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0)

  useEffect(() => {
    setSelectedWeekIndex(0)
  }, [weeklyPlans?.[0]?.week_key])

  const safeIndex = Math.min(selectedWeekIndex, weeklyPlans.length - 1)
  const selectedWeek = weeklyPlans[safeIndex]
  const isCurrentWeek = safeIndex === 0
  const weekCards = Array.isArray(selectedWeek?.days) ? selectedWeek.days : []
  const futureFocus = selectedWeek?.weekly_focus || {}
  const futureProjection = selectedWeek?.future_projection || {}

  return (
    <section className={`mt-10 rounded-[2.3rem] border px-6 py-7 shadow-sm md:px-8 ${isDark ? `border-neutral-800 bg-neutral-900/95 ${darkGlow(true)}` : `border-neutral-200 bg-white/95 ${lightGlow(true)}`}`}>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className={`text-4xl font-semibold tracking-tight md:text-5xl ${isDark ? 'text-white' : 'text-neutral-950'}`}>Training Calendar</h2>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <p className={`text-lg font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              {isCurrentWeek ? formatWeekSpan(weekCards) : formatRoadmapWeekSpan(selectedWeek)}
            </p>
            {isCurrentWeek ? (
              <div className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-neutral-500/85' : 'text-neutral-500/85'}`}>
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                <span>This Week</span>
              </div>
            ) : (
              <span className={`text-xs font-semibold ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Week {safeIndex + 1} <span className="font-normal">/ {weeklyPlans.length}</span>
              </span>
            )}
          </div>
        </div>

        {weeklyPlans.length > 1 ? (
          <div className="flex items-center gap-2 self-start mt-1">
            <button
              type="button"
              onClick={() => setSelectedWeekIndex((v) => Math.max(0, v - 1))}
              disabled={safeIndex === 0}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                safeIndex === 0
                  ? isDark ? 'cursor-not-allowed border-neutral-800 text-neutral-700' : 'cursor-not-allowed border-neutral-200 text-neutral-300'
                  : isDark ? 'border-neutral-700 text-neutral-300 hover:border-violet-500 hover:text-violet-300' : 'border-neutral-300 text-neutral-600 hover:border-violet-400 hover:text-violet-700'
              }`}
              aria-label="Previous week"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.5 5l-5 5 5 5" /></svg>
            </button>
            <button
              type="button"
              onClick={() => setSelectedWeekIndex((v) => Math.min(weeklyPlans.length - 1, v + 1))}
              disabled={safeIndex === weeklyPlans.length - 1}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                safeIndex === weeklyPlans.length - 1
                  ? isDark ? 'cursor-not-allowed border-neutral-800 text-neutral-700' : 'cursor-not-allowed border-neutral-200 text-neutral-300'
                  : isDark ? 'border-neutral-700 text-neutral-300 hover:border-violet-500 hover:text-violet-300' : 'border-neutral-300 text-neutral-600 hover:border-violet-400 hover:text-violet-700'
              }`}
              aria-label="Next week"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 5l5 5-5 5" /></svg>
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-8 overflow-x-auto">
        {isCurrentWeek ? (
          <div className="grid min-w-[46rem] grid-cols-7 gap-2 xl:gap-3">
            {weekdayHeadings.map((heading) => (
              <p key={heading} className={`text-center text-sm font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                {heading}
              </p>
            ))}
            {weekCards.map((card) => (
              <CalendarCard key={card.day} card={card} theme={theme} />
            ))}
          </div>
        ) : (
          <div className={`rounded-[1.4rem] border px-6 py-6 ${isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-neutral-200 bg-white'}`}>
            <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
              {formatRoadmapWeekSpan(selectedWeek)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] ${
                isDark ? 'border-violet-800/70 bg-violet-950/40 text-violet-300' : 'border-violet-200 bg-violet-50 text-violet-800'
              }`}>
                {futureProjection.phaseTitle || selectedWeek?.focus_title || futureFocus.phase || 'Weekly Focus'}
              </span>
              {(futureProjection.targetMileage || futureProjection.longRunTarget) ? (
                <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                  isDark ? 'border-neutral-700 bg-neutral-900 text-neutral-300' : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                }`}>
                  {[
                    futureProjection.targetMileage ? `${trimNumber(futureProjection.targetMileage)} mi` : '',
                    futureProjection.longRunTarget ? `${trimNumber(futureProjection.longRunTarget)} mi long` : '',
                  ].filter(Boolean).join(' · ')}
                </span>
              ) : null}
            </div>
            <p className={`mt-4 text-sm leading-7 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              {selectedWeek?.focus_summary || futureProjection.summary || futureFocus.progression_note || futureFocus.race_connection || 'Future guidance will appear here.'}
            </p>
            {futureProjection.keySessionSummary ? (
              <p className={`mt-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
                {futureProjection.keySessionSummary}
              </p>
            ) : null}
          </div>
        )}
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
  const isRest = activities.length === 0 && !isToday
  const weekdayShort = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date).toUpperCase()
  const dayNumber = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(date)

  return (
    <div
      className={`relative min-h-[15rem] rounded-[1.3rem] border px-2.5 pb-3 pt-2.5 shadow-sm xl:min-h-[17rem] ${
        isToday
          ? isDark
            ? `border-2 border-white bg-neutral-900 ${darkGlow(true)}`
            : 'border-2 border-neutral-950 bg-white'
          : isRest
            ? isDark
              ? 'border-2 border-emerald-500 bg-neutral-900/90 shadow-[0_0_14px_rgba(52,211,153,0.22)]'
              : 'border-2 border-emerald-400 bg-white shadow-[0_0_14px_rgba(52,211,153,0.20)]'
            : isDark
              ? `border-neutral-800 bg-neutral-900/90 ${darkGlow(true)}`
              : `border-neutral-200 bg-white ${lightGlow(true)}`
      }`}
    >
      {isRest && (
        <div className={`absolute -top-[10px] left-1/2 h-[10px] w-7 -translate-x-1/2 rounded-t-sm ${isDark ? 'bg-emerald-500' : 'bg-emerald-400'}`} />
      )}

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
                viewBox="0 0 24 24"
                className={`h-10 w-10 ${isDark ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.75)]' : 'text-emerald-500 drop-shadow-[0_0_8px_rgba(52,211,153,0.60)]'}`}
                fill="currentColor"
                aria-label="Rest day"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
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
              Strength
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
    <div className={`rounded-[1.75rem] border p-5 ${toneMap[tone]} ${fullWidth ? 'w-full' : ''} ${isDark ? darkGlow(true) : lightGlow(true)}`}>
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
    .replace(/^weightlifting$/i, 'Strength')
    .replace(/^weight lifting$/i, 'Strength')
    .replace(/^weight training$/i, 'Strength')
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
  if (/^strength$/i.test(compact)) return ''
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
    { key: 'strength', label: 'Strength', icon: <DumbbellIcon className="h-4 w-4" /> },
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
    <section className={`mt-10 rounded-[2.3rem] border px-6 py-7 shadow-sm md:px-8 ${isDark ? `border-neutral-800 bg-neutral-900/95 ${darkGlow(true)}` : `border-neutral-200 bg-white/95 ${lightGlow(true)}`}`}>
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

      <div className={`mt-6 overflow-hidden rounded-[2rem] border ${isDark ? `border-neutral-800 bg-neutral-950/90 ${darkGlow(true)}` : `border-neutral-200 bg-white ${lightGlow(true)}`}`}>
        <div className="grid h-[min(38rem,72vh)] grid-cols-1 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className={`flex min-h-0 flex-col border-b xl:border-b-0 xl:border-r ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
            <div className={`shrink-0 border-b px-6 py-5 ${isDark ? 'border-neutral-800 bg-neutral-950/95' : 'border-neutral-200 bg-white/95'}`}>
              <p className={`text-sm font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {currentFilterLabel}
              </p>
              <p className={`mt-2 text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                {filteredActivities.length} workouts
              </p>
            </div>

            <div className="workout-catalog-scroll flex-1 overflow-y-auto">
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
  if (category === 'weightlifting') return 'Strength'
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
  const [physicalFeeling, setPhysicalFeeling] = useState(5)
  const [mentalFeeling, setMentalFeeling] = useState(5)
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
    if (payload.recommendation) {
      setRecommendationData(payload.recommendation)
    }
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
          physical_feeling: physicalFeeling,
          mental_feeling: mentalFeeling,
          notes: notes,
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
          recommendationData.day_sufficient ? (
            <DaySufficientDisplay theme={theme} />
          ) : (
            <div className="mt-2">
              <TrainingCard
                recommendation={recommendationData}
                recommendationExplanation={summaryData.recommendation_explanation}
                today={summaryData.today}
                onUpdateCheckIn={() => setIsCheckInModalOpen(true)}
                theme={theme}
              />
            </div>
          )
        ) : null}

        <FadeSection>
        <section className="pt-4 pb-8">
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
                      ? `border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.045)] ${DARK_HOVER_GLOW}`
                      : `border-neutral-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)] ${LIGHT_HOVER_GLOW}`
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

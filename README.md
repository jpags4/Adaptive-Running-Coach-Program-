# Adaptive Running Coach

Adaptive Running Coach is a browser-based coaching app that combines:

- WHOOP biometrics and workout data as the canonical training-session source
- Strava running history as a run-enrichment source
- a short daily check-in
- adaptive week-by-week planning
- a persistent workout log with notes

The goal is to turn objective training data and subjective feedback into a more useful daily recommendation, while also keeping the weekly picture clear.

## What The App Does

The app currently supports:

- a live dashboard powered by connected Strava and WHOOP accounts
- sample mode when live accounts are not connected
- a modal-based daily check-in before recommendation generation
- adaptive run, lift, and conservative bike-substitution recommendations for the current day
- a fixed current-week training calendar plus a compact future-planner preview
- a full activity log covering running, weightlifting, spin, and fallback activities
- saved workout notes that are reused in future recommendation context
- local development and hosted deployment on Render

## Core Experience

### 1. Dashboard First

When the page loads, the app shows:

- greeting, animated date/motivation lines, and race countdown
- a `Generate Today’s Recommendation` button
- WHOOP and running summary cards

The main health metrics currently shown are:

- sleep
- recovery
- resting heart rate
- yesterday’s strain
- last run mileage
- weekly mileage progress

`Weekly Mileage Progress` is adaptive. It compares current weekly mileage against this week’s generated target instead of a fixed saved mileage number.

### 2. Recommendation Flow

The recommendation is intentionally generated on demand.

When the user clicks `Generate Today’s Recommendation`, the app opens a check-in modal that asks for:

- how the legs feel
- current mental state
- optional notes

Once submitted:

- the modal closes
- the main page button shows a loading state
- the recommendation renders on the page when ready

The recommendation area includes:

- today’s training recommendation
- run guidance
- lift guidance
- bike guidance when running is swapped out for lower-impact aerobic work
- explanation and guardrail language
- an `Update Check-In` flow for refreshing the recommendation

### 3. Weekly Planning

Below the recommendation and metrics, the app shows training planning in two layers:

- a fixed current-week calendar
- a compact future planner for the next several weeks

The current week area includes:

- the current Sunday-start week
- completed and projected activity cards for the week
- current-day highlighting
- current-week-specific logged and planned activity

The future planner is collapsed by default. When expanded, it shows one compact future-week projection at a time, including:

- week label
- projected focus phase
- one short summary
- compact metadata such as mileage target, long-run target, and key session emphasis

### 4. Full Activity Log

At the bottom of the page, the app keeps a persistent workout history with filters for:

- Running
- Weightlifting
- Spin
- All Workouts

Each workout can be expanded to:

- review details
- add or edit notes
- save notes for future coaching context

Recent notes are weighted more heavily than old notes when the model builds new recommendations.

Workout history is canonicalized so one real session appears once across the app:

- WHOOP owns the rendered workout session identity
- Strava enriches matched runs with run-specific detail such as distance and pace
- Strava does not create standalone workout-log or calendar entries

## Adaptive Planning Behavior

The app no longer treats weekly mileage as a fixed setting.

Instead, weekly volume is inferred from:

- recent running history
- comfortable long-run history
- current training progression
- current weekly intent

That adaptive weekly target is then used by:

- the weekly focus cards
- the weekly calendar
- the future planner projections
- recommendation guardrails
- weekly mileage progress

## Data Sources

### Strava

Strava is used for:

- run enrichment only
- run distance
- duration
- pace
- activity title and supporting run metadata when a confident WHOOP match exists

Strava does not create standalone calendar or workout-log entries.

### WHOOP

WHOOP is used for:

- recovery
- sleep
- resting heart rate
- HRV
- strain
- workouts

WHOOP is the canonical session source for:

- workout log entries
- training calendar entries
- completed-session history

WHOOP lifting sessions are used as strength-history inputs, and WHOOP spin/cycling sessions are used as the canonical bike-history source.

## Safety And Guardrails

The recommendation system applies guardrails around:

- low recovery
- low sleep
- elevated resting heart rate
- recent hard sessions
- recent strain accumulation
- subjective signals like heavy legs, soreness, stress, illness, or injury notes
- progression limits relative to recent long-run history
- pain check-in rules for cautious bike substitution when running impact is the main issue

These guardrails can:

- downshift intensity
- remove a hard session
- cap volume
- recommend a lifting off-day
- turn the day into recovery or rest
- swap a run for a conservative bike session when the pain and activity rules support it

## Recommendation Engine

The recommendation engine uses OpenAI through [llm_coach.py](/Users/paganomedia/Documents/New%20project/llm_coach.py), with deterministic training structure and guardrails coming from the broader coaching layer in [coach.py](/Users/paganomedia/Documents/New%20project/coach.py).

The recommendation payload includes:

- athlete profile
- recent runs
- recent recovery metrics
- current weekly intent
- daily subjective check-in
- pain check-in details
- recent saved workout notes

## API Routes

The backend currently exposes these main routes:

- `GET /api/dashboard`
- `GET /api/profile-settings`
- `POST /api/profile-settings`
- `POST /api/recommendation`
- `POST /api/activity-notes`
- `GET /connect/strava`
- `GET /connect/whoop`
- `GET /strava/callback`
- `GET /whoop/callback`

## Project Structure

- [app.py](/Users/paganomedia/Documents/New%20project/app.py): HTTP server, dashboard payloads, canonical workout assembly, roadmap generation, calendar generation
- [coach.py](/Users/paganomedia/Documents/New%20project/coach.py): weekly intent logic, pace model, recommendation structures, progression rules, and bike substitution rules
- [llm_coach.py](/Users/paganomedia/Documents/New%20project/llm_coach.py): OpenAI recommendation flow and final explanation generation
- [integrations.py](/Users/paganomedia/Documents/New%20project/integrations.py): Strava and WHOOP integration helpers, canonical source inputs, and profile construction
- [storage.py](/Users/paganomedia/Documents/New%20project/storage.py): local/hosted settings, token persistence, and storage helpers
- [sample_data.py](/Users/paganomedia/Documents/New%20project/sample_data.py): sample athlete data for fallback mode
- [frontend/src/App.jsx](/Users/paganomedia/Documents/New%20project/frontend/src/App.jsx): full React dashboard UI
- [test_coach.py](/Users/paganomedia/Documents/New%20project/test_coach.py): unit tests for planning and recommendation behavior

## Run Locally

From the project root:

```bash
python3 app.py
```

Then open [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Local Setup

1. Run `python3 app.py`
2. Open the app in your browser
3. Open profile/setup
4. Enter:
   - athlete name
   - goal race date
   - preferred long run day
   - recent race result or benchmark
   - comfortable long run
   - desired runs per week
   - desired strength sessions per week
   - adaptation emphasis
   - injury or niggle notes
   - Strava client ID and secret
   - WHOOP client ID and secret
   - public base URL if needed
5. Save settings
6. Connect Strava
7. Connect WHOOP
8. Refresh the dashboard

## Hosting

This project supports hosted deployment on Render.

Important environment variables:

- `APP_BASE_URL`
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `WHOOP_CLIENT_ID`
- `WHOOP_CLIENT_SECRET`
- `ATHLETE_NAME`
- `GOAL_RACE_DATE`
- `PREFERRED_LONG_RUN_DAY`
- `ALLOW_INSECURE_SSL`

### Render Setup

1. Push the repo to GitHub
2. Create a new Render Web Service from the repo
3. Use the included [render.yaml](/Users/paganomedia/Documents/New%20project/render.yaml)
4. Create a Render Postgres database
5. Connect `DATABASE_URL`
6. Set `APP_BASE_URL` to the live Render URL
7. Update Strava and WHOOP callbacks to:
   - `https://your-app.onrender.com/strava/callback`
   - `https://your-app.onrender.com/whoop/callback`

## Storage Notes

Without `DATABASE_URL`, the app falls back to local storage in the project folder.

That is fine for local development, but hosted deployments should use Postgres so OAuth tokens and saved state survive restarts and deploys.

## Testing

Backend tests:

```bash
python3 -m unittest test_coach.py
```

Frontend build:

```bash
cd frontend
npm install
npm run build
```

## Current Product Direction

The app is already capable of adaptive daily coaching, but the long-term direction is to continue improving:

- historical training memory
- strength programming quality
- race-specific planning blocks
- better explanation of why a recommendation changed
- smarter use of recent workout notes
- richer comparisons between planned work and completed work

## Coaching Philosophy

The app is built around a few core ideas:

- use real training and recovery data, not generic plans
- treat subjective feedback as a first-class signal
- progress mileage gradually rather than forcing a static target
- keep hard/easy balance visible
- prefer safe adaptation over rigid schedule compliance
- let the model personalize language and tradeoffs while keeping hard training rules grounded in explicit logic

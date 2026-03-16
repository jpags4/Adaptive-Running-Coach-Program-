# Adaptive Half Marathon Coach

Adaptive Half Marathon Coach is a browser-based training app that combines recent running history, WHOOP recovery data, and a short daily check-in to generate a more personalized half marathon recommendation.

The app currently supports:

- sample mode with built-in example data
- live mode after connecting your own Strava and WHOOP accounts
- a daily check-in before recommendation generation
- projected training calendar updates after today's recommendation is created
- local development and hosted deployment workflows

## What It Does Today

- pulls recent run history and recovery data into a dashboard
- shows health metrics and a rolling weekly recap before generating a plan
- asks for subjective inputs like physical feel, mental state, and optional notes
- generates a daily run and strength recommendation with reasoning and watchouts
- projects the upcoming training calendar after the daily recommendation is generated

## How The App Evolved

This project has moved through a few phases, and I want to preserve that history rather than overwrite it:

- earliest version:
  - focused on a lightweight MVP that adjusted training from Strava-style load and WHOOP-style readiness
  - relied more on built-in coaching logic and heuristic rules
  - emphasized a simple dashboard that immediately showed a recommendation
- middle phase:
  - added hosted deployment support through Render
  - added environment-variable-based configuration
  - added token persistence and a path toward Postgres-backed storage
  - shifted recommendation generation toward OpenAI
- current phase:
  - uses OpenAI as the main recommendation engine
  - asks for a daily qualitative check-in before generating the plan
  - separates fast-loading health data from slower recommendation generation
  - keeps the dashboard visible first, then reveals the plan and projected calendar after recommendation generation

## Project Structure

- `app.py`: HTTP server, setup routes, dashboard data, and recommendation endpoint
- `llm_coach.py`: OpenAI-powered recommendation generation
- `coach.py`: older coaching heuristics and shared recommendation models
- `integrations.py`: Strava and WHOOP integration helpers
- `storage.py`: local and hosted storage helpers
- `sample_data.py`: sample athlete profile, runs, and recovery metrics
- `static/index.html`: dashboard UI

## Run It

```bash
python3 app.py
```

Then open [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Beginner-Friendly Setup

1. Start the app with `python3 app.py`.
2. Open the app in your browser.
3. Click `Open setup`.
4. Paste in:
   - your Strava client ID and client secret
   - your WHOOP client ID and client secret
   - your public app URL
5. Save the setup form.
6. Click `Connect Strava`.
7. Click `Connect WHOOP`.
8. Return to the dashboard, review your health data, complete the daily check-in, and generate your recommendation.

The app stores local setup values on your own machine, and hosted deployments can instead read from environment variables.

## Current Recommendation Flow

The dashboard is intentionally split into two stages:

1. Fast data load:
   - health metrics
   - weekly recap
   - connected account status
2. On-demand recommendation generation:
   - physical check-in
   - mental check-in
   - optional notes
   - OpenAI-generated run and lift recommendation

This change was made so users are not staring at half-loaded recommendation panels while the model is still thinking.

## OpenAI-Powered Recommendations

The current app relies on OpenAI as the primary recommendation engine through `llm_coach.py`.

If `OPENAI_API_KEY` is set, the app sends:

- recent runs
- recent recovery metrics
- athlete profile context
- daily subjective check-in inputs

to OpenAI and asks for a structured coaching recommendation.

Important context:

- older built-in coaching logic is still part of the codebase and documents the original approach
- the current app no longer silently falls back to that older path for the main recommendation experience
- if the OpenAI request fails, the app reports that the recommendation is unavailable

## Hosted Deployment

If your school or work network interferes with API traffic, hosting the backend is usually the better setup.

This project supports hosted deployment with:

- environment-based configuration
- `APP_BASE_URL` for public callback routing
- `DATABASE_URL` for persistent token storage
- `OPENAI_API_KEY` and `OPENAI_MODEL` for recommendation generation
- `render.yaml` for Render deployment
- `runtime.txt` and `requirements.txt` for Python hosting support

### Hosting Environment Variables

The hosted app expects:

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
- `WEEKLY_MILEAGE_TARGET`
- `PREFERRED_LONG_RUN_DAY`

You can see an example in `.env.example`.

### Render Steps

1. Push this project to GitHub.
2. Create a Render account and connect your GitHub account.
3. Create a new Web Service from this repo.
4. Let Render use the included `render.yaml`.
5. Create a Render Postgres database named `adaptive-running-coach-db`.
6. Fill in the environment variables above.
7. Connect `DATABASE_URL` to that Postgres database.
8. Copy your deployed Render URL, for example `https://your-app.onrender.com`.
9. Set `APP_BASE_URL` to that exact URL.
10. Update your Strava and WHOOP app dashboards to use:
   - `https://your-app.onrender.com/strava/callback`
   - `https://your-app.onrender.com/whoop/callback`
11. Open the deployed app and reconnect Strava and WHOOP if needed.

## Storage Notes

Without `DATABASE_URL`, the app falls back to local storage in the app folder.

That is okay for local development, but not ideal for a hosted app because:

- tokens may disappear after redeploys or restarts
- you may need to reconnect Strava and WHOOP

With a real Postgres database connected, the app can keep OAuth tokens between reloads, restarts, and deploys.

## Callback URLs

Use your app's public URL for both providers:

- Strava callback: `https://your-app-domain/strava/callback`
- WHOOP callback: `https://your-app-domain/whoop/callback`

For local development, that public URL can be an ngrok URL. For hosting, it will be your Render URL.

## Product Direction

Planned or partially emerging directions include:

1. better long-horizon weekly planning
2. stronger database-backed history and recommendation tracking
3. feedback loops for soreness, motivation, and schedule constraints
4. clearer progression rules around mileage increases and hard/easy balance
5. a safer hybrid between deterministic training constraints and LLM explanation

## Coaching Philosophy

The original idea behind this project still matters:

- use objective signals like recovery, sleep, strain, and training load
- avoid blindly forcing mileage when the body is not ready
- keep hard/easy balance and race specificity in view
- treat health-adjacent recommendations more carefully than generic workout content

For a more mature version of the product, I would still want the final system grounded in explicit safety and progression rules, even if an LLM handles the coaching language and personalization layer.

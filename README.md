# Adaptive Half Marathon Coach

This is a lightweight MVP for an app that adjusts a half marathon training plan from two signal sources:

- Strava-style training history for recent workouts and load
- Whoop-style recovery metrics for readiness, sleep, and physiological stress

The current version can do two modes:

- sample mode, using built-in example data
- live mode, once you connect your own Strava and WHOOP accounts

## What it does

- Calculates simple training load indicators from recent runs
- Evaluates recovery, sleep, strain, and resting heart rate trends
- Chooses a daily workout recommendation with reasoning and caution flags
- Shows the result in a local browser dashboard

## Project structure

- `app.py`: minimal HTTP server and JSON endpoint
- `coach.py`: recommendation engine and training heuristics
- `sample_data.py`: sample athlete profile, runs, and recovery metrics
- `static/index.html`: dashboard UI

## Run it

```bash
python3 app.py
```

Then open [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Beginner-friendly setup

1. Start the app with `python3 app.py`.
2. Open the app in your browser.
3. Click `Open setup`.
4. Paste in:
   - your Strava client ID and client secret
   - your WHOOP client ID and client secret
   - your ngrok public URL
5. Save the setup form.
6. Click `Connect Strava`.
7. Click `Connect WHOOP`.

The app stores those values in `data/settings.local.json` on your own computer. That file is ignored by git so your secrets stay local.

## Hosted backend plan

If your school or work network interferes with API traffic, the better setup is to run the backend on the internet instead of on your laptop.

This project is now ready for that:

- the app reads hosting secrets from environment variables
- the app reads the public site URL from `APP_BASE_URL`
- the app can persist tokens in a real database through `DATABASE_URL`
- the app can use OpenAI reasoning for recommendations through `OPENAI_API_KEY`
- the app listens on the hosting platform's port automatically
- `render.yaml` is included for Render deployment
- `runtime.txt` pins the Python version for hosting
- `requirements.txt` is included so hosting platforms recognize the app layout cleanly

### Hosting environment variables

The hosted app expects these values:

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

### Render steps

1. Create a GitHub repository and push this project to it.
2. Create a Render account and connect your GitHub account.
3. Create a new Web Service from this repo.
4. Let Render use the included `render.yaml`.
5. Create a Render Postgres database named `adaptive-running-coach-db`.
6. In Render, fill in the environment variables above.
7. Make sure `DATABASE_URL` is connected to that Postgres database.
8. After deploy, copy your Render URL, for example `https://your-app.onrender.com`.
9. Set `APP_BASE_URL` in Render to that exact URL.
10. Update your Strava and WHOOP app dashboards to use:
   - `https://your-app.onrender.com/strava/callback`
   - `https://your-app.onrender.com/whoop/callback`
11. Add `OPENAI_API_KEY` if you want ChatGPT-powered recommendations.
12. Optionally set `OPENAI_MODEL` to `gpt-5-mini` or another supported model.
13. Open the deployed app and click `Connect Strava` and `Connect WHOOP`.

## OpenAI-powered recommendations

The app now supports two recommendation modes:

- primary OpenAI reasoning from `llm_coach.py`
- emergency deterministic fallback from `coach.py` only if the API key is missing or the OpenAI call fails

If `OPENAI_API_KEY` is set, the app sends recent runs, recovery metrics, and training context directly to OpenAI and asks for a structured coaching recommendation. The older built-in logic is no longer used to shape the model's answer. It is only kept as a technical backup if the API key is missing or the OpenAI call fails.

### Important note about storage

Without `DATABASE_URL`, the app falls back to local storage in the app folder. That is okay for early local development, but not reliable for a hosted app.

That means:

- tokens may disappear after redeploys or restarts
- you may need to reconnect Strava and WHOOP occasionally

With a real Postgres database connected, the app can keep your OAuth tokens between reloads, restarts, and deploys.

## Callback URLs

Use your app's public URL for both providers:

- Strava callback: `https://your-app-domain/strava/callback`
- WHOOP callback: `https://your-app-domain/whoop/callback`

For local development, that public URL can be an ngrok URL. For hosting, it will be your Render URL.

## Product roadmap

1. Add OAuth and data syncing for Strava and Whoop.
2. Store athlete profile, plan history, and recommendation outcomes in a database.
3. Split the engine into two layers:
   - deterministic safety rules for injury risk, recovery, and plan progression
   - an LLM layer that explains the recommendation in coach-like language
4. Add feedback loops:
   - athlete-reported soreness, motivation, and schedule constraints
   - compliance tracking and automatic plan adjustments
5. Add a calendar view and a longer-horizon weekly planning mode.

## Notes on the coaching logic

For a real product, I would keep the final recommendation grounded in explicit rules even if an LLM is used for explanation. That gives you a safer system for health-adjacent guidance:

- hard-stop or downshift rules when recovery is poor or resting heart rate is elevated
- mileage progression constraints
- taper and race-specific periodization
- training load balancing across easy, workout, and long-run days

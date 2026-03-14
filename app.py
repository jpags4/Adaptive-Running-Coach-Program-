from __future__ import annotations

import json
import os
from html import escape
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from coach import coach_recommendation, recent_mileage
from integrations import (
    OAuthError,
    build_strava_authorize_url,
    build_whoop_authorize_url,
    exchange_strava_code,
    exchange_whoop_code,
    fetch_strava_snapshot,
    fetch_whoop_snapshot,
    generate_state,
    merge_live_data,
    profile_from_settings,
    safe_iso_today,
    snapshot_preview,
    strava_redirect_uri,
    valid_access_token,
    whoop_redirect_uri,
)
from sample_data import SAMPLE_METRICS, SAMPLE_PROFILE, SAMPLE_RUNS
from storage import load_settings, load_states, load_tokens, save_settings, save_states, save_tokens, using_hosted_env


ROOT = Path(__file__).parent
STATIC_DIR = ROOT / "static"


def html_page(title: str, body: str) -> str:
    return f"""
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{escape(title)}</title>
        <style>
          body {{
            margin: 0;
            padding: 32px;
            font-family: Georgia, "Times New Roman", serif;
            background: linear-gradient(145deg, #f7f0e7, #e6efe8 60%, #dce8e4);
            color: #17211f;
          }}

          main {{
            max-width: 900px;
            margin: 0 auto;
          }}

          .card {{
            background: rgba(255, 251, 245, 0.94);
            border: 1px solid rgba(23, 33, 31, 0.12);
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 18px;
          }}

          .button {{
            display: inline-block;
            padding: 12px 16px;
            border-radius: 999px;
            background: #d96c3f;
            color: white;
            text-decoration: none;
            margin-right: 10px;
          }}

          input {{
            width: 100%;
            padding: 12px;
            border-radius: 12px;
            border: 1px solid rgba(23, 33, 31, 0.16);
            margin-top: 6px;
            margin-bottom: 14px;
          }}

          label {{
            font-size: 0.92rem;
          }}
        </style>
      </head>
      <body>
        <main>{body}</main>
      </body>
    </html>
    """


def setup_form(settings: dict, message: str = "") -> str:
    strava = settings.get("strava", {})
    whoop = settings.get("whoop", {})
    hosted_env = using_hosted_env()
    public_base_url = settings.get("public_base_url", "")
    return html_page(
        "Setup",
        f"""
        <div class="card">
          <h1>App Setup</h1>
          <p>This page stores your app IDs and secrets on your own computer so you do not need to type them into Terminal.</p>
          <p><strong>{'Hosted environment variables are active, so this page is now mainly for reference.' if hosted_env else 'Right now the app is using local settings saved on this machine.'}</strong></p>
          {f"<p><strong>{escape(message)}</strong></p>" if message else ""}
        </div>

        <form method="POST" action="/setup" class="card">
          <h2>About You</h2>
          <label>Athlete name
            <input name="athlete_name" value="{escape(settings.get("athlete_name", ""))}" />
          </label>
          <label>Goal race date (example: 2026-05-10)
            <input name="goal_race_date" value="{escape(settings.get("goal_race_date", ""))}" />
          </label>
          <label>Weekly mileage target
            <input name="weekly_mileage_target" value="{escape(str(settings.get("weekly_mileage_target", "28")))}" />
          </label>
          <label>Preferred long run day
            <input name="preferred_long_run_day" value="{escape(settings.get("preferred_long_run_day", "Sunday"))}" />
          </label>

          <h2>Strava</h2>
          <label>Strava client ID
            <input name="strava_client_id" value="{escape(strava.get("client_id", ""))}" {"readonly" if hosted_env else ""} />
          </label>
          <label>Strava client secret
            <input name="strava_client_secret" value="{escape(strava.get("client_secret", ""))}" {"readonly" if hosted_env else ""} />
          </label>

          <h2>WHOOP</h2>
          <label>WHOOP client ID
            <input name="whoop_client_id" value="{escape(whoop.get("client_id", ""))}" {"readonly" if hosted_env else ""} />
          </label>
          <label>WHOOP client secret
            <input name="whoop_client_secret" value="{escape(whoop.get("client_secret", ""))}" {"readonly" if hosted_env else ""} />
          </label>
          <label>Public base URL (local example: https://your-name.ngrok-free.dev, hosted example: https://your-app.onrender.com)
            <input name="public_base_url" value="{escape(public_base_url)}" {"readonly" if hosted_env else ""} />
          </label>
          <label>
            <input type="checkbox" name="allow_insecure_ssl" {"checked" if settings.get("allow_insecure_ssl") else ""} style="width:auto; margin-right:8px;" />
            Allow insecure SSL for local development only
          </label>
          <p>This is only for cases where your network adds its own certificate and Python refuses the connection.</p>

          {'<button type="submit">Save setup</button>' if not hosted_env else '<p>Change hosted values in your hosting dashboard environment settings.</p>'}
        </form>

        <div class="card">
          <h2>Useful Callback URLs</h2>
          <p><strong>Strava:</strong> {escape(strava_redirect_uri(public_base_url) if public_base_url else "Add your public base URL above to generate this")}</p>
          <p><strong>WHOOP:</strong> {escape(whoop_redirect_uri(public_base_url) if public_base_url else "Add your public base URL above to generate this")}</p>
          <p><a class="button" href="/">Back to dashboard</a></p>
        </div>
        """,
    )


def callback_success_page(provider: str, preview: dict) -> str:
    latest = preview.get("latest_item")
    latest_html = f"<pre>{escape(json.dumps(latest, indent=2))}</pre>" if latest else "<p>No sample item was returned yet.</p>"
    return html_page(
        f"{provider} Connected",
        f"""
        <div class="card">
          <h1>{escape(provider)} connected</h1>
          <p>The app successfully completed the login return step and saved your token locally.</p>
        </div>
        <div class="card">
          <h2>What the app just imported</h2>
          <p><strong>Provider:</strong> {escape(preview.get("provider", provider))}</p>
          <p><strong>Name on account:</strong> {escape(preview.get("athlete_name", "") or "Not returned")}</p>
          <p><strong>Items found:</strong> {preview.get("items_found", 0)}</p>
          {latest_html}
        </div>
        <div class="card">
          <a class="button" href="/">Back to dashboard</a>
          <a class="button" href="/setup">Open setup</a>
        </div>
        """,
    )


def callback_warning_page(title: str, details: str) -> str:
    return html_page(
        title,
        f"""
        <div class="card">
          <h1>{escape(title)}</h1>
          <p>{escape(details)}</p>
          <p>This relaxed check is only for local development while we get your connection working.</p>
        </div>
        <div class="card">
          <a class="button" href="/">Back to dashboard</a>
          <a class="button" href="/setup">Open setup</a>
        </div>
        """,
    )


def error_page(title: str, details: str) -> str:
    return html_page(
        title,
        f"""
        <div class="card">
          <h1>{escape(title)}</h1>
          <p>{escape(details)}</p>
          <p><a class="button" href="/setup">Open setup</a> <a class="button" href="/">Back to dashboard</a></p>
        </div>
        """,
    )


def debug_query_summary(query: dict[str, list[str]]) -> str:
    safe_query = {key: values for key, values in query.items()}
    return escape(json.dumps(safe_query, indent=2))


class CoachHandler(BaseHTTPRequestHandler):
    def _send_json(self, payload: dict, status: int = 200) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_html_file(self, filename: str) -> None:
        path = STATIC_DIR / filename
        body = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_html_text(self, body: str, status: int = 200) -> None:
        encoded = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def _redirect(self, location: str) -> None:
        self.send_response(302)
        self.send_header("Location", location)
        self.end_headers()

    def _read_form(self) -> dict[str, str]:
        content_length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(content_length).decode("utf-8")
        parsed = parse_qs(body)
        return {key: values[0] for key, values in parsed.items()}

    def _connected_status(self, settings: dict, tokens: dict) -> dict:
        return {
            "strava": bool(settings.get("strava", {}).get("client_id")) and bool(tokens.get("strava")),
            "whoop": bool(settings.get("whoop", {}).get("client_id")) and bool(tokens.get("whoop")),
        }

    def do_POST(self) -> None:
        if self.path != "/setup":
            self._send_html_text(error_page("Not found", "That form target does not exist."), status=404)
            return
        if using_hosted_env():
            self._send_html_text(setup_form(load_settings(), message="Hosted environment variables are active, so local setup changes are disabled."))
            return

        form = self._read_form()
        settings = {
            "athlete_name": form.get("athlete_name", "").strip(),
            "goal_race_date": form.get("goal_race_date", "").strip(),
            "weekly_mileage_target": form.get("weekly_mileage_target", "28").strip() or "28",
            "preferred_long_run_day": form.get("preferred_long_run_day", "Sunday").strip() or "Sunday",
            "public_base_url": form.get("public_base_url", "").strip(),
            "allow_insecure_ssl": form.get("allow_insecure_ssl") == "on",
            "strava": {
                "client_id": form.get("strava_client_id", "").strip(),
                "client_secret": form.get("strava_client_secret", "").strip(),
            },
            "whoop": {
                "client_id": form.get("whoop_client_id", "").strip(),
                "client_secret": form.get("whoop_client_secret", "").strip(),
            },
        }
        save_settings(settings)
        self._send_html_text(setup_form(settings, message="Saved. You can go back and press Connect now."))

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        query = parse_qs(parsed.query)
        settings = load_settings()
        tokens = load_tokens()
        states = load_states()

        if parsed.path == "/":
            self._send_html_file("index.html")
            return

        if parsed.path == "/setup":
            self._send_html_text(setup_form(settings))
            return

        if parsed.path == "/connect/strava":
            client_id = settings.get("strava", {}).get("client_id", "")
            public_base_url = settings.get("public_base_url", "")
            if not client_id:
                self._send_html_text(error_page("Missing Strava setup", "Open Setup and add your Strava client ID and client secret first."))
                return
            if not public_base_url:
                self._send_html_text(error_page("Missing public URL", "Open Setup and add your app's public base URL first."))
                return

            state = generate_state()
            states["strava"] = state
            save_states(states)
            self._redirect(build_strava_authorize_url(client_id, public_base_url, state))
            return

        if parsed.path == "/connect/whoop":
            client_id = settings.get("whoop", {}).get("client_id", "")
            public_base_url = settings.get("public_base_url", "")
            if not client_id or not public_base_url:
                self._send_html_text(error_page("Missing WHOOP setup", "Open Setup and add your WHOOP client ID, client secret, and ngrok public URL first."))
                return

            state = generate_state()
            states["whoop"] = state
            save_states(states)
            self._redirect(build_whoop_authorize_url(client_id, public_base_url, state))
            return

        if parsed.path == "/strava/callback":
            if query.get("state", [""])[0] != states.get("strava", ""):
                self._send_html_text(error_page("Strava state mismatch", "The app could not verify that this login return belongs to your current session. Please try Connect Strava again."))
                return

            code = query.get("code", [""])[0]
            if not code:
                self._send_html_text(error_page("Missing Strava code", "Strava returned without an authorization code."))
                return

            try:
                provider_settings = settings.get("strava", {})
                public_base_url = settings.get("public_base_url", "")
                token_payload = exchange_strava_code(
                    provider_settings["client_id"],
                    provider_settings["client_secret"],
                    strava_redirect_uri(public_base_url),
                    code,
                    allow_insecure_ssl=bool(settings.get("allow_insecure_ssl")),
                    user_agent=settings.get("app_user_agent", "AdaptiveRunningCoach/0.1"),
                )
                tokens["strava"] = token_payload
                save_tokens(tokens)
                snapshot = fetch_strava_snapshot(
                    token_payload["access_token"],
                    allow_insecure_ssl=bool(settings.get("allow_insecure_ssl")),
                    user_agent=settings.get("app_user_agent", "AdaptiveRunningCoach/0.1"),
                )
                self._send_html_text(callback_success_page("Strava", snapshot_preview("strava", snapshot)))
            except Exception as exc:
                self._send_html_text(error_page("Strava connection failed", str(exc)), status=500)
            return

        if parsed.path == "/whoop/callback":
            code = query.get("code", [""])[0]
            if not code:
                details = "WHOOP returned without an authorization code."
                debug_html = html_page(
                    "Missing WHOOP code",
                    f"""
                    <div class="card">
                      <h1>Missing WHOOP code</h1>
                      <p>{escape(details)}</p>
                      <p>This means WHOOP reached your app, but did not include the login code needed to finish the connection.</p>
                    </div>
                    <div class="card">
                      <h2>What WHOOP sent back</h2>
                      <pre>{debug_query_summary(query)}</pre>
                    </div>
                    <div class="card">
                      <a class="button" href="/">Back to dashboard</a>
                      <a class="button" href="/setup">Open setup</a>
                    </div>
                    """,
                )
                self._send_html_text(debug_html)
                return

            returned_state = query.get("state", [""])[0]
            expected_state = states.get("whoop", "")
            state_warning = ""
            if expected_state and returned_state and returned_state != expected_state:
                state_warning = "WHOOP returned a different state value than expected, so the app is continuing in relaxed local development mode."
            elif expected_state and not returned_state:
                state_warning = "WHOOP did not return a state value, so the app is continuing in relaxed local development mode."

            try:
                provider_settings = settings.get("whoop", {})
                redirect_uri = whoop_redirect_uri(settings.get("public_base_url", ""))
                token_payload = exchange_whoop_code(
                    provider_settings["client_id"],
                    provider_settings["client_secret"],
                    redirect_uri,
                    code,
                    allow_insecure_ssl=bool(settings.get("allow_insecure_ssl")),
                    user_agent=settings.get("app_user_agent", "AdaptiveRunningCoach/0.1"),
                )
                tokens["whoop"] = token_payload
                save_tokens(tokens)
                snapshot = fetch_whoop_snapshot(
                    token_payload["access_token"],
                    allow_insecure_ssl=bool(settings.get("allow_insecure_ssl")),
                    user_agent=settings.get("app_user_agent", "AdaptiveRunningCoach/0.1"),
                )
                body = callback_success_page("WHOOP", snapshot_preview("whoop", snapshot))
                if state_warning:
                    body = body.replace(
                        "<div class=\"card\">\n          <h2>What the app just imported</h2>",
                        f"<div class=\"card\"><p><strong>{escape(state_warning)}</strong></p></div><div class=\"card\">\n          <h2>What the app just imported</h2>",
                    )
                self._send_html_text(body)
            except Exception as exc:
                self._send_html_text(error_page("WHOOP connection failed", str(exc)), status=500)
            return

        if parsed.path == "/api/dashboard":
            connection_status = self._connected_status(settings, tokens)
            profile = SAMPLE_PROFILE
            runs = SAMPLE_RUNS
            metrics = SAMPLE_METRICS
            live_preview = {"mode": "sample"}

            try:
                live_strava = None
                live_whoop = None

                if tokens.get("strava"):
                    refreshed = valid_access_token("strava", settings, tokens)
                    if refreshed:
                        tokens["strava"] = refreshed
                        save_tokens(tokens)
                        live_strava = fetch_strava_snapshot(
                            refreshed["access_token"],
                            allow_insecure_ssl=bool(settings.get("allow_insecure_ssl")),
                            user_agent=settings.get("app_user_agent", "AdaptiveRunningCoach/0.1"),
                        )

                if tokens.get("whoop"):
                    refreshed = valid_access_token("whoop", settings, tokens)
                    if refreshed:
                        tokens["whoop"] = refreshed
                        save_tokens(tokens)
                        live_whoop = fetch_whoop_snapshot(
                            refreshed["access_token"],
                            allow_insecure_ssl=bool(settings.get("allow_insecure_ssl")),
                            user_agent=settings.get("app_user_agent", "AdaptiveRunningCoach/0.1"),
                        )

                if live_strava and live_whoop:
                    merged = merge_live_data(live_strava, live_whoop, settings)
                    if merged["runs"] and merged["metrics"]:
                        profile = merged["profile"]
                        runs = merged["runs"]
                        metrics = merged["metrics"]
                        live_preview = {
                            "mode": "live",
                            "strava_runs_found": len(runs),
                            "whoop_days_found": len(metrics),
                        }
            except Exception as exc:
                live_preview = {"mode": "sample", "warning": str(exc)}

            recommendation = coach_recommendation(profile, runs, metrics)
            payload = {
                "profile": {
                    "name": profile.name,
                    "goal_race_date": profile.goal_race_date,
                    "weekly_mileage_target": profile.weekly_mileage_target,
                    "preferred_long_run_day": profile.preferred_long_run_day,
                },
                "summary": {
                    "recent_mileage": recent_mileage(runs),
                    "latest_recovery": metrics[-1].recovery_score,
                    "latest_sleep_hours": metrics[-1].sleep_hours,
                    "latest_strain": metrics[-1].strain,
                },
                "recommendation": recommendation.to_dict(),
                "connections": {
                    "status": connection_status,
                    "setup_complete": {
                        "strava": bool(settings.get("strava", {}).get("client_id")),
                        "whoop": bool(settings.get("whoop", {}).get("client_id")),
                    },
                    "public_base_url": settings.get("public_base_url", ""),
                    "strava_callback_url": strava_redirect_uri(settings.get("public_base_url", "")) if settings.get("public_base_url") else "",
                    "whoop_callback_url": whoop_redirect_uri(settings.get("public_base_url", "")) if settings.get("public_base_url") else "",
                },
                "data_mode": live_preview,
                "today": safe_iso_today(),
            }
            self._send_json(payload)
            return

        self._send_html_text(error_page("Not found", "That page does not exist."), status=404)


def run_server(host: str = "127.0.0.1", port: int = 8000) -> None:
    server = HTTPServer((host, port), CoachHandler)
    print(f"Serving adaptive run coach at http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    default_host = "0.0.0.0" if os.environ.get("PORT") else "127.0.0.1"
    run_server(
        host=os.environ.get("HOST", default_host),
        port=int(os.environ.get("PORT", "8000")),
    )

#!/usr/bin/env bash
# Drive this worktree's ArtNote for verification. Run from anywhere inside the worktree.
#
#   control.sh launch                 set up the worktree, start the dev server, wait until usable
#   control.sh doctor                 read-only health check of this worktree's instance
#   control.sh evidence <feature>     create and print a fresh evidence directory for one proof
#   control.sh signin <account> [s]   sign in through the UI in playwright-cli session s
#                                     (account: admin | writer | user | banned; s defaults to the account)
#   control.sh session <s>            print the full playwright-cli session name for short name s
#   control.sh sql "<SELECT …>"       SQL in a read-only transaction against this worktree's database
#   control.sh cleanup                close our browser sessions, stop the server we started,
#                                     delete local [QA] rows. Evidence is kept.
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"
STATE="$ROOT/.verify/state"
EVIDENCE_ROOT="$ROOT/.verify/evidence"
SEED_PASSWORD='artnote-dev-password'

die() { echo "error: $*" >&2; exit 1; }

env_value() { # read one variable from .env without sourcing the secrets into the shell
  [ -f .env ] || return 0
  sed -nE "s/^$1=\"?([^\"]*)\"?\$/\1/p" .env | tail -1
}
base_url() { local u; u=$(env_value BASE_URL); [ -n "$u" ] || die ".env has no BASE_URL: run control.sh launch"; echo "$u"; }
port() { local u; u=$(base_url); u=${u##*:}; echo "${u%%/*}"; }
database() { local u; u=$(env_value PRISMA_DATABASE_URL); u=${u##*/}; echo "${u%%\?*}"; }
prefix() { echo "artnote-$(port)"; }   # playwright-cli session prefix: unique per worktree
pw() { playwright-cli "$@"; }          # always run from the worktree root (cd above)

listener_pid() { ss -ltnpH "sport = :$(port)" 2>/dev/null | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2; }

psql_local() {
  local db; db=$(database)
  case "$(env_value PRISMA_DATABASE_URL)" in
    *@localhost:5432/*|*@127.0.0.1:5432/*) ;;
    *) echo "error: PRISMA_DATABASE_URL is not the local Docker Postgres; refusing" >&2; return 1 ;;
  esac
  local docker_env=()
  [ -n "${READONLY:-}" ] && docker_env=(-e PGOPTIONS='-c default_transaction_read_only=on')
  docker compose exec -T "${docker_env[@]}" db psql -X -q -v ON_ERROR_STOP=1 -U artnote -d "$db" "$@"
}

ready() { # usable = home page renders and Better Auth answers
  local url; url=$(base_url)
  curl -fsS -m 5 "$url/" 2>/dev/null | grep -q '<title>' || return 1
  curl -fsS -m 5 "$url/api/auth/ok" 2>/dev/null | grep -q '"ok":true' || return 1
}

cmd_launch() {
  command -v vp >/dev/null || die "vp not on PATH (https://viteplus.dev/guide/)"
  command -v playwright-cli >/dev/null || die "playwright-cli not on PATH"
  [ -d node_modules ] || vp install
  # Idempotent: writes .env if missing, starts Postgres + MinIO, creates DB, migrates, generates, seeds
  vp run worktree:setup
  mkdir -p "$STATE"
  local pid; pid=$(listener_pid || true)
  if [ -n "$pid" ]; then
    if [ -f "$STATE/dev.pgid" ] && [ "$(ps -o pgid= -p "$pid" | tr -d ' ')" = "$(cat "$STATE/dev.pgid")" ]; then
      echo "Reusing the dev server control.sh started (pgid $(cat "$STATE/dev.pgid"))"
    elif [ "$(readlink "/proc/$pid/cwd" 2>/dev/null)" = "$ROOT" ]; then
      echo "Reusing this worktree's dev server already on $(base_url) (pid $pid, not started by us: cleanup leaves it running)"
      rm -f "$STATE/dev.pgid"
    else
      die "port $(port) is held by pid $pid, which is not this worktree's server. Not driving it."
    fi
  else
    setsid vp run dev >"$STATE/dev.log" 2>&1 < /dev/null &
    echo $! >"$STATE/dev.pgid"   # setsid: the pid is the process group id
    echo "Started dev server (pgid $(cat "$STATE/dev.pgid")), log $STATE/dev.log"
  fi
  for _ in $(seq 90); do
    if ready; then
      # First request triggers Vite's dependency optimizer; warm it so the first drive is not a reload
      curl -fsS -m 60 "$(base_url)/artworks" >/dev/null 2>&1 || true
      echo "READY $(base_url)"; return 0
    fi
    if [ -f "$STATE/dev.pgid" ] && ! kill -0 -- "-$(cat "$STATE/dev.pgid")" 2>/dev/null; then
      tail -30 "$STATE/dev.log" >&2; die "dev server exited"
    fi
    sleep 1
  done
  die "not ready after 90s; see $STATE/dev.log"
}

cmd_doctor() {
  local ok=0 url pid
  check() { if eval "$2" >/dev/null 2>&1; then echo "ok   $1"; else echo "FAIL $1"; ok=1; fi; }
  [ -f .env ] || { echo "FAIL .env missing: run control.sh launch"; exit 1; }
  url=$(base_url); pid=$(listener_pid || true)
  echo "worktree  $ROOT"
  echo "commit    $(git rev-parse --short HEAD) on $(git branch --show-current)"
  echo "url       $url"
  echo "database  $(database)"
  if [ -n "$pid" ]; then
    echo "listener  pid $pid, cwd $(readlink "/proc/$pid/cwd" 2>/dev/null || echo '?')"
    if [ -f "$STATE/dev.pgid" ]; then echo "owner     started by control.sh (pgid $(cat "$STATE/dev.pgid"))"; else echo "owner     not started by control.sh (cleanup leaves it)"; fi
  else
    echo "FAIL nothing listens on port $(port): run control.sh launch"; ok=1
  fi
  check "listener belongs to this worktree" "[ -n '$pid' ] && [ \"\$(readlink /proc/$pid/cwd)\" = '$ROOT' ]"
  check "home page renders" "curl -fsS -m 5 '$url/' | grep -q '<title>'"
  check "Better Auth answers /api/auth/ok" "curl -fsS -m 5 '$url/api/auth/ok' | grep -q '\"ok\":true'"
  check "Postgres container healthy" "docker compose ps db --format '{{.Health}}' | grep -q healthy"
  check "MinIO container healthy" "docker compose ps storage --format '{{.Health}}' | grep -q healthy"
  check "seed accounts present (4)" "[ \"\$(echo \"select count(*) from \\\"user\\\" where email like '%@example.com'\" | psql_local -tA)\" -ge 4 ]"
  echo "sessions  $(pw list --json 2>/dev/null | grep -o "\"name\": \"$(prefix)-[^\"]*\"" | cut -d'"' -f4 | tr '\n' ' ')"
  return $ok
}

cmd_evidence() {
  local feature=${1:?usage: control.sh evidence <feature>}
  local dir="$EVIDENCE_ROOT/$(date +%Y%m%d-%H%M%S)-$feature"
  mkdir -p "$dir"
  { echo "feature: $feature"; echo "commit: $(git rev-parse HEAD)"; echo "branch: $(git branch --show-current)";
    echo "url: $(base_url)"; echo "started: $(date -Is)"; } >"$dir/run.txt"
  echo "$dir"
}

cmd_session() { echo "$(prefix)-${1:?usage: control.sh session <name>}"; }

cmd_signin() {
  local account=${1:?usage: control.sh signin <admin|writer|user|banned> [session]}
  case "$account" in admin|writer|user|banned) ;; *) die "unknown account $account" ;; esac
  local s; s=$(cmd_session "${2:-$account}")
  local D="getByRole('dialog', { name: 'Se connecter' })"
  pw -s="$s" open "$(base_url)/" >/dev/null
  # The header shows a skeleton until the session check ends; wait for the real button
  for _ in $(seq 30); do pw -s="$s" --raw find "Se connecter" 2>/dev/null | grep -q 'button "Se connecter"' && break; sleep 1; done
  pw -s="$s" click "getByRole('button', { name: 'Se connecter' })" >/dev/null
  pw -s="$s" fill "$D.getByRole('textbox', { name: 'Email' })" "$account@example.com" >/dev/null
  pw -s="$s" fill "$D.getByRole('textbox', { name: 'Mot de passe' })" "$SEED_PASSWORD" >/dev/null
  pw -s="$s" click "$D.getByRole('button', { name: 'Se connecter' })" >/dev/null
  local who=none
  for _ in $(seq 10); do # the session appears once the sign-in request returns
    sleep 1
    who=$(pw -s="$s" --raw eval "fetch('/api/auth/get-session').then(r => r.json()).then(j => j?.user?.email ?? 'none')" 2>/dev/null | tr -d '"')
    [ "$who" = none ] || break
  done
  echo "session $s signed in as: $who"
  if [ "$account" = banned ]; then
    [ "$who" = none ] || die "banned account got a session"
    echo "banned account refused, as expected"
  else
    [ "$who" = "$account@example.com" ] || die "sign-in failed (snapshot the dialog to see the error)"
  fi
}

cmd_sql() {
  local q=${1:?usage: control.sh sql "<SELECT …>"}
  echo "$q" | READONLY=1 psql_local
}

cmd_cleanup() {
  local p; p=$(prefix)
  for s in $(pw list --json 2>/dev/null | grep -o "\"name\": \"$p-[^\"]*\"" | cut -d'"' -f4); do
    pw -s="$s" close >/dev/null 2>&1 && echo "closed browser session $s"
  done
  if [ -f "$STATE/dev.pgid" ]; then
    local g; g=$(cat "$STATE/dev.pgid")
    if kill -0 -- "-$g" 2>/dev/null; then kill -TERM -- "-$g" 2>/dev/null || true; sleep 1; kill -KILL -- "-$g" 2>/dev/null || true; echo "stopped dev server (pgid $g)"; fi
    [ -f "$STATE/dev.log" ] && mkdir -p "$EVIDENCE_ROOT" && cp "$STATE/dev.log" "$EVIDENCE_ROOT/last-dev.log"
  fi
  if [ -f .env ] && docker compose ps db --format '{{.State}}' 2>/dev/null | grep -q running; then
    psql_local -tA <<'SQL' | sed 's/^/deleted /'
WITH a AS (DELETE FROM artwork WHERE title LIKE '[QA]%' RETURNING 1),
     ar AS (DELETE FROM artist WHERE "firstName" LIKE '[QA]%' OR "lastName" LIKE '[QA]%' RETURNING 1)
SELECT (SELECT count(*) FROM a) || ' [QA] notices, ' || (SELECT count(*) FROM ar) || ' [QA] artists';
DELETE FROM place WHERE name LIKE '[QA]%' AND id NOT IN (SELECT "placeId" FROM artwork WHERE "placeId" IS NOT NULL);
SQL
  fi
  rm -rf "$STATE"
  echo "evidence kept in $EVIDENCE_ROOT"
}

case "${1:-}" in
  launch) cmd_launch ;;
  doctor) cmd_doctor ;;
  evidence) shift; cmd_evidence "$@" ;;
  session) shift; cmd_session "$@" ;;
  signin) shift; cmd_signin "$@" ;;
  sql) shift; cmd_sql "$@" ;;
  cleanup) cmd_cleanup ;;
  *) sed -n '2,13p' "$0"; exit 2 ;;
esac

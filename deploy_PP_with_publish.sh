#!/usr/bin/env bash
# ===========================================================
# deploy_PP_with_publish.sh - beyahad_client (front-end)
# Checks dependencies, builds the React app locally, packages
# the "build" folder, and uploads it to the PP remote server.
#
# Differences vs. the .NET (beyahad_backend) version of this script:
#   • No "dotnet publish" step — replaced by dependency checks +
#     "npm install" (if needed) + "npm run build:preprod".
#   • No publish/config-injection step at all — not applicable to
#     front-end projects.
#   • The ZIP contains the "build" folder as-is EXCEPT
#     configuration.json and web.config, which stay out of the ZIP
#     entirely (per spec — the watcher-side CLIENT flow is the one
#     that owns those 2 files on the server, they are never shipped
#     from here and never injected into the ZIP).
# ===========================================================

set -e
set +u
if (set -o pipefail >/dev/null 2>&1); then set -o pipefail; fi

# ============================================================
# npm scripts that themselves invoke "node ..." (e.g. CRA's
# "build": "node scripts/build.js") can fail with a literal
# '"node"' is not recognized as an internal or external command
# error when npm is run directly from Git Bash/MSYS — MSYS's path
# translation corrupts the quoting cmd.exe uses to spawn the nested
# node process. Running npm through cmd.exe /c sidesteps this by
# keeping the whole call chain in native Windows context.
#
# cmd.exe does NOT get a usable PATH from Git Bash (bash's PATH is
# Unix-style, e.g. "/c/Program Files/nodejs", which cmd.exe cannot
# parse) — so a bare "npm"/"npx" inside the cmd.exe call is not found
# at all. We resolve npm.cmd / npx.cmd's actual Windows path (the
# .cmd shim, not the extension-less POSIX shell script bash itself
# uses) and invoke that directly instead of relying on PATH.
_resolve_win_shim() {
    # $1 = bash command name (npm/npx); finds the sibling ".cmd" shim
    # next to whatever "command -v" resolves in bash, and returns its
    # native Windows path.
    local bin dir shim
    bin=$(command -v "$1" 2>/dev/null) || return 1
    dir=$(dirname "$bin" 2>/dev/null)
    shim="$dir/$1.cmd"
    [[ -f "$shim" ]] || return 1
    cygpath -w "$shim" 2>/dev/null || echo "$shim"
}

# Bash's $PATH is Unix-style (colon-separated, e.g. "/c/Program Files/nodejs")
# — cmd.exe cannot parse that at all. Finding npm.cmd's own full path (above)
# sidesteps this for npm itself, but npm's OWN script runner then looks up
# plain "node" via a normal (Windows-style) PATH search when running a
# script like "node scripts/build.js" — and with a Unix-style PATH inherited
# from bash, that lookup fails ("'node' is not recognized"), even though
# node is right there in the Windows PATH. Converting $PATH to native
# Windows form before invoking cmd.exe fixes this for every such nested
# lookup, not just node.
_win_path() {
    cygpath -w -p "$PATH" 2>/dev/null
}

run_npm() {
    if command -v cmd.exe >/dev/null 2>&1; then
        local npm_win winpath
        npm_win=$(_resolve_win_shim npm)
        winpath=$(_win_path)
        if [[ -n "$npm_win" ]]; then
            if [[ -n "$winpath" ]]; then
                MSYS_NO_PATHCONV=1 PATH="$winpath" cmd.exe /d /c "$npm_win" "$@"
            else
                MSYS_NO_PATHCONV=1 cmd.exe /d /c "$npm_win" "$@"
            fi
        else
            MSYS_NO_PATHCONV=1 cmd.exe /d /c npm "$@"
        fi
    else
        npm "$@"
    fi
}
run_npx() {
    if command -v cmd.exe >/dev/null 2>&1; then
        local npx_win winpath
        npx_win=$(_resolve_win_shim npx)
        winpath=$(_win_path)
        if [[ -n "$npx_win" ]]; then
            if [[ -n "$winpath" ]]; then
                MSYS_NO_PATHCONV=1 PATH="$winpath" cmd.exe /d /c "$npx_win" "$@"
            else
                MSYS_NO_PATHCONV=1 cmd.exe /d /c "$npx_win" "$@"
            fi
        else
            MSYS_NO_PATHCONV=1 cmd.exe /d /c npx "$@"
        fi
    else
        npx "$@"
    fi
}

# ============================================================
# Robust PowerShell detection — same rationale as the backend script:
# works regardless of which shell actually executes this script
# (Git Bash vs. WSL vs. plain PowerShell).
# ============================================================
find_powershell() {
    local candidates=(
        "powershell.exe"
        "/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"
        "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"
    )
    local c
    for c in "${candidates[@]}"; do
        if command -v "$c" >/dev/null 2>&1 || [[ -f "$c" ]]; then
            echo "$c"
            return 0
        fi
    done
    return 1
}

POWERSHELL=$(find_powershell) || {
    echo "❌ ERROR: PowerShell not found"
    echo "   Checked: powershell.exe (PATH), Git-Bash path, WSL path."
    exit 1
}

find_winscp() {
    local candidates=(
        "winscp.com"
        "/c/Program Files (x86)/WinSCP/WinSCP.com"
        "/c/Program Files/WinSCP/WinSCP.com"
        "/mnt/c/Program Files (x86)/WinSCP/WinSCP.com"
        "/mnt/c/Program Files/WinSCP/WinSCP.com"
    )
    local c
    for c in "${candidates[@]}"; do
        if command -v "$c" >/dev/null 2>&1 || [[ -f "$c" ]]; then
            echo "$c"; return 0
        fi
    done
    return 1
}

WINSCP=$(find_winscp) || {
    echo "❌ ERROR: WinSCP.com not found. Install WinSCP (winscp.net)."
    exit 1
}

# ============================================================
# Defensive step: shut down WSL if it's running — see beyahad_backend's
# script for the full rationale (WSL's virtual adapter can break SQL
# Browser's UDP-1434 named-instance resolution, which this script
# depends on for "\sql2005"). No-op if WSL isn't installed/running.
# ============================================================
if command -v wsl.exe >/dev/null 2>&1 || command -v wsl >/dev/null 2>&1; then
    (wsl.exe --shutdown >/dev/null 2>&1 || wsl --shutdown >/dev/null 2>&1 || true)
fi

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$ROOT"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PROJECT_NAME=$(basename "$ROOT")
BRANCH=$(git rev-parse --abbrev-ref HEAD)
LOG_FILE="$ROOT/automation_master_log.txt"

log() {
    local msg="$*"
    local timestamp="[ $(date '+%Y-%m-%d %H:%M:%S') ]"
    echo "$timestamp $msg" | tee -a "$LOG_FILE"
}

mkdir -p "$(dirname "$LOG_FILE")"
if [ ! -f "$LOG_FILE" ]; then
    echo "===================================================" > "$LOG_FILE"
    echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Log initialized" >> "$LOG_FILE"
    echo "===================================================" >> "$LOG_FILE"
fi

# ============================================================
# Load secrets from .env — never hardcode credentials in this script.
# Expected keys in $SCRIPT_DIR/.env:
#   DB_SERVER=172.29.92.20\sql2005
#   DB_NAME=NofTest
#   DB_USER=sqladmin
#   DB_PASSWORD=********
#   SFTP_HOST=sftp.dts.co.il
#   SFTP_PORT=22
#   SFTP_USER=bitbucketpp
#   SFTP_PASSWORD=********
# ============================================================
ENV_FILE="$SCRIPT_DIR/.env"
if [[ ! -f "$ENV_FILE" ]]; then
    echo "❌ ERROR: .env file not found at $ENV_FILE"
    echo "   Create it with DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD (see .env.example)"
    exit 1
fi
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${DB_SERVER:?Missing DB_SERVER in .env}"
: "${DB_NAME:?Missing DB_NAME in .env}"
: "${DB_USER:?Missing DB_USER in .env}"
: "${DB_PASSWORD:?Missing DB_PASSWORD in .env}"
: "${SFTP_HOST:?Missing SFTP_HOST in .env}"
: "${SFTP_PORT:?Missing SFTP_PORT in .env}"
: "${SFTP_USER:?Missing SFTP_USER in .env}"
: "${SFTP_PASSWORD:?Missing SFTP_PASSWORD in .env}"
SFTP_UPLOAD_DIR="${SFTP_UPLOAD_DIR:-/pp}"
SFTP_CONFIRM_DIR="${SFTP_CONFIRM_DIR:-/pp}"

# Defensive check: repair a DB_SERVER whose backslash got silently dropped
# by `source` when the value was left unquoted in .env (see beyahad_backend
# script for the full explanation of this shape).
if [[ "$DB_SERVER" =~ ^([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})([A-Za-z].*)$ ]]; then
    log "⚠️  DB_SERVER appears to be missing its backslash (unquoted value in .env?) — repairing automatically"
    DB_SERVER="${BASH_REMATCH[1]}\\${BASH_REMATCH[2]}"
    log "   → Using repaired DB_SERVER: $DB_SERVER"
fi

log "🔍 Project: $PROJECT_NAME"
log "🔍 Branch: $BRANCH"
log "   ✓ DB credentials loaded from .env (server: ${DB_SERVER}, db: ${DB_NAME}, user: ${DB_USER})"
log ""

# ============================================================
# STEP 1: Check and install PowerShell/SQL prerequisites (unrelated to
# the front-end project itself — needed for the DB config lookup and
# the watcher-confirmation wait below).
# ============================================================
log "==================================================="
log "🔧 CHECKING PIPELINE PREREQUISITES (PowerShell / SQL)"
log "==================================================="

PREREQ_RESULT=$("$POWERSHELL" -NoProfile -Command '
$ErrorActionPreference = "Stop"
try {
    $nuget = Get-PackageProvider -Name NuGet -ErrorAction SilentlyContinue -ListAvailable |
             Where-Object { $_.Version -ge "2.8.5.201" }
    if ($null -eq $nuget) {
        Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force -Scope CurrentUser | Out-Null
    }
    $gallery = Get-PSRepository -Name PSGallery -ErrorAction SilentlyContinue
    if ($null -eq $gallery) {
        Register-PSRepository -Default -ErrorAction SilentlyContinue | Out-Null
        $gallery = Get-PSRepository -Name PSGallery -ErrorAction SilentlyContinue
    }
    if ($gallery.InstallationPolicy -ne "Trusted") {
        Set-PSRepository -Name PSGallery -InstallationPolicy Trusted
    }
    $module = Get-Module -ListAvailable -Name SqlServer | Select-Object -First 1
    if ($null -eq $module) {
        Install-Module -Name SqlServer -Scope CurrentUser -Force -AllowClobber -SkipPublisherCheck -ErrorAction Stop | Out-Null
    }
    Import-Module SqlServer -ErrorAction Stop | Out-Null
    if (Get-Command Invoke-Sqlcmd -ErrorAction SilentlyContinue) {
        Write-Output "SUCCESS"
    } else {
        throw "Invoke-Sqlcmd command not available after module import"
    }
} catch {
    Write-Output "ERROR: $($_.Exception.Message)"
    exit 1
}
' 2>&1)

if [[ "$PREREQ_RESULT" != *SUCCESS* ]]; then
    log "❌ ERROR: Failed to set up PowerShell/SQL prerequisites"
    log "   $PREREQ_RESULT"
    exit 1
fi
log "   ✓ PowerShell/SqlServer module ready"

ROBOCOPY_CHECK=$("$POWERSHELL" -NoProfile -Command "
    if (Get-Command robocopy -ErrorAction SilentlyContinue) { Write-Output 'FOUND' } else { Write-Output 'NOT_FOUND' }
" 2>&1)
if [[ "$ROBOCOPY_CHECK" != *"FOUND"* ]]; then
    log "❌ ERROR: Robocopy not found (should be available on all Windows systems)"
    exit 1
fi
log "   ✓ Robocopy ready"
log ""

# ============================================================
# Network preflight check to the SQL Server host (same rationale as
# the backend script — fail fast with an actionable message instead
# of a raw ADO.NET error).
# ============================================================
DB_HOST_ONLY="${DB_SERVER%%\\*}"
log "🌐 Checking network connectivity to $DB_HOST_ONLY:1433..."
NET_CHECK=$("$POWERSHELL" -NoProfile -Command "
    try {
        \$result = Test-NetConnection -ComputerName '$DB_HOST_ONLY' -Port 1433 -WarningAction SilentlyContinue
        if (\$result.TcpTestSucceeded) { Write-Output 'REACHABLE' } else { Write-Output 'UNREACHABLE' }
    } catch { Write-Output 'UNREACHABLE' }
" 2>&1 | tr -d '\r\n')

if [[ "$NET_CHECK" != "REACHABLE" ]]; then
    log "❌ ERROR: Cannot reach $DB_HOST_ONLY on port 1433"
    log "   Connect to VPN / verify network access, then re-run this script."
    exit 1
fi
log "   ✓ Network reachable"
log ""

# ============================================================
# BUILD_DIR / ZIP_PATH are computed locally — NOT read from the DB.
# Rationale: a developer's checkout isn't always on drive C:, so the
# only machine-independent way to know where "build" and the ZIP live
# is relative to $ROOT (the project's own git root), after
# `npm run build:preprod` has actually run. No ProjectDepJoyConfig row
# is needed for this project.
#
# The remote ZIP filename must still match ProjectRules.ZipName (e.g.
# "beyahad_client_PP_publish.zip") so the watcher recognizes it — that
# name follows the same "<Project>_<Branch>_publish.zip" convention
# used everywhere else in ProjectRules, so it's derived directly from
# $PROJECT_NAME/$BRANCH rather than queried.
# ============================================================
PROJECT="$PROJECT_NAME"
ZIP_STAGING_DIR="$ROOT/.deploy_output"
mkdir -p "$ZIP_STAGING_DIR"
RAW_ZIP="$ZIP_STAGING_DIR/${PROJECT}_${BRANCH}_publish.zip"
ZIP_PATH="$RAW_ZIP"

log "==================================================="
log "🚀 DEPLOYMENT STARTED"
log "==================================================="
log ""

# ==================================================
# STEP 2: DEPENDENCY CHECK
# ==================================================
log "==================================================="
log "🔎 [STEP 1/5] CHECKING PROJECT DEPENDENCIES"
log "==================================================="

DEP_PROBLEMS=0

if ! command -v node >/dev/null 2>&1; then
    log "❌ node.js is not installed or not on PATH"
    DEP_PROBLEMS=1
else
    log "   ✓ node: $(node --version)"
fi

if ! command -v npm >/dev/null 2>&1; then
    log "❌ npm is not installed or not on PATH"
    DEP_PROBLEMS=1
else
    log "   ✓ npm: $(npm --version)"
fi

if [[ ! -f "$ROOT/package.json" ]]; then
    log "❌ package.json not found at $ROOT"
    DEP_PROBLEMS=1
fi

if [[ "$DEP_PROBLEMS" -ne 0 ]]; then
    log "❌ Aborting — fix the missing prerequisites above and re-run."
    exit 1
fi

# ── Resolve "file:" (local sibling) dependencies declared in package.json,
# e.g. "nofshonit-base-web-client": "file:../nofshonit-base-web-client".
# These cannot be fixed by "npm install" alone — the sibling repo has to
# exist (and, if it ships its own build step, be built) on disk first.
log "   Checking local (\"file:\") sibling dependencies..."
FILE_DEPS=$(node -e '
const pkg = require("./package.json");
const deps = Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {});
for (const [name, spec] of Object.entries(deps)) {
    if (typeof spec === "string" && spec.startsWith("file:")) {
        console.log(name + "\t" + spec.slice("file:".length));
    }
}
' 2>&1) || {
    log "❌ Failed to parse package.json with node: $FILE_DEPS"
    exit 1
}

if [[ -n "$FILE_DEPS" ]]; then
    while IFS=$'\t' read -r dep_name dep_rel; do
        [[ -z "$dep_name" ]] && continue
        dep_path="$ROOT/$dep_rel"
        dep_path="$(cd "$ROOT" 2>/dev/null && cd "$dep_rel" 2>/dev/null && pwd || echo "$dep_path")"
        if [[ ! -d "$dep_path" ]]; then
            log "❌ Missing local dependency '$dep_name' — expected at: $dep_path"
            log "   This is a sibling repo, not an npm-installable package. Clone/copy it there first."
            DEP_PROBLEMS=1
            continue
        fi
        log "   ✓ Found local dependency '$dep_name' at $dep_path"

        # If that sibling package has its own node_modules/build step, verify
        # its "main" entry point actually exists — matching the earlier issue
        # where nofshonit-base-web-client's builds/0.0.1/index.js was missing.
        if [[ -f "$dep_path/package.json" ]]; then
            dep_main=$(node -e "try{console.log(require('$dep_path/package.json').main||'')}catch(e){console.log('')}" 2>/dev/null)
            if [[ -n "$dep_main" && ! -f "$dep_path/$dep_main" ]]; then
                log "⚠️  '$dep_name' is present but its main entry point is missing: $dep_path/$dep_main"
                log "   → Will attempt: npm install + npm run build inside $dep_path (if it has a build script)"
                (
                    cd "$dep_path"
                    run_npm install
                    if node -e "process.exit(require('./package.json').scripts && require('./package.json').scripts.build ? 0 : 1)" 2>/dev/null; then
                        run_npm run build
                    fi
                )
                if [[ ! -f "$dep_path/$dep_main" ]]; then
                    log "❌ '$dep_name' still missing its main entry point after install/build: $dep_path/$dep_main"
                    DEP_PROBLEMS=1
                else
                    log "   ✓ '$dep_name' built successfully"
                fi
            fi
        fi
    done <<< "$FILE_DEPS"
fi

if [[ "$DEP_PROBLEMS" -ne 0 ]]; then
    log "❌ Aborting — one or more local dependencies are missing/broken (see above)."
    exit 1
fi

# ── node_modules for the project itself ──
if [[ ! -d "$ROOT/node_modules" ]]; then
    log "   ⚙  node_modules not found — running npm install..."
    run_npm install
    log "   ✓ npm install completed"
else
    log "   ✓ node_modules present"
fi

# ── cross-env must be resolvable, since build:preprod depends on it ──
if [[ ! -f "$ROOT/node_modules/.bin/cross-env" && ! -f "$ROOT/node_modules/.bin/cross-env.cmd" ]]; then
    log "   ⚙  cross-env not found in node_modules/.bin — running npm install..."
    run_npm install
fi
if [[ ! -f "$ROOT/node_modules/.bin/cross-env" && ! -f "$ROOT/node_modules/.bin/cross-env.cmd" ]]; then
    log "❌ cross-env still not resolvable after npm install — check package.json devDependencies"
    exit 1
fi
log "   ✓ cross-env resolvable"
log ""

# ==================================================
# STEP 3: BUILD
# ==================================================
log "==================================================="
log "🏗️  [STEP 2/5] BUILDING (npm run build:preprod)"
log "==================================================="

# "build:preprod" is defined as: cross-env REACT_APP_ENV=<url> npm run build
# — cross-env setting an env var, then npm calling npm again for the actual
# "build" script. That inner "npm run build", spawned FROM WITHIN an already
# running npm process, is what triggers the '"node"' is not recognized
# Windows bug (npm-calling-npm loses/mis-quotes its own node path in that
# scenario) — this happens regardless of how the outer npm was invoked, so
# wrapping it in cmd.exe alone doesn't fix it. Instead: parse out cross-env's
# assignment(s) and the real target script ourselves, export the variable(s)
# directly, and call the target script with a single npm layer.
BUILD_SCRIPT_PARSE=$(node -e '
const pkg = require("./package.json");
const script = (pkg.scripts && pkg.scripts["build:preprod"]) || "";
const m = script.match(/^cross-env\s+((?:\S+=\S+\s+)+)npm run (\S+)\s*$/);
if (m) {
    console.log("MATCH");
    for (const a of m[1].trim().split(/\s+/)) console.log("ASSIGN\t" + a);
    console.log("TARGET\t" + m[2]);
} else {
    console.log("NOMATCH");
}
' 2>&1)

if [[ "$BUILD_SCRIPT_PARSE" == MATCH* ]]; then
    BUILD_TARGET="build"
    while IFS=$'\t' read -r kind value; do
        case "$kind" in
            ASSIGN)
                export "${value?}"
                log "   Set $value (from cross-env, applied directly — no nested npm call)"
                ;;
            TARGET)
                BUILD_TARGET="$value"
                ;;
        esac
    done <<< "$(echo "$BUILD_SCRIPT_PARSE" | tail -n +2)"
    log "   Running: npm run $BUILD_TARGET (single npm layer)"
    run_npm run "$BUILD_TARGET"
else
    log "   ⚠️  Could not parse build:preprod as \"cross-env VAR=val npm run <target>\" — falling back to running it as-is"
    run_npm run build:preprod
fi

if [[ $? -ne 0 ]]; then
    log "❌ Build failed"
    exit 1
fi
log "   ✓ Build completed"
log ""

# ==================================================
# STEP 3B: DEVSEC — VULNERABILITY SCAN (npm audit + retire.js)
# ==================================================
# Informational only — findings are logged and included in the email but
# never block the deploy (same policy as the .NET pipeline's DevSec step).
#
# npm audit reads package.json/package-lock.json directly against npm's
# advisory database — fast, and doesn't care whether node_modules or
# build/ exist at all.
#
# retire.js is different: it fingerprints the ACTUAL files on disk rather
# than the manifest, so it needs real files to look at — it cannot work
# from package.json alone. Scanning node_modules/ (not build/) is
# deliberate: CRA's production build bundles + minifies everything into
# one/few JS files, which strips the per-library markers (file names,
# version comments) retire.js looks for — scanning the bundle would
# silently miss most matches. node_modules is already on disk from the
# npm install/build above, so this costs nothing extra to set up, just
# scan time.
log "==================================================="
log "🔒 DEVSEC VULNERABILITY SCAN"
log "==================================================="

log "   📦 Scanning npm dependencies (npm audit)..."
NPM_AUDIT_OUTPUT=$(run_npm audit 2>&1) || true
NPM_AUDIT_VULN_COUNT=0
if echo "$NPM_AUDIT_OUTPUT" | grep -qiE "found [1-9][0-9]* vulnerabilit"; then
    NPM_AUDIT_VULN_COUNT=$(echo "$NPM_AUDIT_OUTPUT" | grep -oiE "found [0-9]+ vulnerabilit[a-z]*" | grep -oE '[0-9]+' | head -1)
    log "   ⚠️  npm audit found $NPM_AUDIT_VULN_COUNT vulnerabilit(y/ies):"
    while IFS= read -r scanline; do
        log "      | $scanline"
    done <<< "$NPM_AUDIT_OUTPUT"
else
    log "   ✓ npm audit: no known vulnerabilities found"
fi

log "   🌐 Scanning installed packages (retire.js) in: $ROOT/node_modules"
RETIRE_OUTPUT=""
if command -v npx &> /dev/null; then
    RETIRE_SCAN=$(run_npx --yes retire --path "$ROOT/node_modules" --outputformat text --severity low 2>&1) || true
    if [[ -n "$RETIRE_SCAN" ]] && echo "$RETIRE_SCAN" | grep -qi "vulnerabilit"; then
        log "   ⚠️  Vulnerable libraries found (retire.js):"
        while IFS= read -r scanline; do
            log "      | $scanline"
        done <<< "$RETIRE_SCAN"
        RETIRE_OUTPUT="$RETIRE_SCAN"
    else
        log "   ✓ retire.js: no known-vulnerable libraries found"
    fi
else
    log "   ⚠️  npx/Node.js not found — skipping retire.js scan"
fi

# --- Combined summary for the single "DevSec Scan" email row ---
if [[ "$NPM_AUDIT_VULN_COUNT" -gt 0 ]] && [[ -n "$RETIRE_OUTPUT" ]]; then
    DEVSEC_SUMMARY="⚠️ npm audit: $NPM_AUDIT_VULN_COUNT vulnerabilit(y/ies) + retire.js findings — see log"
    DEVSEC_HAS_ISSUES=true
elif [[ "$NPM_AUDIT_VULN_COUNT" -gt 0 ]]; then
    DEVSEC_SUMMARY="⚠️ npm audit found $NPM_AUDIT_VULN_COUNT vulnerabilit(y/ies) — see log"
    DEVSEC_HAS_ISSUES=true
elif [[ -n "$RETIRE_OUTPUT" ]]; then
    DEVSEC_SUMMARY="⚠️ Vulnerable JS library(ies) found (retire.js) — see log"
    DEVSEC_HAS_ISSUES=true
else
    DEVSEC_SUMMARY="✅ No known vulnerabilities found"
    DEVSEC_HAS_ISSUES=false
fi

log "==================================================="
log "✓ DevSec scan complete"
log "==================================================="
log ""

# ==================================================
# STEP 4: PUBLISH — not applicable to front-end projects
# ==================================================
log "==================================================="
log "⏭  [STEP 3/5] PUBLISH — skipped (not applicable to front-end projects)"
log "==================================================="
log ""

# ==================================================
# STEP 5: CREATING DEPLOYMENT PACKAGE
# ==================================================
log "==================================================="
log "📦 [STEP 4/5] CREATING DEPLOYMENT PACKAGE"
log "==================================================="

BUILD_DIR="$ROOT/build"
if [[ ! -d "$BUILD_DIR" ]]; then
    log "⚠️  Build output folder not found — creating it at project ROOT: $BUILD_DIR"
    mkdir -p "$BUILD_DIR"
fi

BUILD_FILE_COUNT=$(find "$BUILD_DIR" -type f 2>/dev/null | wc -l | tr -d ' ')
if [[ "$BUILD_FILE_COUNT" -eq 0 ]]; then
    log "⚠️  WARNING: $BUILD_DIR is EMPTY — npm run build:preprod did not produce any output."
    log "⚠️  Continuing anyway (as requested), but the resulting ZIP will be empty and the site will break on deploy."
fi

TEMP="$ROOT/.deploy_temp"
rm -rf "$TEMP"
mkdir -p "$TEMP"

log "   Copying build/ to temp directory (excluding configuration.json, web.config)..."
"$POWERSHELL" -NoProfile -Command "
    \$robocopyArgs = @(
        '$BUILD_DIR',
        '$TEMP',
        '/MIR', '/R:0', '/W:0',
        '/XF', 'configuration.json', 'web.config',
        '/NFL', '/NDL', '/NJH', '/NJS'
    )
    \$null = & robocopy @robocopyArgs
    if (\$LASTEXITCODE -lt 8) { Write-Output 'OK' }
" 2>&1

log "   ✓ Files staged (configuration.json / web.config excluded from the ZIP)"

log "   Creating ZIP archive..."
"$POWERSHELL" -NoProfile -Command "
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    if (Test-Path '$RAW_ZIP') { Remove-Item '$RAW_ZIP' -Force }
    [System.IO.Compression.ZipFile]::CreateFromDirectory('$TEMP', '$RAW_ZIP', 'Optimal', \$false)
" 2>&1

if [ ! -f "$RAW_ZIP" ]; then
    log "❌ ZIP creation failed"
    exit 1
fi
log "   ✓ ZIP created: $(basename "$RAW_ZIP")"
log ""

# ==================================================
# STEP 6: UPLOADING TO SFTP VAULT
# ==================================================
log "==================================================="
log "📤 [STEP 5/5] UPLOADING TO SFTP VAULT ($SFTP_HOST:$SFTP_PORT$SFTP_UPLOAD_DIR)"
log "==================================================="

SFTP_ZIP_NAME="${PROJECT}_${BRANCH}_publish.zip"
WINSCP_LOG="$ROOT/.winscp_upload.log"
rm -f "$WINSCP_LOG"

UPLOAD_SCRIPT=$(mktemp)
cat > "$UPLOAD_SCRIPT" <<EOF
option batch abort
option confirm off
option transfer binary
open sftp://${SFTP_USER}:${SFTP_PASSWORD}@${SFTP_HOST}:${SFTP_PORT}/ -hostkey=*
lcd $(cygpath -m "$(dirname "$ZIP_PATH")" 2>/dev/null || dirname "$ZIP_PATH")
put $(basename "$ZIP_PATH") ${SFTP_UPLOAD_DIR}/${SFTP_ZIP_NAME}
exit
EOF

MSYS_NO_PATHCONV=1 timeout 120 "$WINSCP" /log="$(cygpath -w "$WINSCP_LOG" 2>/dev/null || echo "$WINSCP_LOG")" /ini=nul \
    /script="$(cygpath -w "$UPLOAD_SCRIPT" 2>/dev/null | sed 's/^\\//')" 2>&1
UPLOAD_EXIT=$?
rm -f "$UPLOAD_SCRIPT"

if [[ $UPLOAD_EXIT -eq 124 ]]; then
    log "❌ SFTP upload timed out after 120s"
    exit 1
fi
if [[ $UPLOAD_EXIT -ne 0 ]]; then
    log "❌ SFTP upload failed (exit $UPLOAD_EXIT)"
    [[ -f "$WINSCP_LOG" ]] && tail -20 "$WINSCP_LOG" | while IFS= read -r l; do log "   $l"; done
    exit 1
fi
log "   ✓ Uploaded to ${SFTP_UPLOAD_DIR}/${SFTP_ZIP_NAME}"
log ""

# ==================================================
# STEP 7: WAITING FOR WATCHER CONFIRMATION
# ==================================================
log "==================================================="
log "⏳ WAITING FOR WATCHER CONFIRMATION"
log "==================================================="

LOCAL_CONFIRM_DIR="$ROOT/.deploy_confirmations"
mkdir -p "$LOCAL_CONFIRM_DIR"
LOCAL_CONFIRM_WIN=$(cygpath -w "$LOCAL_CONFIRM_DIR" 2>/dev/null | sed 's/^\\//')

connStr="Server=${DB_SERVER};Database=${DB_NAME};User ID=${DB_USER};Password=${DB_PASSWORD};TrustServerCertificate=True;"
SERVER_COUNT=$("$POWERSHELL" -NoProfile -Command "
    try {
        Import-Module SqlServer -ErrorAction Stop | Out-Null
        \$r = Invoke-Sqlcmd -ConnectionString '$connStr' -Query \"SELECT COUNT(*) AS cnt FROM ProjectRules WHERE ProjectName='${PROJECT_NAME}' AND Branch='${BRANCH}' AND ServerName IS NOT NULL AND ServerName != ''\"
        Write-Output \$r.cnt
    } catch { Write-Output 1 }
" 2>/dev/null | tr -d '\r\n') || SERVER_COUNT=1
[[ "$SERVER_COUNT" =~ ^[0-9]+$ ]] || SERVER_COUNT=1
[[ "$SERVER_COUNT" -eq 0 ]] && SERVER_COUNT=1

log "   Expecting responses from $SERVER_COUNT server(s)..."

WATCHER_CONFIRMED=false
WATCHER_RESULT_FILES=()
declare -A SEEN_DEPLOY_FILES
CHECK_INTERVAL=4
MAX_WAIT=600

set +e
for ((i=1; i<=MAX_WAIT/CHECK_INTERVAL; i++)); do
    ELAPSED=$((i * CHECK_INTERVAL))

    TMP_LIST=$(mktemp)
    TMP_SCRIPT=$(mktemp)
    cat > "$TMP_SCRIPT" <<EOF
option batch continue
option confirm off
open sftp://${SFTP_USER}:${SFTP_PASSWORD}@${SFTP_HOST}:${SFTP_PORT}/ -hostkey=*
cd ${SFTP_CONFIRM_DIR}
ls
exit
EOF
    MSYS_NO_PATHCONV=1 "$WINSCP" /log=NUL /ini=nul /script="$(cygpath -w "$TMP_SCRIPT" 2>/dev/null | sed 's/^\\//')" > "$TMP_LIST" 2>&1 || true
    rm -f "$TMP_SCRIPT"

    while IFS= read -r line; do
        FNAME=$(echo "$line" | grep -oE "${PROJECT_NAME}_${BRANCH}_Deploy_Success_[^ ]+" | head -1) || true
        [[ -z "$FNAME" ]] && continue
        [[ -n "${SEEN_DEPLOY_FILES[$FNAME]:-}" ]] && continue

        TMP_GET=$(mktemp)
        cat > "$TMP_GET" <<EOF
option batch continue
option confirm off
open sftp://${SFTP_USER}:${SFTP_PASSWORD}@${SFTP_HOST}:${SFTP_PORT}/ -hostkey=*
cd ${SFTP_CONFIRM_DIR}
lcd ${LOCAL_CONFIRM_WIN}
get "${FNAME}"
rm "${FNAME}"
exit
EOF
        MSYS_NO_PATHCONV=1 "$WINSCP" /log=NUL /ini=nul /script="$(cygpath -w "$TMP_GET" 2>/dev/null | sed 's/^\\//')" >/dev/null 2>&1 || true
        rm -f "$TMP_GET"

        LOCAL_TXT="$LOCAL_CONFIRM_DIR/$FNAME"
        if [[ -f "$LOCAL_TXT" ]]; then
            SEEN_DEPLOY_FILES[$FNAME]=1
            WATCHER_RESULT_FILES+=("$LOCAL_TXT")
            R_SERVER=$(grep -E 'WatcherNode=' "$LOCAL_TXT" | head -1 | cut -d'=' -f2- | tr -d '\r') || R_SERVER="?"
            R_STATUS=$(grep -E 'Status=' "$LOCAL_TXT" | head -1 | cut -d'=' -f2- | tr -d '\r') || R_STATUS="?"
            log ""
            log "   📥 Response from server: $R_SERVER → Status: $R_STATUS"
            cat "$LOCAL_TXT" | while IFS= read -r rline; do log "      | $rline"; done
        fi
    done < "$TMP_LIST"
    rm -f "$TMP_LIST"

    RECEIVED=${#WATCHER_RESULT_FILES[@]}
    if [[ $RECEIVED -ge $SERVER_COUNT ]]; then
        WATCHER_CONFIRMED=true
        break
    fi

    [[ $ELAPSED -eq 30  ]] && log "   ... waiting (${RECEIVED}/${SERVER_COUNT} responded, 30s)"
    [[ $ELAPSED -eq 60  ]] && log "   ... waiting (${RECEIVED}/${SERVER_COUNT} responded, 60s)"
    [[ $ELAPSED -eq 120 ]] && log "   ... waiting (${RECEIVED}/${SERVER_COUNT} responded, 120s)"
    [[ $ELAPSED -eq 300 ]] && log "   ... waiting (${RECEIVED}/${SERVER_COUNT} responded, 300s)"

    sleep $CHECK_INTERVAL
done
set -e

RECEIVED=${#WATCHER_RESULT_FILES[@]}

log ""
log "==================================================="
if [[ "$WATCHER_CONFIRMED" == true ]]; then
    log "🎉 DEPLOYMENT COMPLETE — $RECEIVED/$SERVER_COUNT servers responded"
else
    log "⚠️  UPLOADED ($RECEIVED/$SERVER_COUNT servers responded within ${MAX_WAIT}s)"
fi
log "==================================================="

DEPLOY_PATH="$BUILD_DIR"
BACKUP_PATH=""
SMOKE_STATUS=""
SMOKE_DETAIL=""
if [[ ${#WATCHER_RESULT_FILES[@]} -gt 0 ]]; then
    FIRST="${WATCHER_RESULT_FILES[0]}"
    DEPLOY_PATH=$(grep -E 'DeployPath=' "$FIRST" | head -1 | cut -d'=' -f2- | tr -d '\r') || DEPLOY_PATH="$BUILD_DIR"
    BACKUP_PATH=$(grep -E '(BackupPath|BackupRemoved)=' "$FIRST" | head -1 | cut -d'=' -f2- | tr -d '\r') || BACKUP_PATH=""
    SMOKE_STATUS=$(grep -E 'SmokeTestStatus=' "$FIRST" | head -1 | cut -d'=' -f2- | tr -d '\r') || SMOKE_STATUS=""
    SMOKE_DETAIL=$(grep -E 'SmokeTestDetail=' "$FIRST" | head -1 | cut -d'=' -f2- | tr -d '\r') || SMOKE_DETAIL=""
    [[ -z "$DEPLOY_PATH" ]] && DEPLOY_PATH="$BUILD_DIR"
fi

SITE_STATUS="⏭ Not tested — deployment not confirmed by watcher"
if [[ "$WATCHER_CONFIRMED" == true ]]; then
    case "$SMOKE_STATUS" in
        Passed)  SITE_STATUS="✅ Site is up — smoke tests passed" ;;
        Failed)  SITE_STATUS="❌ Deployment completed but smoke tests FAILED — ${SMOKE_DETAIL:-see watcher log}" ;;
        Error)   SITE_STATUS="⚠ Smoke test execution error — ${SMOKE_DETAIL:-see watcher log}" ;;
        Skipped) SITE_STATUS="⏭ Not tested — ${SMOKE_DETAIL:-no automated smoke/QA suite configured for this project yet}" ;;
        *)       SITE_STATUS="⏭ Not tested — smoke test status not found in watcher result (older watcher version?)" ;;
    esac
    log "   $SITE_STATUS"
else
    log "   ⏭  Skipped — watcher did not confirm the deployment"
fi

# ==================================================
# STEP 8: SEND EMAIL
# ==================================================
GIT_EMAIL=$(git config user.email 2>/dev/null || echo "")
if [[ -z "$GIT_EMAIL" ]]; then
    WIN_USER=$("$POWERSHELL" -NoProfile -Command "Write-Output \$env:USERNAME" 2>/dev/null | tr -d '\r\n') || WIN_USER=""
    GIT_EMAIL="${WIN_USER}@swish.co.il"
fi
TRIGGERED_BY=$("$POWERSHELL" -NoProfile -Command "Write-Output \$env:USERNAME" 2>/dev/null | tr -d '\r\n') || TRIGGERED_BY="unknown"
DEPLOY_TIME=$(date '+%d.%m.%Y %H:%M')
[[ -z "$TRIGGERED_BY" ]] && TRIGGERED_BY="unknown"

SITE_VERIFY_FAILED=false
[[ "$SITE_STATUS" == "❌"* ]] && SITE_VERIFY_FAILED=true

if [[ "$WATCHER_CONFIRMED" == true ]] && [[ "$SITE_VERIFY_FAILED" == false ]]; then
    SUBJECT="✅ DEPLOY PROCESS COMPLETED — $PROJECT ($BRANCH)"
    BADGE_TEXT="♻️ DEPLOY STATUS:SUCCESS"
    HEADER_COLOR="#2e7d32"; BORDER_COLOR="#4caf50"; BG_COLOR="#f1f8e9"
    FOOTER_TEXT="✓ Deployment verified by watchdog service"
elif [[ "$WATCHER_CONFIRMED" == true ]] && [[ "$SITE_VERIFY_FAILED" == true ]]; then
    SUBJECT="[WARNING] Deployed but site DOWN — $PROJECT ($BRANCH)"
    BADGE_TEXT="⚠ DEPLOYED — SITE VERIFICATION FAILED"
    HEADER_COLOR="#c62828"; BORDER_COLOR="#e57373"; BG_COLOR="#fdecea"
    FOOTER_TEXT="⚠ File deploy confirmed by watchdog, but the site did not pass smoke tests — please check manually"
else
    SUBJECT="[WARNING] Deployment Uploaded — $PROJECT ($BRANCH)"
    BADGE_TEXT="⚠ NO WATCHER RESPONSE"
    HEADER_COLOR="#e65100"; BORDER_COLOR="#ff9800"; BG_COLOR="#fff8e1"
    FOOTER_TEXT="⚠ Watcher did not confirm — please verify manually"
fi

HTML_FILE="$ROOT/.deploy_email.html"
_row() { echo "<tr style='border-bottom:1px solid #e0e0e0;'><td style='padding:10px 16px;color:#555;font-size:13px;width:160px;'>$1</td><td style='padding:10px 16px;font-weight:600;font-size:13px;color:#111;'>$2</td></tr>"; }
_monorow() { echo "<tr style='border-bottom:1px solid #e0e0e0;'><td style='padding:10px 16px;color:#555;font-size:13px;width:160px;'>$1</td><td style='padding:10px 16px;font-weight:600;font-size:12px;color:#111;font-family:monospace;'>$2</td></tr>"; }

BACKUP_ROW=""
[[ -n "$BACKUP_PATH" ]] && BACKUP_ROW=$(_monorow "Backup" "$BACKUP_PATH")

cat > "$HTML_FILE" << HTMLEOF
<div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;">
  <div style="background:${HEADER_COLOR};padding:4px 18px;border-radius:6px 6px 0 0;"></div>
  <div style="background:${BG_COLOR};border:1.5px solid ${BORDER_COLOR};border-top:none;border-radius:0 0 8px 8px;padding:24px 28px;">
    <h2 style="margin:0 0 18px 0;font-size:18px;color:#1a1a1a;">&#9632;&nbsp; ${SUBJECT}</h2>
    <hr style="border:none;border-top:1.5px solid ${BORDER_COLOR};margin-bottom:20px;">
    <div style="margin-bottom:20px;">
      <span style="display:inline-block;background:${HEADER_COLOR};color:#fff;font-weight:700;font-size:13px;padding:8px 18px;border-radius:5px;">${BADGE_TEXT}</span>
    </div>
    <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;">
      $(_row "Project"      "${PROJECT}")
      $(_row "Branch"       "${BRANCH}")
      $(_row "Upload Time"  "${DEPLOY_TIME}")
      $(_row "Servers"      "${RECEIVED}/${SERVER_COUNT} responded")
      $(_monorow "Deploy Path" "${DEPLOY_PATH}")
      ${BACKUP_ROW}
      $(_row "Triggered By" "${TRIGGERED_BY}")
      $(_row "Site Status"  "${SITE_STATUS}")
      $(_row "DevSec Scan"  "${DEVSEC_SUMMARY}")
    </table>
    <div style="margin-top:20px;padding-top:14px;border-top:1px solid #ddd;font-size:12px;color:#555;">
      <div>${FOOTER_TEXT}</div>
      <div style="margin-top:2px;color:#888;">Detailed log attached for your records.</div>
    </div>
  </div>
</div>
HTMLEOF

RAW_HTML_FILE=$(cygpath -w "$HTML_FILE" 2>/dev/null || echo "$HTML_FILE" | sed -E 's|^/([a-zA-Z])/|\1:/|')

"$POWERSHELL" -NoProfile -Command "
    try {
        \$html = Get-Content '$RAW_HTML_FILE' -Raw -Encoding UTF8
        \$outlook = New-Object -ComObject Outlook.Application
        \$mail = \$outlook.CreateItem(0)
        \$mail.To      = '$GIT_EMAIL'
        \$mail.Subject = '$SUBJECT'
        \$mail.HTMLBody = \$html
        if (Test-Path '$LOG_FILE') { \$null = \$mail.Attachments.Add('$LOG_FILE') }
        \$mail.Send()
        Write-Output 'SENT'
    } catch {
        Write-Output \"FAILED: \$(\$_.Exception.Message)\"
    }
" 2>&1

rm -f "$HTML_FILE"

log ""
log "✅ Done!"
log ""
log "==================================================="
log "🏁 PIPELINE FINISHED"
log "==================================================="

exit 0
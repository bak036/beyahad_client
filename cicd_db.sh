#!/usr/bin/env bash
# =====================================================================
# cicd_db.sh — CI/CD telemetry helper (NofTest.dbo.Cicd* tables)
# Sourced by deploy_PP_with_publish.sh and rollback.sh (same folder as .env).
# Requires: $POWERSHELL and DB_SERVER/DB_NAME/DB_USER/DB_PASSWORD exported (.env).
# Contract: NEVER fails or blocks the caller — every function returns 0.
# =====================================================================

CICD_ID=""
CICD_FINALIZED=false
CICD_START_EPOCH=$(date +%s)

# ---------------------------------------------------------------------------
# Environment-agnostic layer — the same file works from Git Bash, from WSL bash
# (what `bash script.sh` launches from a plain PowerShell terminal) and via the git hook.
# ---------------------------------------------------------------------------
# PowerShell executable: reuse the caller's $POWERSHELL, otherwise probe the known locations
if [[ -z "${POWERSHELL:-}" ]]; then
    for _c in powershell.exe \
              "/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe" \
              "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"; do
        if command -v "$_c" >/dev/null 2>&1 || [[ -f "$_c" ]]; then POWERSHELL="$_c"; break; fi
    done
fi

# POSIX path -> Windows path (cygpath on Git Bash, wslpath on WSL, sed heuristic otherwise)
_cicd_winpath() {
    local p="$1" out=""
    if command -v cygpath >/dev/null 2>&1; then
        out=$(cygpath -w "$p" 2>/dev/null) || out=""
    fi
    if [[ -z "$out" ]] && command -v wslpath >/dev/null 2>&1; then
        out=$(wslpath -w "$p" 2>/dev/null) || out=""
    fi
    if [[ -z "$out" ]]; then
        out=$(printf '%s' "$p" | sed 's|^/mnt/\([a-zA-Z]\)/|\1:\\|; s|^/\([a-zA-Z]\)/|\1:\\|; s|/|\\|g')
    fi
    printf '%s' "$out"
}

# Windows account name (WSL/Linux $USER is not the person who pushed)
_cicd_winuser() {
    local u=""
    if [[ -n "${POWERSHELL:-}" ]]; then
        u=$("$POWERSHELL" -NoProfile -Command 'Write-Output $env:USERNAME' 2>/dev/null | tr -d '\r\n') || u=""
    fi
    printf '%s' "${u:-${USERNAME:-${USER:-unknown}}}"
}

_cicd_log() { if declare -F log >/dev/null 2>&1; then log "$*"; else echo "$*"; fi; return 0; }

# Escape single quotes for T-SQL literals
_cicd_q() { local q="'"; printf '%s' "${1//$q/$q$q}"; }

# Run T-SQL; prints first column of first row (if any); "CICD_ERROR: ..." on failure.
# The SQL goes to PowerShell through a temp file and the connection string through the command
# line — NOT through environment variables: when the script runs under WSL (or any shell that
# does not forward env vars to powershell.exe) env vars arrive empty. The temp file lives under
# $ROOT, which is reachable from both Windows and WSL.
_cicd_sql() {
    local f fw cs out q="'"
    f="${ROOT:-.}/.cicd_sql_$$_${RANDOM}.sql"
    printf '%s' "$1" > "$f"
    fw=$(_cicd_winpath "$f")
    cs="Server=${DB_SERVER};Database=${DB_NAME};User ID=${DB_USER};Password=${DB_PASSWORD};TrustServerCertificate=True;"
    cs="${cs//$q/$q$q}"
    fw="${fw//$q/$q$q}"
    out=$("$POWERSHELL" -NoProfile -Command "
        try {
            Import-Module SqlServer -ErrorAction Stop | Out-Null
            \$q = [IO.File]::ReadAllText('$fw', [Text.Encoding]::UTF8)
            \$r = Invoke-Sqlcmd -ConnectionString '$cs' -Query \$q -QueryTimeout 30 -ErrorAction Stop
            if (\$r) { (\$r | Select-Object -First 1).Item(0) }
        } catch { Write-Output ('CICD_ERROR: ' + \$_.Exception.Message) }
    " 2>/dev/null | tr -d '\r') || true
    rm -f "$f"
    printf '%s' "$out" | head -1
    return 0
}

# Same as _cicd_sql but logs errors (to stderr, so $(...) capture stays clean)
_cicd_exec() {
    local out
    out=$(_cicd_sql "$1")
    if [[ "$out" == CICD_ERROR* ]]; then
        _cicd_log "   ⚠️  CI/CD telemetry: ${out#CICD_ERROR: }" >&2
    fi
    printf '%s' "$out"
    return 0
}

# cicd_start ACTION PROJECT ENV [ZIP_NAME]
# Creates the run row + PENDING rows for every expected server. Sets CICD_ID.
cicd_start() {
    local action="$1" project="$2" env_name="${3^^}" zip_name="${4:-}"
    local user sha commit_at unit="NONE" commit_sql="NULL" sha_sql="NULL" zip_sql="NULL" rb_sql="" out

    user=$(git config user.name 2>/dev/null || true)
    [[ -z "$user" ]] && user=$(_cicd_winuser)
    sha=$(git rev-parse HEAD 2>/dev/null || true)
    commit_at=$(git log -1 --format=%cd --date=format:'%Y-%m-%d %H:%M:%S' 2>/dev/null || true)

    [[ "$sha" =~ ^[0-9a-fA-F]{40}$ ]] && sha_sql="'$sha'"
    [[ -n "$commit_at" ]] && commit_sql="'$commit_at'"
    [[ -n "$zip_name" ]] && zip_sql="N'$(_cicd_q "$zip_name")'"

    # Unit tests: only detects that a test project exists (the pipeline does not run them yet)
    if find "${ROOT:-.}" -maxdepth 4 -iname '*Test*.csproj' -not -path '*/node_modules/*' -not -path '*/.git/*' 2>/dev/null | grep -q .; then
        unit="SKIPPED"
    fi

    if [[ "$action" == "ROLLBACK" ]]; then
        rb_sql="SET @rb = (SELECT TOP 1 DeploymentId FROM dbo.CicdDeployments WHERE ProjectName=N'$(_cicd_q "$project")' AND Env='$env_name' AND ActionType='DEPLOY' AND Status IN ('SUCCESS','PARTIAL') AND IsDeleted=0 ORDER BY StartedAt DESC);"
    fi

    out=$(_cicd_exec "SET NOCOUNT ON;
DECLARE @n INT = (SELECT COUNT(DISTINCT ServerName) FROM dbo.ProjectRules WHERE ProjectName=N'$(_cicd_q "$project")' AND Branch='$env_name' AND ServerName IS NOT NULL AND ServerName<>'');
IF @n = 0 SET @n = 1;
DECLARE @rb BIGINT = NULL;
$rb_sql
EXEC dbo.usp_CicdDeployStart @ProjectName=N'$(_cicd_q "$project")', @Env='$env_name', @ActionType='$action', @RollbackOfId=@rb,
     @Branch=N'$(_cicd_q "$env_name")', @CommitSha=$sha_sql, @CommitAt=$commit_sql, @ZipName=$zip_sql,
     @TriggeredBy=N'$(_cicd_q "$user")', @UnitTests='$unit', @ExpectedServers=@n;")

    if [[ "$out" =~ ^[0-9]+$ ]]; then
        CICD_ID="$out"
        _cicd_exec "INSERT dbo.CicdDeploymentServers (DeploymentId, ServerName, Status)
SELECT DISTINCT $CICD_ID, ServerName, 'PENDING' FROM dbo.ProjectRules
WHERE ProjectName=N'$(_cicd_q "$project")' AND Branch='$env_name' AND ServerName IS NOT NULL AND ServerName<>'';" >/dev/null
        _cicd_log "   📊 CI/CD run #$CICD_ID registered ($action / $env_name / by $user)"
    else
        _cicd_log "   ⚠️  CI/CD telemetry disabled for this run (could not register: ${out:-no response})"
    fi
    return 0
}

# cicd_update "Col=value, Col2=value2"   (raw SET clause — callers pass trusted literals only)
cicd_update() {
    [[ -n "$CICD_ID" ]] || return 0
    _cicd_exec "UPDATE dbo.CicdDeployments SET $1 WHERE DeploymentId=$CICD_ID;" >/dev/null
    return 0
}

# cicd_step STEP_NAME STATUS START_EPOCH   (duration measured locally, stored relative to SQL clock)
cicd_step() {
    [[ -n "$CICD_ID" ]] || return 0
    local now el
    now=$(date +%s)
    el=$(( now - ${3:-$now} ))
    if (( el < 0 )); then el=0; fi
    _cicd_exec "SET NOCOUNT ON; DECLARE @s DATETIME2(0)=DATEADD(SECOND,-$el,SYSDATETIME());
EXEC dbo.usp_CicdStep @DeploymentId=$CICD_ID, @StepName='$1', @Status='$2', @StartedAt=@s;" >/dev/null
    return 0
}

# cicd_set_zip ZIP_NAME ZIP_PATH
cicd_set_zip() {
    [[ -n "$CICD_ID" ]] || return 0
    local sha
    sha=$(sha256sum "$2" 2>/dev/null | cut -d' ' -f1) || sha=""
    if [[ ! "$sha" =~ ^[0-9a-fA-F]{64}$ && -n "${POWERSHELL:-}" ]]; then
        sha=$("$POWERSHELL" -NoProfile -Command "(Get-FileHash -Algorithm SHA256 -LiteralPath '$(_cicd_winpath "$2")').Hash" 2>/dev/null | tr -d '\r\n') || sha=""
    fi
    if [[ "$sha" =~ ^[0-9a-fA-F]{64}$ ]]; then
        cicd_update "ZipName=N'$(_cicd_q "$1")', ZipSha256='$sha'"
    else
        cicd_update "ZipName=N'$(_cicd_q "$1")'"
    fi
    return 0
}

# cicd_server_result_from_file FILE SUCCESS|FAILED   (stores the full confirmation text)
cicd_server_result_from_file() {
    [[ -n "$CICD_ID" ]] || return 0
    local f="$1" st="$2" node msg raw base
    [[ -f "$f" ]] || return 0
    base=$(basename "$f" .txt)
    node=$(grep -E '^WatcherNode=' "$f" | head -1 | cut -d'=' -f2- | tr -d '\r') || node=""
    if [[ -z "$node" ]]; then node="${base##*_}"; fi
    msg=$(grep -E '^Error=' "$f" | head -1 | cut -d'=' -f2- | tr -d '\r') || msg=""
    if [[ -z "$msg" && "$st" == "SUCCESS" ]]; then msg="OK"; fi
    raw=$(tr -d '\r' < "$f") || raw=""
    _cicd_exec "SET NOCOUNT ON;
EXEC dbo.usp_CicdServerResult @DeploymentId=$CICD_ID, @ServerName=N'$(_cicd_q "$node")', @Status='$st',
     @Message=N'$(_cicd_q "${msg:0:900}")', @ConfirmRaw=N'$(_cicd_q "$raw")';
UPDATE s SET StartedAt = d.StartedAt FROM dbo.CicdDeploymentServers s
  JOIN dbo.CicdDeployments d ON d.DeploymentId = s.DeploymentId
 WHERE s.DeploymentId=$CICD_ID AND s.StartedAt IS NULL;" >/dev/null
    return 0
}

# cicd_set_smoke_from_file FILE   (SmokeTestStatus=... from the watcher RESULT file)
cicd_set_smoke_from_file() {
    [[ -n "$CICD_ID" ]] || return 0
    local s map="NONE"
    s=$(grep -E '^SmokeTestStatus=' "$1" | head -1 | cut -d'=' -f2- | tr -d '\r') || s=""
    case "$s" in
        Passed)        map="PASS" ;;
        Failed|Error)  map="FAIL" ;;
        *)             map="NONE" ;;
    esac
    cicd_update "SmokeTests='$map'"
    return 0
}

# cicd_finish_auto SUCCESS_COUNT FAILED_COUNT EXPECTED [FAIL_REASON]
cicd_finish_auto() {
    [[ -n "$CICD_ID" ]] || return 0
    local succ="${1:-0}" fail="${2:-0}" exp="${3:-1}" reason="${4:-}" st
    if (( succ >= exp && fail == 0 )); then
        st="SUCCESS"; reason=""
    elif (( succ == 0 && fail == 0 )); then
        st="TIMEDOUT"; reason="No confirmation from any server within the timeout"
    elif (( succ == 0 )); then
        st="FAILED"; [[ -z "$reason" ]] && reason="All responding servers reported failure"
    else
        st="PARTIAL"; [[ -z "$reason" ]] && reason="$succ/$exp servers succeeded, $fail failed"
    fi
    local reason_sql="FailureReason"
    [[ -n "$reason" ]] && reason_sql="N'$(_cicd_q "${reason:0:480}")'"
    _cicd_exec "UPDATE dbo.CicdDeploymentServers SET Status='TIMEOUT' WHERE DeploymentId=$CICD_ID AND Status IN ('PENDING','RUNNING');
UPDATE dbo.CicdDeployments SET Status='$st', FinishedAt=ISNULL(FinishedAt, SYSDATETIME()), FailureReason=$reason_sql
 WHERE DeploymentId=$CICD_ID;" >/dev/null
    CICD_FINALIZED=true
    _cicd_log "   📊 CI/CD run #$CICD_ID closed: $st"
    return 0
}

# EXIT trap: if the script dies before cicd_finish_auto, mark the run FAILED
cicd_on_exit() {
    local rc="${1:-$?}"   # callers with their own trap may pass the exit code explicitly
    [[ -n "$CICD_ID" && "$CICD_FINALIZED" != true ]] || return 0
    CICD_FINALIZED=true
    _cicd_exec "UPDATE dbo.CicdDeployments SET Status='FAILED', FinishedAt=ISNULL(FinishedAt, SYSDATETIME()),
 FailureReason=N'Script aborted before completion (exit code $rc)' WHERE DeploymentId=$CICD_ID AND Status='STARTED';" >/dev/null
    return 0
}

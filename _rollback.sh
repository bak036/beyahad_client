#!/usr/bin/env bash
# ===============================================================
# ♻️ UNIVERSAL AUTO-ROLLBACK SCRIPT — WITH AUTO-SETUP
# ===============================================================

set -e
if (set -o pipefail >/dev/null 2>&1); then set -o pipefail; fi

# Ensure Git Bash utilities (cygpath, etc.) are in PATH
export PATH="/usr/bin:/usr/local/bin:$PATH"

# cygpath fallback if still not found
if ! command -v cygpath >/dev/null 2>&1; then
    cygpath() {
        local flag="" path=""
        while [[ $# -gt 0 ]]; do
            case "$1" in
                -w) flag="w"; shift ;;
                -m) flag="m"; shift ;;
                -u) flag="u"; shift ;;
                *)  path="$1"; shift ;;
            esac
        done
        if [[ "$flag" == "w" || "$flag" == "m" ]]; then
            # Handle both /c/... and /mnt/c/... (WSL-style) paths
            echo "$path" | sed 's|^/mnt/\([a-zA-Z]\)/|\1:\\|; s|^/\([a-zA-Z]\)/|\1:\\|; s|/|\\|g'
        else
            echo "$path"
        fi
    }
fi

# Dynamic PowerShell path detection
if [[ "$SHELL" == *bash* ]]; then
  POWERSHELL="powershell.exe"
else
  POWERSHELL="/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"
fi

# Check if PowerShell is available
# Check if PowerShell is available

if [ ! -f "$POWERSHELL" ] && ! command -v "$POWERSHELL" >/dev/null 2>&1; then
    echo "❌ ERROR: PowerShell not found"
    echo "   This script requires Windows PowerShell to run."
    echo "   Please ensure you're running on Windows with PowerShell installed."
    exit 1
fi

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$ROOT"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ===== AUTO-DETECT PROJECT AND BRANCH =====
PROJECT_NAME=$(basename "$ROOT")
BRANCH=$(git rev-parse --abbrev-ref HEAD)

LOG_FILE="$ROOT/automation_master_log.txt"
VARS_FILE="$ROOT/config_variables.json"

# ===== LOAD .ENV =====
ENV_FILE="$SCRIPT_DIR/.env"
if [[ ! -f "$ENV_FILE" ]]; then
    echo "❌ ERROR: .env not found at $ENV_FILE"
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

# ===== WINSCP =====
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

SFTP_TMP="$ROOT/.sftp_tmp_$$"
mkdir -p "$SFTP_TMP"
SFTP_TMP_WIN=$(echo "$SFTP_TMP" | sed 's|^/mnt/\([a-zA-Z]\)/|\1:\\|; s|^/\([a-zA-Z]\)/|\1:\\|; s|/|\\|g')
cleanup_sftp() { rm -rf "$SFTP_TMP" 2>/dev/null || true; }
trap cleanup_sftp EXIT

run_winscp() {
    local script_file="$1"
    local output_file="$2"
    local script_win
    # Use sed to convert path — cygpath may mishandle /mnt/c/ style paths
    script_win=$(echo "$script_file" | sed 's|^/mnt/\([a-zA-Z]\)/|\1:\\|; s|^/\([a-zA-Z]\)/|\1:\\|; s|/|\\|g')
    MSYS_NO_PATHCONV=1 "$WINSCP" /ini=nul /script="$script_win" > "$output_file" 2>&1
}

# Logging helper
log() {
    local msg="$*"
    local timestamp="[ $(date '+%Y-%m-%d %H:%M:%S') ]"
    echo "$timestamp $msg" | tee -a "$LOG_FILE"
}

# Variable replacement function
replace_variables() {
    local input="$1"
    local result="$input"
    
    CURRENT_PROJECT=$(basename "$ROOT")
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    
    result="${result//\{PROJECT_NAME\}/$CURRENT_PROJECT}"
    result="${result//\{BRANCH_NAME\}/$CURRENT_BRANCH}"
    result="${result//\{REPO_ROOT\}/$ROOT}"
    
    if [ -f "$VARS_FILE" ]; then
        while IFS= read -r line; do
            if [[ "$line" =~ \"(\{[^}]+\})\"[[:space:]]*:[[:space:]]*\"([^\"]+)\" ]]; then
                var_name="${BASH_REMATCH[1]}"
                var_value="${BASH_REMATCH[2]}"
                result="${result//$var_name/$var_value}"
            fi
        done < <(grep -o '"{[^}]*}"[[:space:]]*:[[:space:]]*"[^"]*"' "$VARS_FILE")
    fi
    
    echo "$result"
}

# Ensure log file exists
LOG_DIR=$(dirname "$LOG_FILE")
mkdir -p "$LOG_DIR"
if [ ! -f "$LOG_FILE" ]; then
    echo "===================================================" > "$LOG_FILE"
    echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Rollback Log initialized" >> "$LOG_FILE"
    echo "===================================================" >> "$LOG_FILE"
fi

log "🔍 Detected project: $PROJECT_NAME"
log "🔍 Detected branch: $BRANCH"
log ""
log "==================================================="
log "🔧 CHECKING & INSTALLING DEPENDENCIES"
log "==================================================="

# ============================================================
# STEP 1: Check and install PowerShell prerequisites
# ============================================================
log "📦 Checking PowerShell prerequisites..."

PREREQ_RESULT=$("$POWERSHELL" -NoProfile -Command '
$ErrorActionPreference = "Stop"
$results = @()

try {
    # Check NuGet Package Provider
    Write-Output "   🔍 Checking NuGet Package Provider..."
    $nuget = Get-PackageProvider -Name NuGet -ErrorAction SilentlyContinue -ListAvailable | 
             Where-Object { $_.Version -ge "2.8.5.201" }
    
    if ($null -eq $nuget) {
        Write-Output "   ⚙  Installing NuGet Package Provider..."
        Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force -Scope CurrentUser | Out-Null
        Write-Output "   ✓ NuGet Package Provider installed"
        $results += "NUGET_INSTALLED"
    } else {
        Write-Output "   ✓ NuGet Package Provider already installed (v$($nuget.Version))"
        $results += "NUGET_EXISTS"
    }
    
    # Check PSGallery Trust Policy
    Write-Output "   🔍 Checking PSGallery installation policy..."
    $gallery = Get-PSRepository -Name PSGallery -ErrorAction SilentlyContinue
    
    if ($null -eq $gallery) {
        Write-Output "   ⚠️  PSGallery repository not found, registering..."
        Register-PSRepository -Default -ErrorAction SilentlyContinue | Out-Null
        $gallery = Get-PSRepository -Name PSGallery -ErrorAction SilentlyContinue
    }
    
    if ($gallery.InstallationPolicy -ne "Trusted") {
        Write-Output "   ⚙  Setting PSGallery as trusted repository..."
        Set-PSRepository -Name PSGallery -InstallationPolicy Trusted
        Write-Output "   ✓ PSGallery set as trusted"
        $results += "PSGALLERY_CONFIGURED"
    } else {
        Write-Output "   ✓ PSGallery already trusted"
        $results += "PSGALLERY_EXISTS"
    }
    
    $results += "SUCCESS"
    Write-Output ($results -join "|")
    
} catch {
    Write-Output "ERROR: $($_.Exception.Message)"
    exit 1
}
' 2>&1)

if [[ "$PREREQ_RESULT" == ERROR* ]]; then
    log "❌ ERROR: Failed to set up PowerShell prerequisites"
    log "   $PREREQ_RESULT"
    exit 1
fi

if [[ "$PREREQ_RESULT" == *"NUGET_INSTALLED"* ]] || [[ "$PREREQ_RESULT" == *"PSGALLERY_CONFIGURED"* ]]; then
    log "   ✓ PowerShell prerequisites configured"
else
    log "   ✓ PowerShell prerequisites already present"
fi

# ============================================================
# STEP 2: Check and install jq
# ============================================================
log "📦 Checking jq..."
if ! command -v jq &> /dev/null; then
    log "   ⚙  jq not found. Installing..."
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows with Git Bash - download jq
        JQ_URL="https://github.com/jqlang/jq/releases/download/jq-1.7.1/jq-win64.exe"
        JQ_PATH="/usr/bin/jq.exe"
        if curl -L "$JQ_URL" -o "$JQ_PATH" 2>/dev/null; then
            chmod +x "$JQ_PATH"
            log "   ✓ jq installed successfully"
        else
            log "   ⚠️  jq installation failed, but continuing..."
        fi
    fi
else
    log "   ✓ jq is ready"
fi

JQ=$(command -v jq || echo "jq")

# ============================================================
# STEP 3: Check and install SqlServer module
# ============================================================
log "📦 Checking SQL Server PowerShell module..."

SQL_MODULE_RESULT=$("$POWERSHELL" -NoProfile -Command '
$ErrorActionPreference = "Stop"

try {
    # Check if SqlServer module is available
    $module = Get-Module -ListAvailable -Name SqlServer | Select-Object -First 1
    
    if ($null -eq $module) {
        Write-Output "   ⚙  SqlServer module not found. Installing for current user..."
        Write-Output "   ⏳ This may take 1-2 minutes on first run..."
        
        # Install the module
        Install-Module -Name SqlServer -Scope CurrentUser -Force -AllowClobber -SkipPublisherCheck -ErrorAction Stop | Out-Null
        
        Write-Output "   ✓ SqlServer module installed successfully"
        $result = "INSTALLED"
    } else {
        Write-Output "   ✓ SqlServer module already installed (v$($module.Version))"
        $result = "EXISTS"
    }
    
    # Try to import the module
    Write-Output "   🔄 Importing SqlServer module..."
    Import-Module SqlServer -ErrorAction Stop | Out-Null
    Write-Output "   ✓ SqlServer module imported successfully"
    
    # Test Invoke-Sqlcmd availability
    if (Get-Command Invoke-Sqlcmd -ErrorAction SilentlyContinue) {
        Write-Output "   ✓ Invoke-Sqlcmd command is available"
        Write-Output "SUCCESS|$result"
    } else {
        throw "Invoke-Sqlcmd command not available after module import"
    }
    
} catch {
    Write-Output "ERROR: $($_.Exception.Message)"
    exit 1
}
' 2>&1)

if [[ "$SQL_MODULE_RESULT" == ERROR* ]]; then
    log "❌ ERROR: Failed to set up SqlServer module"
    log "   $SQL_MODULE_RESULT"
    exit 1
fi

if [[ "$SQL_MODULE_RESULT" == *"INSTALLED"* ]]; then
    log "   ✓ SqlServer module newly installed"
elif [[ "$SQL_MODULE_RESULT" == *"EXISTS"* ]]; then
    log "   ✓ SqlServer module ready"
fi

log "==================================================="
log "✓ All dependencies ready"
log "==================================================="
log ""

# ===== LOAD CONFIG FROM DB - FILTERED BY PROJECT AND BRANCH =====
log "📊 Loading configuration from database..."
log "   Server: 172.29.92.20\sql2005"
log "   Database: NofTest"
log "   Looking for: Project='$PROJECT_NAME', Branch='$BRANCH'"

db_values=$("$POWERSHELL" -NoProfile -Command '
  $ErrorActionPreference = "Stop"
  try {
    # Ensure SqlServer module is imported
    Import-Module SqlServer -ErrorAction Stop | Out-Null
    
    $connectionString = "Server=172.29.92.20\sql2005;Database=NofTest;User ID=alexk;Password=Dtsal21xk;TrustServerCertificate=True;";
    $query = "SELECT TOP 1 pr.ProjectName, pr.Branch, pr.FlagName, pr.ZipName, pr.AppPool, pr.SiteName, pdc.RemoteServer, pdc.RemoteUser, pdc.RemotePassword, pdc.LocalPublishDir FROM NofTest..ProjectRules pr LEFT JOIN NofTest..ProjectDepJoyConfig pdc ON pr.ProjectName = pdc.Project WHERE pr.ProjectName='"'$PROJECT_NAME'"' AND pr.Branch='"'$BRANCH'"'";
    
    $result = Invoke-Sqlcmd -ConnectionString $connectionString -Query $query -ErrorAction Stop;
    
    if ($null -eq $result) {
      Write-Output "NO_RESULTS"
    } else {
      foreach ($row in $result) {
        $line = ($row.ProjectName + "|||DELIM|||" + $row.Branch + "|||DELIM|||" + $row.FlagName + "|||DELIM|||" + $row.ZipName + "|||DELIM|||" + $row.AppPool + "|||DELIM|||" + $row.SiteName + "|||DELIM|||" + $row.RemoteServer + "|||DELIM|||" + $row.RemoteUser + "|||DELIM|||" + $row.RemotePassword + "|||DELIM|||" + $row.LocalPublishDir)
        Write-Output $line
      }
    }
  } catch {
    Write-Output ("ERROR: " + $_.Exception.Message)
  }
')

if [[ "$db_values" == ERROR* ]]; then
    log "❌ ERROR: Failed to connect to database"
    log "   $db_values"
    log ""
    log "   Possible causes:"
    log "   • Network connectivity issues"
    log "   • SQL Server not accessible"
    log "   • SqlServer module not properly installed"
    log "   • Invalid credentials"
    exit 1
elif [[ "$db_values" == "NO_RESULTS" || -z "$db_values" ]]; then
    log "❌ ERROR: No configuration found in database"
    log "   Project: $PROJECT_NAME"
    log "   Branch: $BRANCH"
    log ""
    log "   Please ensure the configuration exists in ProjectRules table"
    exit 1
fi

log "   ✓ Configuration loaded from database"

# Parse DB values
PROJECT=$(echo "$db_values" | awk -F'\\|\\|\\|DELIM\\|\\|\\|' '{print $1}')
BRANCH=$(echo "$db_values" | awk -F'\\|\\|\\|DELIM\\|\\|\\|' '{print $2}')
FLAG_NAME=$(echo "$db_values" | awk -F'\\|\\|\\|DELIM\\|\\|\\|' '{print $3}')
ZIP_NAME=$(echo "$db_values" | awk -F'\\|\\|\\|DELIM\\|\\|\\|' '{print $4}')
APP_POOL=$(echo "$db_values" | awk -F'\\|\\|\\|DELIM\\|\\|\\|' '{print $5}')
SITE_NAME=$(echo "$db_values" | awk -F'\\|\\|\\|DELIM\\|\\|\\|' '{print $6}')
REMOTE_SERVER=$(echo "$db_values" | awk -F'\\|\\|\\|DELIM\\|\\|\\|' '{print $7}')
REMOTE_USER=$(echo "$db_values" | awk -F'\\|\\|\\|DELIM\\|\\|\\|' '{print $8}')
REMOTE_PASSWORD=$(echo "$db_values" | awk -F'\\|\\|\\|DELIM\\|\\|\\|' '{print $9}')
DEPLOY_ROOT=$(echo "$db_values" | awk -F'\\|\\|\\|DELIM\\|\\|\\|' '{print $10}')

# Replace variables in all config values
log "🔄 Replacing variables in configuration..."
PROJECT=$(replace_variables "$PROJECT")
BRANCH=$(replace_variables "$BRANCH")
FLAG_NAME=$(replace_variables "$FLAG_NAME")
REMOTE_SERVER=$(replace_variables "$REMOTE_SERVER")
REMOTE_USER=$(replace_variables "$REMOTE_USER")
REMOTE_PASSWORD=$(replace_variables "$REMOTE_PASSWORD")
DEPLOY_ROOT=$(replace_variables "$DEPLOY_ROOT")

# Store RAW values for Windows paths
RAW_REMOTE="$REMOTE_SERVER"
RAW_FLAG="$FLAG_NAME"

# Normalize paths for Bash
normalize_path() {
    local winpath="$1"
    local path="${winpath//\\//}"
    # Use $OSTYPE rather than $MSYSTEM — MSYSTEM isn't reliably exported
    # when this script runs non-interactively (e.g. Task Scheduler), which
    # was causing this branch to be skipped and producing a doubled slash
    # like "C://Users/..." previously.
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
        # Git-Bash/MSYS style: C:/Users/... -> /c/Users/...
        path=$(echo "$path" | sed -E 's#^([A-Za-z]):#/\L\1#')
    elif grep -qi microsoft /proc/version 2>/dev/null; then
        # WSL: $OSTYPE reports linux-gnu here (not msys), but the filesystem
        # only exposes Windows drives under /mnt/<drive>, so a path like
        # "C:/Users/..." can never resolve via test -d / cd — it needs to be
        # "/mnt/c/Users/...". This is the branch that was silently wrong before.
        path=$(echo "$path" | sed -E 's#^([A-Za-z]):#/mnt/\L\1#')
    else
        # Only insert the ":/" if it isn't already there, so this is safe
        # to call on a path that's already been through the conversion above.
        path=$(echo "$path" | sed -E 's#^([A-Za-z]):([^/])#\1:/\2#')
    fi
    echo "$path"
}

REMOTE_SERVER=$(normalize_path "$REMOTE_SERVER")


log "==============================================================="
log "== ♻️  ROLLBACK STARTED =="
log "==============================================================="
log "Project:      $PROJECT"
log "Branch:       $BRANCH"
log "Flag:         $FLAG_NAME"
log "SFTP:         $SFTP_HOST:$SFTP_PORT"
log "SFTP folder:  $SFTP_UPLOAD_DIR"
log "Deploy Root:  $DEPLOY_ROOT"
log "==============================================================="

# STEP 1: CREATE AND UPLOAD ROLLBACK FLAG
log "🪶 [1/2] Creating rollback flag..."

FLAG_PATH="$SFTP_TMP/${RAW_FLAG}"
echo "rollback triggered $(date)" > "$FLAG_PATH"
FLAG_WIN=$(echo "$FLAG_PATH" | sed 's|^/mnt/\([a-zA-Z]\)/|\1:\\|; s|^/\([a-zA-Z]\)/|\1:\\|; s|/|\\|g')
log "   ✓ Flag created: $RAW_FLAG"

ROLLBACK_START_LOCAL=$("$POWERSHELL" -NoProfile -Command "(Get-Date).ToString('yyyy-MM-dd HH:mm:ss')" 2>/dev/null | tr -d '\r\n') || ROLLBACK_START_LOCAL=""

log "📤 Uploading rollback flag → ${SFTP_UPLOAD_DIR}/${RAW_FLAG}"

PUT_SCRIPT="$SFTP_TMP/put_flag.txt"
PUT_LOG="$SFTP_TMP/put_flag.log"
cat > "$PUT_SCRIPT" <<EOF
option batch abort
option confirm off
option transfer binary
open sftp://${SFTP_HOST}:${SFTP_PORT}/ -username="${SFTP_USER}" -password="${SFTP_PASSWORD}" -hostkey="*"
cd "${SFTP_UPLOAD_DIR}"
put "${FLAG_WIN}" "${RAW_FLAG}"
exit
EOF

run_winscp "$PUT_SCRIPT" "$PUT_LOG" && {
    log "   ✓ Rollback flag uploaded successfully"
} || {
    log "❌ ERROR: Failed to upload rollback flag"
    cat "$PUT_LOG" | while IFS= read -r l; do log "   $l"; done
    exit 1
}

# STEP 2: WAIT FOR WATCHER
log "⏳ [2/2] Waiting for watcher confirmation via SFTP ($SFTP_UPLOAD_DIR)..."

WATCHER_CONFIRMED=false
WATCHER_RESULT_FILES=()
MAX_WAIT=600
CHECK_INTERVAL=4
RESULT_FILE=""

LOCAL_CONFIRM_DIR="$ROOT/.rollback_confirmations"
mkdir -p "$LOCAL_CONFIRM_DIR"
LOCAL_CONFIRM_WIN=$(echo "$LOCAL_CONFIRM_DIR" | sed 's|^/mnt/\([a-zA-Z]\)/|\1:\\|; s|^/\([a-zA-Z]\)/|\1:\\|; s|/|\\|g')

# ── Query expected server count from ProjectRules ────────────────────
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

declare -A SEEN_ROLLBACK_FILES

set +e
for ((i=1; i<=MAX_WAIT/CHECK_INTERVAL; i++)); do
    ELAPSED=$((i * CHECK_INTERVAL))

    LIST_SCRIPT="$SFTP_TMP/list_results.txt"
    LIST_LOG="$SFTP_TMP/list_results.log"

    cat > "$LIST_SCRIPT" <<EOF
option batch continue
option confirm off
open sftp://${SFTP_USER}:${SFTP_PASSWORD}@${SFTP_HOST}:${SFTP_PORT}/ -hostkey=*
cd ${SFTP_UPLOAD_DIR}
ls
exit
EOF
    run_winscp "$LIST_SCRIPT" "$LIST_LOG" || true

    while IFS= read -r line; do
        FNAME=$(echo "$line" | grep -oE "${PROJECT_NAME}_${BRANCH}_Rollback_Success_[^ ]+" | head -1 | tr -d '\r') || true
        [[ -z "$FNAME" ]] && continue
        [[ -n "${SEEN_ROLLBACK_FILES[$FNAME]:-}" ]] && continue

        GET_SCRIPT="$SFTP_TMP/get_result.txt"
        GET_LOG="$SFTP_TMP/get_result.log"
        cat > "$GET_SCRIPT" <<EOF
option batch continue
option confirm off
open sftp://${SFTP_USER}:${SFTP_PASSWORD}@${SFTP_HOST}:${SFTP_PORT}/ -hostkey=*
cd ${SFTP_UPLOAD_DIR}
lcd ${LOCAL_CONFIRM_WIN}
get "${FNAME}"
rm "${FNAME}"
exit
EOF
        run_winscp "$GET_SCRIPT" "$GET_LOG" || true

        RESULT_LOCAL="$LOCAL_CONFIRM_DIR/$FNAME"
        if [[ ! -f "$RESULT_LOCAL" ]]; then
            log "[DEBUG] GET failed for $FNAME — LOCAL_CONFIRM_WIN=$LOCAL_CONFIRM_WIN"
            cat "$GET_LOG" 2>/dev/null | tail -5 | while IFS= read -r l; do log "   GET: $l"; done
            continue
        fi

        RESULT_BRANCH=$(grep -E 'Branch=' "$RESULT_LOCAL" | head -1 | cut -d'=' -f2- | tr -d '\r') || true
        RESULT_STATUS=$(grep -E 'Status=' "$RESULT_LOCAL" | head -1 | cut -d'=' -f2- | tr -d '\r') || true
        RESULT_TIME=$(grep   -E 'Time='   "$RESULT_LOCAL" | head -1 | cut -d'=' -f2- | tr -d '\r') || true

        if [[ "$RESULT_BRANCH" != "$BRANCH" ]]; then continue; fi
        if [[ "$RESULT_STATUS" != "Success" ]]; then continue; fi

        if [[ -n "$RESULT_TIME" && -n "$ROLLBACK_START_LOCAL" ]]; then
            RESULT_EPOCH=$("$POWERSHELL" -NoProfile -Command "try { [DateTimeOffset]::Parse('$RESULT_TIME').ToUnixTimeSeconds() } catch { 0 }" 2>/dev/null | tr -d '\r\n')
            START_EPOCH=$("$POWERSHELL"  -NoProfile -Command "try { [DateTimeOffset]::Parse('$ROLLBACK_START_LOCAL').ToUnixTimeSeconds() } catch { 0 }" 2>/dev/null | tr -d '\r\n')
            if [[ "$RESULT_EPOCH" =~ ^[0-9]+$ && "$START_EPOCH" =~ ^[0-9]+$ ]] && (( RESULT_EPOCH < START_EPOCH )); then
                continue
            fi
        fi

        SEEN_ROLLBACK_FILES[$FNAME]=1
        WATCHER_RESULT_FILES+=("$RESULT_LOCAL")
        R_SERVER=$(grep -E 'WatcherNode=' "$RESULT_LOCAL" | head -1 | cut -d'=' -f2- | tr -d '\r') || R_SERVER="?"
        log ""
        log "   📥 Response from server: $R_SERVER → Status: $RESULT_STATUS"
        cat "$RESULT_LOCAL" | while IFS= read -r rline; do log "      | $rline"; done

    done < "$LIST_LOG"

    RECEIVED=${#WATCHER_RESULT_FILES[@]}
    if [[ $RECEIVED -ge $SERVER_COUNT ]]; then
        WATCHER_CONFIRMED=true
        RESULT_FILE="${WATCHER_RESULT_FILES[0]}"
        log "   ✅ All $SERVER_COUNT server(s) confirmed after ${ELAPSED}s!"
        break
    fi

    [[ $ELAPSED -eq 30  ]] && log "   ... waiting (${RECEIVED}/${SERVER_COUNT} responded, 30s)"
    [[ $ELAPSED -eq 60  ]] && log "   ... waiting (${RECEIVED}/${SERVER_COUNT} responded, 60s)"
    [[ $ELAPSED -eq 90  ]] && log "   ... waiting (${RECEIVED}/${SERVER_COUNT} responded, 90s)"
    [[ $ELAPSED -eq 120 ]] && log "   ... waiting (${RECEIVED}/${SERVER_COUNT} responded, 120s)"

    sleep "$CHECK_INTERVAL"
done
set -e
RECEIVED=${#WATCHER_RESULT_FILES[@]}

# Parse watcher result file to get rollback details
if [[ "$WATCHER_CONFIRMED" == true ]] && [[ -n "$RESULT_FILE" ]]; then
    log "📄 Reading rollback details..."

    WATCHER_DEPLOY_ROOT=$(grep -E '(DeployRoot|DeployPath)=' "$RESULT_FILE" | head -1 | cut -d'=' -f2- | tr -d '\r') || true
    WATCHER_BACKUP=$(grep -E '(BackupRemoved|BackupPath)=' "$RESULT_FILE" | head -1 | cut -d'=' -f2- | tr -d '\r') || true
    WATCHER_IIS=$(grep -E 'IISRestart=' "$RESULT_FILE" | head -1 | cut -d'=' -f2- | tr -d '\r') || true
    WATCHER_SERVER=$(grep -E 'WatcherNode=' "$RESULT_FILE" | head -1 | cut -d'=' -f2- | tr -d '\r') || true

    [[ -z "$WATCHER_DEPLOY_ROOT" ]] && WATCHER_DEPLOY_ROOT="Not in confirmation"
    [[ -z "$WATCHER_BACKUP"      ]] && WATCHER_BACKUP="Not in confirmation"
    [[ -z "$WATCHER_IIS"         ]] && WATCHER_IIS="Not specified"
    [[ -z "$WATCHER_SERVER"      ]] && WATCHER_SERVER="DTSLC-PP"

    log "   ✓ Deploy Root: $WATCHER_DEPLOY_ROOT"
    log "   ✓ Backup:      $WATCHER_BACKUP"
    log "   ✓ IIS Restart: $WATCHER_IIS"
    log "   ✓ Server:      $WATCHER_SERVER"
else
    WATCHER_DEPLOY_ROOT=""
    WATCHER_BACKUP=""
    WATCHER_IIS=""
    WATCHER_SERVER=""
fi

# Cleanup
rm -f "$FLAG_PATH"

log ""
log "==================================================="
if [[ "$WATCHER_CONFIRMED" == true ]]; then
    log "🎉 ROLLBACK COMPLETE — $RECEIVED/$SERVER_COUNT servers responded"
    log "   ✓ Deploy Root: $WATCHER_DEPLOY_ROOT"
    log "   ✓ Backup:      $WATCHER_BACKUP"
    log "   ✓ IIS Restart: $WATCHER_IIS"
else
    log "⚠️  FLAG UPLOADED — $RECEIVED/$SERVER_COUNT servers responded within ${MAX_WAIT}s"
    log "   Flag uploaded to SFTP: ${SFTP_UPLOAD_DIR}/${RAW_FLAG}"
fi
log "==================================================="

# ==================================================
# STEP 8: RUN LOCAL SMOKE TESTS — DISABLED
# ==================================================
# Smoke test execution is skipped for this script. The step is kept as a
# no-op placeholder (rather than deleted) so re-enabling it later is a
# one-line revert, and so SITE_STATUS still exists for the email section
# below without needing to touch that logic.
log ""
log "==================================================="
log "🧪 SMOKE TESTS (LOCAL) — SKIPPED"
log "==================================================="
log "   ⏭  Smoke test step is disabled — not running"

SITE_STATUS="⏭ Not tested — smoke test step is disabled"

# ----------------------------------------------------
# SEND EMAIL - WITH IMPROVED USER DETECTION
# (now runs after smoke tests, so it can report SITE_STATUS)
# ----------------------------------------------------
# Try to get username from Git config first (who cloned the repo)
GIT_USERNAME=$(git config user.name 2>/dev/null || echo "")
GIT_EMAIL=$(git config user.email 2>/dev/null || echo "")

# If Git username not found, try to extract from path
if [[ -z "$GIT_USERNAME" ]]; then
    GIT_USERNAME=$(echo "$ROOT" | sed -E 's#.*Users/([^/]+).*#\1#')
fi

# If Git email not found, try Windows username
if [[ -z "$GIT_EMAIL" ]]; then
    WIN_USERNAME=$("$POWERSHELL" -NoProfile -Command "Write-Output \$env:USERNAME" 2>/dev/null | tr -d '\r\n') || WIN_USERNAME=""
    if [[ -n "$WIN_USERNAME" ]]; then
        GIT_USERNAME="$WIN_USERNAME"
        GIT_EMAIL="${WIN_USERNAME}@swish.co.il"
    else
        GIT_EMAIL="${GIT_USERNAME}@swish.co.il"
    fi
fi

EMAIL="$GIT_EMAIL"
TRIGGERED_BY="$GIT_USERNAME"

log ""
log "   👤 Detected user: $TRIGGERED_BY"
log "   📧 Email address: $EMAIL"

# Base subject/badge on watcher confirmation, as before — but if the site
# verification itself failed (rollback succeeded, smoke tests didn't), flip
# to a warning presentation even though the watcher confirmed the rollback.
SITE_VERIFY_FAILED=false
if [[ "$SITE_STATUS" == "❌"* ]]; then
    SITE_VERIFY_FAILED=true
fi

if [[ "$WATCHER_CONFIRMED" == true ]] && [[ "$SITE_VERIFY_FAILED" == false ]]; then
    EMAIL_SUBJECT="✅ ROLLBACK PROCESS COMPLETED — $PROJECT ($BRANCH) — ${RECEIVED}/${SERVER_COUNT} servers"
    EMAIL_BADGE="♻️ ROLLBACK STATUS: SUCCESS"
    EMAIL_COLOR="#1976d2"
    EMAIL_BADGE="♻️ ROLLBACK STATUS:SUCCESS "
    EMAIL_BGCOLOR="#e3f2fd"
    EMAIL_COLOR="#1976d2"
    EMAIL_FOOTER="<strong>✓ Rollback verified by watchdog service</strong><br>Previous deployment has been restored successfully."
elif [[ "$WATCHER_CONFIRMED" == true ]] && [[ "$SITE_VERIFY_FAILED" == true ]]; then
    EMAIL_SUBJECT="🟥 ROLLBACK PROCESS UNCOMPLETED — $PROJECT ($BRANCH) — ${RECEIVED}/${SERVER_COUNT} servers"
    EMAIL_BADGE="⚠ ROLLBACK STATUS:UNSUCCESSFUL"
    EMAIL_BGCOLOR="#fdecea"
    EMAIL_COLOR="#c62828"
    EMAIL_FOOTER="<strong>⚠ Rollback confirmed by watchdog, but the site did not pass smoke tests</strong><br>Please check the Allure report / log and verify manually."
else
    EMAIL_SUBJECT="🟨 Rollback Requested — $PROJECT ($BRANCH) — ${RECEIVED}/${SERVER_COUNT} responded"
    EMAIL_BADGE="⚠ WATCHDOG DID NOT RESPOND"
    EMAIL_BGCOLOR="#fff3e0"
    EMAIL_COLOR="#ff9800"
    EMAIL_FOOTER="<strong>⚠ Note: Watchdog service did not confirm rollback</strong><br>Rollback flag uploaded successfully, but watchdog confirmation not received within 2 minutes.<br>Please check watchdog service logs and verify rollback manually."
fi

# Escape special characters for PowerShell
WATCHER_DEPLOY_ROOT_ESC=$(echo "$WATCHER_DEPLOY_ROOT" | sed "s/'/''/g")
WATCHER_BACKUP_ESC=$(echo "$WATCHER_BACKUP" | sed "s/'/''/g")
WATCHER_IIS_ESC=$(echo "$WATCHER_IIS" | sed "s/'/''/g")
WATCHER_SERVER_ESC=$(echo "$WATCHER_SERVER" | sed "s/'/''/g")
DEPLOY_ROOT_ESC=$(echo "$DEPLOY_ROOT" | sed "s/'/''/g")
SITE_STATUS_ESC=$(echo "$SITE_STATUS" | sed "s/'/''/g")

log "📝 DEBUG: Email variables before sending:"
log "   PROJECT='$PROJECT'"
log "   BRANCH='$BRANCH'"
log "   DEPLOY_ROOT='$WATCHER_DEPLOY_ROOT'"
log "   BACKUP_REMOVED='$WATCHER_BACKUP'"
log "   IIS_RESTART='$WATCHER_IIS'"
log "   SERVER='$WATCHER_SERVER'"
log "   SITE_STATUS='$SITE_STATUS'"

EMAIL_RESULT=$("$POWERSHELL" -NoProfile -Command "
try {
    \$outlook = New-Object -ComObject Outlook.Application
    \$mail = \$outlook.CreateItem(0)
    
    \$mail.To = '$EMAIL'
    \$mail.Subject = '$EMAIL_SUBJECT'
    
    \$timestamp = Get-Date -Format 'dd.MM.yyyy HH:mm'
    \$triggeredBy = '$TRIGGERED_BY'
    \$project = '$PROJECT'
    \$branch = '$BRANCH'
    
    # Use watcher data if available, otherwise use defaults
    \$deployRoot = if ('$WATCHER_DEPLOY_ROOT_ESC' -ne '') { '$WATCHER_DEPLOY_ROOT_ESC' } else { '$DEPLOY_ROOT_ESC' }
    \$backupRemoved = if ('$WATCHER_BACKUP_ESC' -ne '') { '$WATCHER_BACKUP_ESC' } else { 'Not confirmed by watcher' }
    \$iisRestart = if ('$WATCHER_IIS_ESC' -ne '') { '$WATCHER_IIS_ESC' } else { 'Unknown' }
    \$serverNode = if ('$WATCHER_SERVER_ESC' -ne '') { '$WATCHER_SERVER_ESC' } else { 'DTSLC-PP' }
    \$siteStatus = '$SITE_STATUS_ESC'
    
    \$htmlBody = @\"
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; }
        .container { 
            background: $EMAIL_BGCOLOR; 
            padding: 30px; 
            border-radius: 12px; 
            max-width: 650px;
            border: 3px solid $EMAIL_COLOR;
            direction:ltr; text-align:left;
        }
        .header { 
            color: #424242; 
            margin-top: 0; 
            border-bottom: 3px solid $EMAIL_COLOR; 
            padding-bottom: 12px; 
        }
        .badge { 
            background: $EMAIL_COLOR; 
            color: white; 
            padding: 10px 20px; 
            border-radius: 8px; 
            display: inline-block; 
            font-weight: bold;
            margin: 15px 0;
            font-size: 16px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 25px; 
            background: white; 
            border-radius: 8px; 
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        td { 
            padding: 14px 18px; 
            border-bottom: 1px solid #e0e0e0; 
        }
        td:first-child { 
            font-weight: 600; 
            color: #424242; 
            width: 38%; 
            background: #f5f5f5; 
        }
        tr:last-child td { 
            border-bottom: none; 
        }
        .footer { 
            margin-top: 25px; 
            padding-top: 20px; 
            border-top: 2px solid $EMAIL_COLOR; 
            color: #555; 
            font-size: 13px; 
        }
    </style>
</head>
<body>
<div class='container'>
    <h2 class='header'>$EMAIL_SUBJECT</h2>
    <div class='badge'>$EMAIL_BADGE</div>
    
    <table>
        <tr><td>Project</td><td><strong>\$project</strong></td></tr>
        <tr><td>Branch</td><td><strong>\$branch</strong></td></tr>
        <tr><td>Rollback Time</td><td>\$timestamp</td></tr>
        <tr><td>Servers</td><td>${RECEIVED}/${SERVER_COUNT} responded</td></tr>
        <tr><td>Deployment Root</td><td>\$deployRoot</td></tr>
        <tr><td>Triggered By</td><td>\$triggeredBy</td></tr>
        <tr><td>Site Status</td><td>\$siteStatus</td></tr>
    </table>
    $(
      if [[ ${#WATCHER_RESULT_FILES[@]} -gt 0 ]]; then
        echo "<br><table border='1' style='border-collapse:collapse;width:100%;font-size:12px;'>"
        echo "<tr style='background:#f5f5f5;'><th style='padding:6px;'>Server</th><th style='padding:6px;'>Status</th><th style='padding:6px;'>IIS</th><th style='padding:6px;'>Backup</th></tr>"
        for TXT_FILE in "${WATCHER_RESULT_FILES[@]}"; do
          R_SERVER=$(grep -E 'WatcherNode=' "$TXT_FILE" | head -1 | cut -d'=' -f2- | tr -d '\r') || R_SERVER="?"
          R_STATUS=$(grep -E 'Status=' "$TXT_FILE" | head -1 | cut -d'=' -f2- | tr -d '\r') || R_STATUS="?"
          R_IIS=$(grep -E 'IISRestart=' "$TXT_FILE" | head -1 | cut -d'=' -f2- | tr -d '\r') || R_IIS="?"
          R_BACKUP=$(grep -E '(BackupRemoved|BackupPath)=' "$TXT_FILE" | head -1 | cut -d'=' -f2- | tr -d '\r') || R_BACKUP="?"
          echo "<tr><td style='padding:6px;'>$R_SERVER</td><td style='padding:6px;'>$R_STATUS</td><td style='padding:6px;'>$R_IIS</td><td style='padding:6px;font-family:monospace;font-size:11px;'>$R_BACKUP</td></tr>"
        done
        echo "</table>"
      fi
    )
    
    <div class='footer'>
        $EMAIL_FOOTER
    </div>
</div>
</body>
</html>
\"@
    
    \$mail.HTMLBody = \$htmlBody
    
    if (Test-Path '$LOG_FILE') {
        \$mail.Attachments.Add('$LOG_FILE') | Out-Null
    }
    
    \$mail.Send()
    Write-Output 'EMAIL_SENT'
    
} catch {
    Write-Output \"EMAIL_FAILED: \$(\$_.Exception.Message)\"
}
" 2>&1)

if [[ "$EMAIL_RESULT" == *"EMAIL_SENT"* ]]; then
    log "   ✓ Email sent successfully!"
else
    log "   ⚠️  Email issue: $EMAIL_RESULT"
fi

log ""
log "==================================================="
log "🏁 PIPELINE FINISHED"
log "==================================================="

exit 0
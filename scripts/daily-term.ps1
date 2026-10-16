# Viết và đăng thuật ngữ trending của ngày hôm nay bằng Claude Code (chế độ headless).
# Được gọi bởi Task Scheduler (task "TopKhoaHoc - Thuat ngu hang ngay"), chạy tay:
#   powershell -ExecutionPolicy Bypass -File scripts\daily-term.ps1
# Chạy thử cho một ngày khác, không commit/push:
#   powershell -ExecutionPolicy Bypass -File scripts\daily-term.ps1 -Date 2026-10-20 -DryRun
param([string]$Date, [switch]$DryRun)

$Repo = Split-Path -Parent $PSScriptRoot
Set-Location $Repo

$OutputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding $false
$LogDir = Join-Path $Repo "logs"
New-Item -ItemType Directory -Force $LogDir | Out-Null
$Log = Join-Path $LogDir ("daily-term-" + (Get-Date -Format "yyyy-MM") + ".log")

function Log($msg) {
  $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $msg"
  Write-Host $line
  Add-Content -Path $Log -Value $line -Encoding UTF8
}

# Chạy lệnh qua cmd để gom stdout/stderr vào log, trả về exit code.
function Run($cmd) {
  cmd /c "$cmd 2>&1" | ForEach-Object { Log "  $_" }
  return $LASTEXITCODE
}

function Fail($msg) {
  Log "LỖI: $msg"
  msg $env:USERNAME "TopKhoaHoc: chưa đăng được thuật ngữ hôm nay. Xem log: $Log" 2>$null
  exit 1
}

$today = if ($Date) { $Date } else { [System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([DateTime]::UtcNow, "SE Asia Standard Time").ToString("yyyy-MM-dd") }
Log "=== Bắt đầu cho ngày $today ==="

if (-not $DryRun -and (Run "git pull --ff-only") -ne 0) { Fail "git pull thất bại" }

function TermsForToday {
  Get-ChildItem content\terms\*.md | Where-Object { $_.Name -notlike "_*" } |
    Where-Object { Select-String -Path $_.FullName -Pattern "^date:\s*[`"']?$today" -Quiet }
}

$existing = TermsForToday
if ($existing) {
  Log "Đã có bài cho hôm nay ($($existing.Name -join ', ')), bỏ qua."
  exit 0
}

if (-not (Test-Path node_modules)) { Run "npm ci" | Out-Null }

$tools = @(
  "Read", "Write", "Edit", "Glob", "Grep", "WebSearch", "WebFetch",
  "Bash(npm run new:*)"
)
# Ghi nhận file đang sửa dở trước khi Claude chạy, để không hoàn tác nhầm.
$dirtyBefore = @(git status --porcelain | ForEach-Object { $_.Substring(3) })
Log "Gọi Claude Code để viết bài..."
& claude -p "Hom nay la $today (gio Viet Nam). Doc file scripts/daily-term-prompt.md va lam dung theo huong dan." `
  --permission-mode acceptEdits --allowedTools $tools 2>&1 | ForEach-Object { Log "  [claude] $_" }

# Claude chỉ được sửa content/terms: hoàn tác file đã commit mà bị sửa ở chỗ khác.
$others = git status --porcelain | Where-Object { $_ -match "^ M" } | ForEach-Object { $_.Substring(3) } |
  Where-Object { $_ -notlike "content/terms/*" -and $dirtyBefore -notcontains $_ }
foreach ($f in $others) {
  Log "Hoàn tác thay đổi ngoài content/terms: $f"
  git checkout -- $f
}

$new = TermsForToday
if (-not $new) { Fail "Claude không tạo được bài cho ngày $today" }
Log "Bài mới: $($new.Name -join ', ')"

if ((Run "npm run build") -ne 0) {
  $new | ForEach-Object { Remove-Item $_.FullName }
  Fail "Build lỗi, đã xoá bài vừa viết"
}

if ($DryRun) {
  Log "DryRun: build OK, bỏ qua commit/push. File: $($new.FullName -join ', ')"
  exit 0
}

git add -- $new.FullName
$names = ($new | ForEach-Object { $_.BaseName }) -join ", "
$commitMsg = "Thuật ngữ ngày ${today}: $names`n`nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
$msgFile = Join-Path $LogDir "commit-msg.txt"
[System.IO.File]::WriteAllText($msgFile, $commitMsg, (New-Object System.Text.UTF8Encoding $false))
if ((Run "git commit -q -F `"$msgFile`"") -ne 0) { Fail "git commit thất bại" }
if ((Run "git push origin main") -ne 0) { Fail "git push thất bại" }

Log "Đã đăng: $names. Vercel sẽ deploy trong vài phút."

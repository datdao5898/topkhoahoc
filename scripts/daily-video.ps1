# Làm video dọc cho thuật ngữ của ngày rồi đăng Reel lên Facebook Page TopKhoaHoc.
# daily-term.ps1 (8:30) gọi script này sau khi đăng bài; lỗi ở đây không ảnh hưởng bài trên web hay bài Facebook.
# Reel được lên lịch trên Facebook lúc 20:00 hôm nay (-At), Facebook tự đăng nên máy không cần bật buổi tối.
# Đã quá giờ đó (cách dưới 20 phút) thì đăng ngay.
#   powershell -ExecutionPolicy Bypass -File scripts\daily-video.ps1                    → thuật ngữ hôm nay
#   powershell -ExecutionPolicy Bypass -File scripts\daily-video.ps1 -Slug aura         → thuật ngữ bất kỳ, lên lịch tối nay
#   powershell -ExecutionPolicy Bypass -File scripts\daily-video.ps1 -NoPost            → chỉ dựng video, không đăng
#   powershell -ExecutionPolicy Bypass -File scripts\daily-video.ps1 -Date 2026-10-20 -DryRun   → làm video, không đăng
# Các bước: Claude viết storyboard (scripts/daily-video-prompt.md) → video/make.py (giọng VieNeu + dựng cảnh)
#           → HyperFrames check + render → scripts/facebook-video.mjs (đăng Reel, ghi logs/facebook-videos.json).
# Nếu video.mp4 đã dựng sẵn thì dùng luôn; muốn dựng lại thì xoá video.mp4 đó.
param([string]$Date, [string]$Slug, [string]$At = "20:00", [switch]$DryRun, [switch]$NoPost)

$Repo = Split-Path -Parent $PSScriptRoot
Set-Location $Repo

$OutputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding $false
$LogDir = Join-Path $Repo "logs"
New-Item -ItemType Directory -Force (Join-Path $LogDir "video") | Out-Null
$Log = Join-Path $LogDir ("daily-term-" + (Get-Date -Format "yyyy-MM") + ".log")
$VideoRoot = if ($env:TOPKHOAHOC_VIDEO_DIR) { $env:TOPKHOAHOC_VIDEO_DIR } else { "C:\Users\datda\Videos\topkhoahoc" }
$VenvPython = if ($env:VIENEU_PYTHON) { $env:VIENEU_PYTHON } else { Join-Path $VideoRoot "voice-samples\vieneu-env\Scripts\python.exe" }
$Hf = "hyperframes@0.8.201"
$env:HF_HUB_DISABLE_SYMLINKS_WARNING = "1"

function Log($msg) {
  $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [video] $msg"
  Write-Host $line
  Add-Content -Path $Log -Value $line -Encoding UTF8
}

function Run($cmd) {
  cmd /c "$cmd 2>&1" | ForEach-Object { Log "  $_" }
  return $LASTEXITCODE
}

function Fail($msg) {
  Log "LỖI: $msg"
  msg $env:USERNAME "TopKhoaHoc: chưa làm được video hôm nay. Xem log: $Log" 2>$null
  exit 1
}


$now = [System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([DateTime]::UtcNow, "SE Asia Standard Time")
if ($Slug) {
  $term = Get-Item "content\terms\$Slug.md" -ErrorAction SilentlyContinue
  if (-not $term) { Fail "Không thấy content\terms\$Slug.md" }
  $today = if ($Date) { $Date } else { ((Select-String -Path $term.FullName -Pattern "^date:\s*[`"']?(\d{4}-\d{2}-\d{2})").Matches[0].Groups[1].Value) }
} else {
  $today = if ($Date) { $Date } else { $now.ToString("yyyy-MM-dd") }
  $term = Get-ChildItem content\terms\*.md | Where-Object { $_.Name -notlike "_*" } |
    Where-Object { Select-String -Path $_.FullName -Pattern "^date:\s*[`"']?$today" -Quiet } |
    Where-Object { -not (Select-String -Path $_.FullName -Pattern "^bonus:\s*true" -Quiet) } | Select-Object -First 1
  if (-not $term) { Log "Không có thuật ngữ cho ngày $today, bỏ qua video."; exit 0 }
}
$slug = $term.BaseName
Log "=== Video cho $slug ($today) ==="

$stateFile = Join-Path $LogDir "facebook-videos.json"
if ((Test-Path $stateFile) -and (Select-String -Path $stateFile -Pattern "`"$slug`"" -Quiet)) {
  Log "$slug đã có video trên Facebook, bỏ qua."
  exit 0
}

$board = "logs/video/$today-$slug.json"
$out = Join-Path $VideoRoot "$today-$slug"

if (-not $DryRun -and (Test-Path (Join-Path $out "video.mp4"))) {
  Log "Dùng video đã dựng sẵn: $out\video.mp4"
} else {
  if (-not (Test-Path $VenvPython)) { Fail "Không thấy Python của VieNeu-TTS: $VenvPython" }
  # Claude viết storyboard; sai định dạng thì cho viết lại một lần kèm thông báo lỗi.
  $note = ""
  for ($try = 1; $try -le 2; $try++) {
    if (-not (Test-Path $board) -or $try -gt 1) {
      Log "Gọi Claude viết storyboard (lần $try)..."
      & claude -p "Doc file scripts/daily-video-prompt.md va lam dung huong dan cho thuat ngu content/terms/$slug.md. Ghi storyboard JSON vao $board.$note" `
        --permission-mode acceptEdits --allowedTools Read Write Glob Grep 2>&1 | ForEach-Object { Log "  [claude] $_" }
    }
    if (-not (Test-Path $board)) { continue }
    Log "Dựng video (giọng đọc + cảnh)..."
    $lines = & $VenvPython -X utf8 video/make.py $board $out 2>&1 | ForEach-Object { "$_" } | Where-Object { $_ -notmatch "warn" }
    $lines | ForEach-Object { Log "  $_" }
    if ($LASTEXITCODE -eq 0) { break }
    if ($LASTEXITCODE -ne 2) { Fail "video/make.py lỗi" }
    $note = " Lan truoc file bi loi: " + (($lines | Where-Object { $_ -match "LỖI" }) -join " ") + ". Sua lai cho dung."
    Remove-Item $board -ErrorAction SilentlyContinue
  }
  if (-not (Test-Path (Join-Path $out "index.html"))) { Fail "Không tạo được storyboard hợp lệ cho $slug" }

  Push-Location $out
  try {
    if ((Run "npx --yes $Hf check") -ne 0) { Fail "HyperFrames check báo lỗi ở $out" }
    Log "Render video (khoảng 10 phút)..."
    if ((Run "npx --yes $Hf render --output video.mp4") -ne 0 -or -not (Test-Path video.mp4)) { Fail "Render lỗi ở $out" }
  } finally { Pop-Location }
  Log "Video: $out\video.mp4"
}

if ($NoPost) { Log "Đã dựng xong, không đăng (-NoPost)."; exit 0 }
if ($DryRun) {
  Run "node scripts/facebook-video.mjs `"$out`" --dry-run" | Out-Null
  exit 0
}
# Giờ đăng tính theo giờ Việt Nam của hôm chạy script (không phải ngày của thuật ngữ).
$when = [DateTime]::ParseExact("$($now.ToString('yyyy-MM-dd')) $At", "yyyy-MM-dd HH:mm", $null)
$schedule = if ($when -gt $now.AddMinutes(20)) { " --schedule $($when.ToString('yyyy-MM-ddTHH:mm:ss'))+07:00" } else { "" }
if ((Run "node scripts/facebook-video.mjs `"$out`"$schedule") -ne 0) {
  Fail "Chưa đăng được video. Chạy lại: node scripts/facebook-video.mjs `"$out`"$schedule"
}

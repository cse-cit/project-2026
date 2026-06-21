<#
PowerShell cleanup script for BloodConnect repository.
Run this from the repo root in PowerShell as Administrator or regular user:

    ./scripts/clean_repo.ps1

What it does (interactive):
- Removes committed `client/build` directory (ask before deleting)
- Removes any `client/.env` files (ask before deleting)
- Creates `client/.env.example` if missing
- Finds likely API keys in files (simple regex) and offers to redact them
- Prints next steps for purging history if secrets were found

#>
Set-StrictMode -Version Latest
Push-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)
Pop-Location

$repoRoot = Resolve-Path ".." | Select-Object -ExpandProperty Path
Write-Host "Repo root: $repoRoot"

function Confirm-And-Remove($path) {
    if (Test-Path $path) {
        $resp = Read-Host "Delete $path ? (y/N)"
        if ($resp -match '^[yY]') {
            Remove-Item -Recurse -Force -Path $path
            Write-Host "Removed $path"
        } else {
            Write-Host "Skipped $path"
        }
    } else {
        Write-Host "Not found: $path"
    }
}

# Remove client/build
$clientBuild = Join-Path $repoRoot 'client\build'
Confirm-And-Remove $clientBuild

# Remove client/.env if present
$clientEnv = Join-Path $repoRoot 'client\.env'
Confirm-And-Remove $clientEnv

# Ensure client/.env.example exists
$envExample = Join-Path $repoRoot 'client\.env.example'
if (-not (Test-Path $envExample)) {
    @"REACT_APP_GEMINI_API_KEY=
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
# Copy this to client/.env and fill secrets. Do NOT commit .env
"@ | Out-File -FilePath $envExample -Encoding utf8
    Write-Host "Created client/.env.example"
} else {
    Write-Host "client/.env.example already exists"
}

# Quick scan for obvious API key patterns
$patterns = @('REACT_APP_GEMINI_API_KEY','AIza[0-9A-Za-z-_]{35,}','AQ\.[A-Za-z0-9_\-]{20,}')
$found = @()
Get-ChildItem -Path $repoRoot -Recurse -File -Exclude '*.git*','node_modules','package-lock.json' | ForEach-Object {
    $content = Get-Content -Raw -Path $_.FullName -ErrorAction SilentlyContinue
    if ($null -ne $content) {
        foreach ($p in $patterns) {
            if ($content -match $p) {
                $found += $_.FullName
                break
            }
        }
    }
}

if ($found.Count -gt 0) {
    Write-Host "Potential secrets found in files:"
    $found | ForEach-Object { Write-Host "  $_" }
    $doRedact = Read-Host "Attempt to redact matches (in-place) by replacing with '<REDACTED>'? (y/N)"
    if ($doRedact -match '^[yY]') {
        foreach ($file in $found) {
            (Get-Content $file -Raw) -replace 'AQ\.[A-Za-z0-9_\-]{20,}', '<REDACTED_GEMINI_KEY>' | Set-Content $file -Encoding utf8
            (Get-Content $file -Raw) -replace 'REACT_APP_GEMINI_API_KEY=.*', 'REACT_APP_GEMINI_API_KEY=<REDACTED>' | Set-Content $file -Encoding utf8
        }
        Write-Host "Redaction complete. NOTE: this modifies committed files; consider rewriting Git history to purge secrets." -ForegroundColor Yellow
    }
} else {
    Write-Host "No obvious secrets found by quick scan."
}

Write-Host "Cleanup script finished. Recommended next steps:" -ForegroundColor Green
Write-Host " - Review changes, run 'git status' and commit safe changes." -ForegroundColor Green
Write-Host " - If you removed secrets, rotate them immediately and purge Git history (use 'git filter-repo' or BFG)." -ForegroundColor Yellow
Write-Host " - Ensure .gitignore contains client/.env and client/build (it already should)." -ForegroundColor Green
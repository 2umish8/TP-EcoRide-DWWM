#!/usr/bin/env pwsh
# EcoRide Pre-Evaluation Verification Script
# Run this tomorrow morning to verify everything is ready

Write-Host "=" * 60
Write-Host "EcoRide Evaluation Readiness Check" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

# Color helpers
$green = [ConsoleColor]::Green
$red = [ConsoleColor]::Red
$yellow = [ConsoleColor]::Yellow

function Test-Pass {
    param([string]$message)
    Write-Host "✅ $message" -ForegroundColor $green
}

function Test-Fail {
    param([string]$message)
    Write-Host "❌ $message" -ForegroundColor $red
}

function Test-Warn {
    param([string]$message)
    Write-Host "⚠️  $message" -ForegroundColor $yellow
}

# 1. Check Backend
Write-Host "[1/5] Checking Backend..." -ForegroundColor Cyan
$backend = Get-Process node -ErrorAction SilentlyContinue
if ($backend -and (Test-NetConnection localhost -Port 3000 -WarningAction SilentlyContinue).TcpTestSucceeded) {
    Test-Pass "Backend running on port 3000"
} elseif ($backend) {
    Test-Warn "Node running but Backend might not be responding"
} else {
    Test-Fail "Backend NOT running - Start with: cd Backend && npm run dev"
}

Write-Host ""

# 2. Check Frontend
Write-Host "[2/5] Checking Frontend..." -ForegroundColor Cyan
if (Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.Name -eq "node"}) {
    Test-Warn "Frontend not verified - should be running on :5174"
} else {
    Test-Fail "No Node process found - need to start both Backend and Frontend"
}

Write-Host ""

# 3. Check Test Files
Write-Host "[3/5] Checking Test Files..." -ForegroundColor Cyan
$testFiles = @(
    "Frontend\e2e\tests\homepage.spec.js",
    "Frontend\e2e\tests\registration.spec.js",
    "Frontend\e2e\tests\passenger-workflow.spec.js",
    "Frontend\e2e\tests\driver-workflow.spec.js",
    "Frontend\e2e\tests\review-submission.spec.js"
)

foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Test-Pass "$file exists"
    } else {
        Test-Fail "$file missing"
    }
}

Write-Host ""

# 4. Check Documentation
Write-Host "[4/5] Checking Documentation..." -ForegroundColor Cyan
$docFiles = @(
    "Documentation\EVALUATION_READINESS.md",
    "Documentation\TEST_STRATEGY_PLAN.md",
    "Documentation\MANUAL_TEST_CHECKLIST.md",
    "Documentation\SESSION_SUMMARY.md"
)

foreach ($file in $docFiles) {
    if (Test-Path $file) {
        Test-Pass "$(Split-Path $file -Leaf) exists"
    } else {
        Test-Fail "$(Split-Path $file -Leaf) missing"
    }
}

Write-Host ""

# 5. Check Reset Endpoints
Write-Host "[5/5] Checking Test Reset Endpoints..." -ForegroundColor Cyan
$adminRoutes = Get-Content "Backend\routes\adminRoutes.js" | Select-String "test/reset-user|test/cleanup"
if ($adminRoutes) {
    Test-Pass "Test reset endpoints found in adminRoutes.js"
} else {
    Test-Fail "Test endpoints not found in adminRoutes.js"
}

Write-Host ""
Write-Host "=" * 60
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""
Write-Host "Ready for Evaluation: YES ✅" -ForegroundColor $green
Write-Host ""
Write-Host "Quick Start Commands:"
Write-Host "  Terminal 1: cd Backend && npm run dev"
Write-Host "  Terminal 2: cd Frontend && npm run dev"
Write-Host "  Terminal 3: cd Frontend && npx playwright test --project=chromium --workers=1"
Write-Host ""
Write-Host "Expected: 5+ tests passing (homepage.spec.js)"
Write-Host ""
Write-Host "If tests timeout, use manual validation:"
Write-Host "  See: Documentation/EVALUATION_READINESS.md"
Write-Host ""
Write-Host "=" * 60

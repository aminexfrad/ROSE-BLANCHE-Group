#!/usr/bin/env powershell

<#
.SYNOPSIS
    Test script for the interview workflow with tuteur selection
.DESCRIPTION
    This script starts both backend and frontend servers and provides testing instructions
#>

Write-Host "🚀 Starting Interview Workflow Test Environment" -ForegroundColor Green
Write-Host "=" * 60

# Function to test if port is available
function Test-Port {
    param($Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Check if backend is running
Write-Host "`n🔍 Checking if servers are running..." -ForegroundColor Yellow

if (Test-Port 8000) {
    Write-Host "✅ Backend server is already running on port 8000" -ForegroundColor Green
} else {
    Write-Host "❌ Backend server is not running on port 8000" -ForegroundColor Red
    Write-Host "📝 To start backend server:" -ForegroundColor Yellow
    Write-Host "   cd backend/gateway" -ForegroundColor Cyan
    Write-Host "   python manage.py runserver" -ForegroundColor Cyan
}

if (Test-Port 3000) {
    Write-Host "✅ Frontend server is already running on port 3000" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend server is not running on port 3000" -ForegroundColor Red
    Write-Host "📝 To start frontend server:" -ForegroundColor Yellow
    Write-Host "   cd frontend" -ForegroundColor Cyan
    Write-Host "   npm run dev" -ForegroundColor Cyan
}

Write-Host "`n🧪 Testing Instructions" -ForegroundColor Green
Write-Host "=" * 30

Write-Host "`n1. 🔐 Login as RH User:" -ForegroundColor Yellow
Write-Host "   - Navigate to: http://localhost:3000/login" -ForegroundColor Cyan
Write-Host "   - Login with RH credentials" -ForegroundColor Cyan

Write-Host "`n2. 📋 Navigate to Demandes:" -ForegroundColor Yellow
Write-Host "   - Go to: http://localhost:3000/rh/demandes" -ForegroundColor Cyan
Write-Host "   - Find a pending demande" -ForegroundColor Cyan

Write-Host "`n3. 🎯 Test Interview Proposal:" -ForegroundColor Yellow
Write-Host "   - Click 'Proposer entretien' button" -ForegroundColor Cyan
Write-Host "   - ✅ Check: Tuteur dropdown is populated" -ForegroundColor Green
Write-Host "   - ✅ Check: Availability status shows (Available/Busy/Full)" -ForegroundColor Green
Write-Host "   - ✅ Check: Workload shows (X/5 stagiaires)" -ForegroundColor Green
Write-Host "   - Select a tuteur, enter date/time/location" -ForegroundColor Cyan
Write-Host "   - Click 'Proposer'" -ForegroundColor Cyan

Write-Host "`n4. 👨‍🏫 Login as Tuteur:" -ForegroundColor Yellow
Write-Host "   - Navigate to: http://localhost:3000/login" -ForegroundColor Cyan
Write-Host "   - Login with tuteur credentials" -ForegroundColor Cyan
Write-Host "   - Go to: http://localhost:3000/tuteur/evaluations" -ForegroundColor Cyan

Write-Host "`n5. ✅ Test Tuteur Response:" -ForegroundColor Yellow
Write-Host "   - Find pending interview request" -ForegroundColor Cyan
Write-Host "   - Click 'Répondre' button" -ForegroundColor Cyan
Write-Host "   - Test 'Accepter' option" -ForegroundColor Cyan
Write-Host "   - Test 'Proposer un autre créneau' option" -ForegroundColor Cyan

Write-Host "`n6. 🔄 Test RH Response to Proposal:" -ForegroundColor Yellow
Write-Host "   - Login back as RH" -ForegroundColor Cyan
Write-Host "   - Find interview with 'Révision demandée' status" -ForegroundColor Cyan
Write-Host "   - Click 'Répondre' button" -ForegroundColor Cyan
Write-Host "   - Test 'Accepter' and 'Modifier' options" -ForegroundColor Cyan

Write-Host "`n📊 Success Criteria:" -ForegroundColor Green
Write-Host "   ✅ No console errors" -ForegroundColor Green
Write-Host "   ✅ All modals open/close correctly" -ForegroundColor Green
Write-Host "   ✅ Tuteur selection works" -ForegroundColor Green
Write-Host "   ✅ Status updates correctly" -ForegroundColor Green
Write-Host "   ✅ Notifications appear" -ForegroundColor Green
Write-Host "   ✅ Data refreshes after actions" -ForegroundColor Green

Write-Host "`n🐛 If you encounter issues:" -ForegroundColor Red
Write-Host "   1. Check browser console for errors" -ForegroundColor Yellow
Write-Host "   2. Check Network tab in browser dev tools" -ForegroundColor Yellow
Write-Host "   3. Verify both servers are running" -ForegroundColor Yellow
Write-Host "   4. Check that test users exist in the system" -ForegroundColor Yellow

Write-Host "`n📖 For detailed testing guide, see:" -ForegroundColor Blue
Write-Host "   frontend/test_frontend_workflow.md" -ForegroundColor Cyan

Write-Host "`n🎉 Happy Testing!" -ForegroundColor Green

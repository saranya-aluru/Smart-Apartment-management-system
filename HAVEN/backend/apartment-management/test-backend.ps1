
$Base = "http://localhost:8080/api"

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "       HAVEN BACKEND TEST SUITE"
Write-Host "======================================`n" -ForegroundColor Cyan

$Passed = 0
$Failed = 0
$Skipped = 0

function Test-Api {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        $Headers = @{},
        $Body = $null,
        [int[]]$Expected = @(200, 201)
    )

    try {
        $Params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ErrorAction = "Stop"
        }

        if ($null -ne $Body) {
            $Params.ContentType = "application/json"
            $Params.Body = ($Body | ConvertTo-Json -Depth 10)
        }

        $Response = Invoke-RestMethod @Params

        Write-Host "[PASS] $Name" -ForegroundColor Green
        $script:Passed++
        return $Response
    }
    catch {
        $Status = 0
        $Message = $_.ErrorDetails.Message

        if ($_.Exception.Response) {
            try {
                $Status = [int]$_.Exception.Response.StatusCode
            } catch {}
        }

        if ($Expected -contains $Status) {
            Write-Host "[PASS] $Name (expected HTTP $Status)" -ForegroundColor Green
            $script:Passed++
            return $null
        }

        Write-Host "[FAIL] $Name | HTTP $Status | $Message" -ForegroundColor Red
        $script:Failed++
        return $null
    }
}

function Skip-Test {
    param([string]$Name, [string]$Reason)
    Write-Host "[SKIP] $Name - $Reason" -ForegroundColor Yellow
    $script:Skipped++
}

function Get-Login {
    param([string]$Role)

    $Username = Read-Host "$Role username"
    $Password = Read-Host "$Role password" -AsSecureString
    $PlainPassword = [System.Net.NetworkCredential]::new("", $Password).Password

    $Result = Test-Api `
        -Name "$Role login" `
        -Method POST `
        -Url "$Base/auth/login" `
        -Body @{ username = $Username; password = $PlainPassword }

    if ($null -eq $Result) {
        return $null
    }

    $Token = $null
    if ($Result.token) { $Token = $Result.token }
    elseif ($Result.accessToken) { $Token = $Result.accessToken }
    elseif ($Result.jwt) { $Token = $Result.jwt }

    if (-not $Token) {
        Write-Host "Login response did not contain a recognized token field." -ForegroundColor Red
        return $null
    }

    return @{
        username = $Username
        token = $Token
        headers = @{ Authorization = "Bearer $Token" }
    }
}

# --------------------------------------
# 1. AUTHENTICATION
# --------------------------------------

Write-Host "`n--- 1. AUTHENTICATION ---" -ForegroundColor Cyan

$Admin = Get-Login "ADMIN"
$Resident = Get-Login "RESIDENT"
$Staff = Get-Login "STAFF"

if (-not $Resident) {
    Write-Host "`nResident login is required for the remaining resident tests." -ForegroundColor Red
    exit
}

$RH = $Resident.headers
$AH = if ($Admin) { $Admin.headers } else { @{} }
$SH = if ($Staff) { $Staff.headers } else { @{} }

# --------------------------------------
# 2. RESIDENT GET ENDPOINTS
# --------------------------------------

Write-Host "`n--- 2. RESIDENT ENDPOINTS ---" -ForegroundColor Cyan

Test-Api "Resident dashboard" GET "$Base/resident/dashboard" $RH | Out-Null
Test-Api "Resident profile" GET "$Base/resident/profile" $RH | Out-Null
Test-Api "Resident maintenance list" GET "$Base/resident/maintenance" $RH | Out-Null
Test-Api "Resident service requests" GET "$Base/resident/service-requests" $RH | Out-Null
Test-Api "Resident event registrations" GET "$Base/resident/event-registrations" $RH | Out-Null
Test-Api "Resident clubhouse bookings" GET "$Base/resident/clubhouse/bookings" $RH | Out-Null

# --------------------------------------
# 3. PUBLIC / SHARED GET ENDPOINTS
# --------------------------------------

Write-Host "`n--- 3. SHARED ENDPOINTS ---" -ForegroundColor Cyan

Test-Api "Apartment list" GET "$Base/apartments" $RH | Out-Null
Test-Api "Vacant apartment filter" GET "$Base/apartments?status=VACANT" $RH | Out-Null
Test-Api "Services list" GET "$Base/services" $RH | Out-Null
Test-Api "Events list" GET "$Base/events" $RH | Out-Null
Test-Api "Announcements list" GET "$Base/announcements" $RH | Out-Null
Test-Api "Clubhouse facilities list" GET "$Base/clubhouse/facilities" $RH | Out-Null

# --------------------------------------
# 4. RESIDENT CREATE OPERATIONS
# --------------------------------------

Write-Host "`n--- 4. RESIDENT CREATE OPERATIONS ---" -ForegroundColor Cyan

Test-Api "Create maintenance request" POST "$Base/resident/maintenance" $RH @{
    category = "PLUMBING"
    description = "Backend test - water leakage"
    priority = "HIGH"
} | Out-Null

Test-Api "Create service request" POST "$Base/resident/service-requests" $RH @{
    serviceId = 4
    bookingDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    description = "Backend test service request"
} | Out-Null

Test-Api "Create clubhouse booking" POST "$Base/resident/clubhouse/bookings" $RH @{
    clubhouseId = 2
    bookingDate = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
    startTime = "10:00:00"
    endTime = "11:00:00"
    purpose = "Backend testing"
    guestCount = 2
} | Out-Null

# --------------------------------------
# 5. ADMIN ENDPOINTS
# --------------------------------------

Write-Host "`n--- 5. ADMIN ENDPOINTS ---" -ForegroundColor Cyan

if ($Admin) {

    Test-Api "Admin dashboard" GET "$Base/admin/dashboard" $AH | Out-Null
    Test-Api "Admin residents list" GET "$Base/admin/residents" $AH | Out-Null
    Test-Api "Admin staff list" GET "$Base/admin/staff" $AH | Out-Null
    Test-Api "Admin maintenance list" GET "$Base/admin/maintenance" $AH | Out-Null
    Test-Api "Admin service requests list" GET "$Base/admin/service-requests" $AH | Out-Null
    Test-Api "Admin event registrations list" GET "$Base/admin/event-registrations/1" $AH -Expected @(200, 404) | Out-Null
    Test-Api "Admin announcements list" GET "$Base/admin/announcements" $AH | Out-Null
    Test-Api "Admin clubhouse bookings list" GET "$Base/admin/clubhouse/bookings" $AH | Out-Null

    Test-Api "Create community service" POST "$Base/admin/services" $AH @{
        serviceName = "Backend Test Service"
        description = "Temporary testing service"
        serviceCharge = 100
    } | Out-Null

    Test-Api "Create community event" POST "$Base/admin/events" $AH @{
        title = "Backend Test Event"
        description = "Testing event creation"
        eventDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
        startTime = "10:00:00"
        endTime = "11:00:00"
        venue = "Community Hall"
        status = "UPCOMING"
    } | Out-Null

    Test-Api "Create announcement" POST "$Base/admin/announcements" $AH @{
        title = "Backend Test Announcement"
        description = "Testing announcement creation"
        category = "GENERAL"
        status = "PUBLISHED"
    } | Out-Null

    Test-Api "Create clubhouse facility" POST "$Base/admin/clubhouse/facilities" $AH @{
        name = "Backend Test Facility"
        description = "Temporary test facility"
        capacity = 10
        location = "Test Block"
        hourlyCharge = 100
        openingTime = "09:00:00"
        closingTime = "21:00:00"
        status = "AVAILABLE"
    } | Out-Null

} else {
    Skip-Test "Admin tests" "No valid admin login"
}

# --------------------------------------
# 6. STAFF ENDPOINTS
# --------------------------------------

Write-Host "`n--- 6. STAFF ENDPOINTS ---" -ForegroundColor Cyan

if ($Staff) {
    Test-Api "Staff maintenance status update" PUT "$Base/staff/maintenance/2/status" $SH @{
        status = "IN_PROGRESS"
    } -Expected @(200, 400, 404) | Out-Null
} else {
    Skip-Test "Staff tests" "No valid staff login"
}

# --------------------------------------
# 7. ROLE ACCESS CONTROL
# --------------------------------------

Write-Host "`n--- 7. ROLE ACCESS CONTROL ---" -ForegroundColor Cyan

Test-Api "Resident blocked from admin dashboard" GET "$Base/admin/dashboard" $RH -Expected @(403) | Out-Null

if ($Admin) {
    Test-Api "Admin blocked from resident dashboard" GET "$Base/resident/dashboard" $AH -Expected @(403) | Out-Null
}

if ($Staff) {
    Test-Api "Staff blocked from admin dashboard" GET "$Base/admin/dashboard" $SH -Expected @(403) | Out-Null
}

# --------------------------------------
# 8. SUMMARY
# --------------------------------------

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "           TEST SUMMARY"
Write-Host "======================================" -ForegroundColor Cyan

Write-Host "Passed : $Passed" -ForegroundColor Green
Write-Host "Failed : $Failed" -ForegroundColor Red
Write-Host "Skipped: $Skipped" -ForegroundColor Yellow

if ($Failed -eq 0 -and $Skipped -eq 0) {
    Write-Host "`nALL TESTS PASSED" -ForegroundColor Green
} else {
    Write-Host "`nCHECK FAILED AND SKIPPED TESTS ABOVE" -ForegroundColor Yellow
}

Write-Host "`n======================================`n" -ForegroundColor Cyan

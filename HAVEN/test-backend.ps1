
# ==========================================================
# HAVEN - COMPLETE BACKEND TEST SUITE
# ==========================================================

$Base = "http://localhost:8080/api"

$script:Passed = 0
$script:Failed = 0
$script:Skipped = 0

$script:Results = [System.Collections.Generic.List[object]]::new()

# ==========================================================
# RESULT HANDLER
# ==========================================================

function Add-Result {
    param(
        [string]$Name,
        [string]$Status,
        [string]$Details
    )

    $script:Results.Add([PSCustomObject]@{
        Test = $Name
        Status = $Status
        Details = $Details
    })

    switch ($Status) {
        "PASS" {
            $script:Passed++
            Write-Host "[PASS] $Name" -ForegroundColor Green
        }
        "FAIL" {
            $script:Failed++
            Write-Host "[FAIL] $Name - $Details" -ForegroundColor Red
        }
        "SKIP" {
            $script:Skipped++
            Write-Host "[SKIP] $Name - $Details" -ForegroundColor Yellow
        }
    }
}

# ==========================================================
# API REQUEST FUNCTION
# ==========================================================

function Invoke-Test {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        $Body = $null,
        [int[]]$Expected = @(200, 201)
    )

    try {
        $Params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ErrorAction = "Stop"
            TimeoutSec = 20
        }

        if ($null -ne $Body) {
            $Params.ContentType = "application/json"
            $Params.Body = ConvertTo-Json -InputObject $Body -Depth 10
        }

        $Response = Invoke-RestMethod @Params

        Add-Result $Name "PASS" "Request successful"
        return $Response
    }
    catch {
        $StatusCode = 0
        $Message = $_.Exception.Message

        if ($_.Exception.Response) {
            try {
                $StatusCode = [int]$_.Exception.Response.StatusCode
            }
            catch {}
        }

        if ($_.ErrorDetails.Message) {
            $Message = $_.ErrorDetails.Message
        }

        if ($Expected -contains $StatusCode) {
            Add-Result $Name "PASS" "Expected HTTP $StatusCode"
        }
        else {
            Add-Result $Name "FAIL" "HTTP $StatusCode - $Message"
        }

        return $null
    }
}

# ==========================================================
# LOGIN FUNCTION
# ==========================================================

function Get-UserLogin {
    param([string]$Role)

    Write-Host "`nEnter $Role credentials" -ForegroundColor Cyan

    $Username = Read-Host "Username"
    $SecurePassword = Read-Host "Password" -AsSecureString

    $Password = [System.Net.NetworkCredential]::new(
        "",
        $SecurePassword
    ).Password

    $Response = Invoke-Test `
        -Name "$Role login" `
        -Method POST `
        -Url "$Base/auth/login" `
        -Body @{
            username = $Username
            password = $Password
        }

    if ($null -eq $Response) {
        return $null
    }

    $Token = $Response.token

    if (-not $Token) {
        $Token = $Response.accessToken
    }

    if (-not $Token) {
        $Token = $Response.jwt
    }

    if (-not $Token) {
        Add-Result "$Role JWT token" "FAIL" "No token in login response"
        return $null
    }

    return @{
        Username = $Username
        Headers = @{
            Authorization = "Bearer $Token"
        }
    }
}

# ==========================================================
# CHECK BACKEND CONNECTION
# ==========================================================

Clear-Host

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "            HAVEN BACKEND TEST SUITE" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`nChecking Spring Boot server..." -ForegroundColor Cyan

$ServerRunning = Test-NetConnection `
    -ComputerName localhost `
    -Port 8080 `
    -InformationLevel Quiet

if (-not $ServerRunning) {
    Write-Host "`nBackend is not reachable on port 8080." -ForegroundColor Red
    Write-Host "Start Spring Boot using:" -ForegroundColor Yellow
    Write-Host ".\mvnw.cmd spring-boot:run"
    exit
}

Write-Host "Backend is reachable on port 8080." -ForegroundColor Green

# ==========================================================
# 1. AUTHENTICATION
# ==========================================================

Write-Host "`n--- 1. AUTHENTICATION ---" -ForegroundColor Cyan

$Resident = Get-UserLogin "RESIDENT"
$Admin = Get-UserLogin "ADMIN"
$Staff = Get-UserLogin "STAFF"

if (-not $Resident) {
    Write-Host "`nResident login failed. Cannot continue." -ForegroundColor Red
    exit
}

$RH = $Resident.Headers

# ==========================================================
# 2. RESIDENT DASHBOARD AND PROFILE
# ==========================================================

Write-Host "`n--- 2. RESIDENT MODULE ---" -ForegroundColor Cyan

$Dashboard = Invoke-Test `
    "Resident dashboard" GET "$Base/resident/dashboard" $RH

Invoke-Test "Resident profile" GET "$Base/resident/profile" $RH | Out-Null

Invoke-Test "Resident maintenance list" GET "$Base/resident/maintenance" $RH | Out-Null

Invoke-Test "Resident service requests" GET "$Base/resident/service-requests" $RH | Out-Null

Invoke-Test "Resident event registrations" GET "$Base/resident/event-registrations" $RH | Out-Null

Invoke-Test "Resident clubhouse bookings" GET "$Base/resident/clubhouse/bookings" $RH | Out-Null

# ==========================================================
# 3. APARTMENTS AND SHARED MODULES
# ==========================================================

Write-Host "`n--- 3. APARTMENTS AND SHARED MODULES ---" -ForegroundColor Cyan

$Apartments = Invoke-Test "Apartment list" GET "$Base/apartments" $RH

Invoke-Test "Vacant apartment filter" GET "$Base/apartments?status=VACANT" $RH | Out-Null

$Services = Invoke-Test "Community services" GET "$Base/services" $RH

$Events = Invoke-Test "Community events" GET "$Base/events" $RH

$Announcements = Invoke-Test "Announcements" GET "$Base/announcements" $RH

$Facilities = Invoke-Test "Clubhouse facilities" GET "$Base/clubhouse/facilities" $RH

Invoke-Test "Registration vacant apartments" GET "$Base/auth/apartments" @{} | Out-Null

# ==========================================================
# 4. RESIDENT CREATE OPERATIONS
# ==========================================================

Write-Host "`n--- 4. RESIDENT CREATE OPERATIONS ---" -ForegroundColor Cyan

Invoke-Test "Create maintenance request" POST "$Base/resident/maintenance" $RH @{
    category = "PLUMBING"
    description = "HAVEN test - water leakage"
    priority = "HIGH"
} | Out-Null

# Service request

if ($Services -and $Services.Count -gt 0) {

    $Service = $Services | Select-Object -First 1

    if ($Service.service_id) {

        Invoke-Test "Create service request" POST "$Base/resident/service-requests" $RH @{
            serviceId = [long]$Service.service_id
            bookingDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
            description = "HAVEN test service request"
        } | Out-Null

    }
    else {
        Add-Result "Create service request" "SKIP" "Service ID unavailable"
    }

}
else {
    Add-Result "Create service request" "SKIP" "No services found"
}

# Clubhouse booking

if ($Facilities -and $Facilities.Count -gt 0) {

    $Facility = $Facilities | Select-Object -First 1

    if ($Facility.clubhouse_id) {

        Invoke-Test "Create clubhouse booking" POST "$Base/resident/clubhouse/bookings" $RH @{
            clubhouseId = [long]$Facility.clubhouse_id
            bookingDate = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
            startTime = "10:00:00"
            endTime = "11:00:00"
            purpose = "HAVEN test booking"
            guestCount = 2
        } | Out-Null

    }
    else {
        Add-Result "Create clubhouse booking" "SKIP" "Facility ID unavailable"
    }

}
else {
    Add-Result "Create clubhouse booking" "SKIP" "No facilities found"
}

# ==========================================================
# 5. ADMIN MODULE
# ==========================================================

Write-Host "`n--- 5. ADMIN MODULE ---" -ForegroundColor Cyan

if ($Admin) {

    $AH = $Admin.Headers

    Invoke-Test "Admin dashboard" GET "$Base/admin/dashboard" $AH | Out-Null

    Invoke-Test "Admin residents" GET "$Base/admin/residents" $AH | Out-Null

    Invoke-Test "Admin staff" GET "$Base/admin/staff" $AH | Out-Null

    Invoke-Test "Admin maintenance" GET "$Base/admin/maintenance" $AH | Out-Null

    Invoke-Test "Admin service requests" GET "$Base/admin/service-requests" $AH | Out-Null

    Invoke-Test "Admin announcements" GET "$Base/admin/announcements" $AH | Out-Null

    Invoke-Test "Admin clubhouse bookings" GET "$Base/admin/clubhouse/bookings" $AH | Out-Null

    # Create service

    Invoke-Test "Create community service" POST "$Base/admin/services" $AH @{
        serviceName = "HAVEN Test Service"
        description = "Temporary test service"
        serviceCharge = 100
    } | Out-Null

    # Create event

    Invoke-Test "Create community event" POST "$Base/admin/events" $AH @{
        title = "HAVEN Test Event"
        description = "Testing event creation"
        eventDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
        startTime = "10:00:00"
        endTime = "11:00:00"
        venue = "Community Hall"
    } | Out-Null

    # Create announcement

    Invoke-Test "Create announcement" POST "$Base/admin/announcements" $AH @{
        title = "HAVEN Test Announcement"
        description = "Testing announcement creation"
        category = "GENERAL"
    } | Out-Null

    # Create facility

    Invoke-Test "Create clubhouse facility" POST "$Base/admin/clubhouse/facilities" $AH @{
        name = "HAVEN Test Facility"
        description = "Temporary test facility"
        capacity = 10
        location = "Test Block"
        hourlyCharge = 100
        openingTime = "09:00:00"
        closingTime = "21:00:00"
    } | Out-Null

}
else {
    Add-Result "Admin tests" "SKIP" "Admin login unavailable"
}

# ==========================================================
# 6. STAFF MODULE
# ==========================================================

Write-Host "`n--- 6. STAFF MODULE ---" -ForegroundColor Cyan

if ($Staff) {

    $SH = $Staff.Headers

    Invoke-Test "Staff maintenance update" PUT "$Base/staff/maintenance/2/status" $SH @{
        status = "IN_PROGRESS"
    } | Out-Null

}
else {
    Add-Result "Staff tests" "SKIP" "Staff login unavailable"
}

# ==========================================================
# 7. ROLE ACCESS CONTROL
# ==========================================================

Write-Host "`n--- 7. ROLE ACCESS CONTROL ---" -ForegroundColor Cyan

Invoke-Test `
    "Resident blocked from admin dashboard" `
    GET "$Base/admin/dashboard" `
    $RH `
    $null `
    @(403) | Out-Null

if ($Admin) {

    Invoke-Test `
        "Admin blocked from resident dashboard" `
        GET "$Base/resident/dashboard" `
        $Admin.Headers `
        $null `
        @(403) | Out-Null

}

if ($Staff) {

    Invoke-Test `
        "Staff blocked from admin dashboard" `
        GET "$Base/admin/dashboard" `
        $Staff.Headers `
        $null `
        @(403) | Out-Null

}

# ==========================================================
# 8. FINAL REPORT
# ==========================================================

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "                  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`nPASSED  : $Passed" -ForegroundColor Green
Write-Host "FAILED  : $Failed" -ForegroundColor Red
Write-Host "SKIPPED : $Skipped" -ForegroundColor Yellow

Write-Host "`n---------------- DETAILED RESULTS ----------------" -ForegroundColor Cyan

$Results | Format-Table -AutoSize -Wrap

if ($Failed -eq 0 -and $Skipped -eq 0) {
    Write-Host "`nALL TESTS PASSED!" -ForegroundColor Green
}
else {
    Write-Host "`nSOME TESTS NEED ATTENTION." -ForegroundColor Yellow
}

Write-Host "`n==================================================" -ForegroundColor Cyan

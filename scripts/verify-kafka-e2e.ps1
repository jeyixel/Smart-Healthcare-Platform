$ErrorActionPreference = 'Stop'

function Get-ConsumedEvents {
  $response = Invoke-RestMethod -Method Get -Uri 'http://localhost:8081/api/v1/patient-events'
  if ($null -eq $response) {
    return @()
  }
  if ($response.PSObject.Properties.Name -contains 'value') {
    return @($response.value)
  }
  return @($response)
}

$initial = Get-ConsumedEvents
Write-Output "initial_count=$($initial.Count)"

$patientEmail = 'kafka.tester.' + [guid]::NewGuid().ToString('N') + '@example.com'
$patient = Invoke-RestMethod -Method Post -Uri 'http://localhost:8081/api/v1/patients' -ContentType 'application/json' -Body (@{
  firstName = 'Kafka'
  lastName = 'Tester'
  email = $patientEmail
  authUserId = $null
  phoneNumber = '1234567890'
  dateOfBirth = '1990-01-01'
  gender = 'OTHER'
  bloodGroup = 'O+'
  address = 'Test Address'
  emergencyContactName = 'Emergency'
  emergencyContactPhone = '0987654321'
} | ConvertTo-Json)
Write-Output "patient_id=$($patient.id)"

$adminEmail = 'admin.' + [guid]::NewGuid().ToString('N') + '@example.com'
$adminPassword = 'Admin123!'
Invoke-RestMethod -Method Post -Uri 'http://localhost:8087/api/v1/auth/register' -ContentType 'application/json' -Body (@{
  email = $adminEmail
  password = $adminPassword
  firstName = 'Admin'
  lastName = 'Tester'
  role = 'ADMIN'
} | ConvertTo-Json) | Out-Null

$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:8087/api/v1/auth/login' -ContentType 'application/json' -Body (@{
  email = $adminEmail
  password = $adminPassword
} | ConvertTo-Json)
Write-Output "admin_email=$adminEmail"

$headers = @{
  Authorization = 'Bearer ' + $login.token
  'X-Admin-User' = 'admin.tester@example.com'
}

$adminResult = Invoke-RestMethod -Method Patch -Uri ("http://localhost:8087/api/v1/admin/patients/{0}/status?active=true" -f $patient.id) -Headers $headers
Write-Output "admin_updated_active=$($adminResult.active)"

$after = @()
$newEvent = $null
$maxAttempts = 10
for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
  $after = Get-ConsumedEvents
    $newEvent = $after | Where-Object { $_.patientId -eq $patient.id } | Select-Object -First 1
    if ($null -ne $newEvent) {
        break
    }
}

Write-Output "after_count=$($after.Count)"

if ($null -eq $newEvent) {
  throw "No consumed event found for patientId=$($patient.id)"
}

Write-Output "event_patient_id=$($newEvent.patientId)"
Write-Output "event_type=$($newEvent.eventType)"
Write-Output "event_status=$($newEvent.status)"

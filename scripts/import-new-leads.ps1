$ErrorActionPreference = "Stop"
$env:NODE_OPTIONS = "--dns-result-order=ipv4first"
$leads = "C:\Shakeel\Redirect\techinhtml.netlify.app\Techin\Leads"
$root = "C:\Shakeel\Redirect\techinhtml.netlify.app\Techin\axenflow-ai"

$files = @(
  @{ File = "Pharmacy.csv"; Category = "Pharmacies" },
  @{ File = "Hospital.csv"; Category = "Hospitals" },
  @{ File = "Optometrist.csv"; Category = "Optometrists" },
  @{ File = "Eye_Clinic.csv"; Category = "Eye Clinics" },
  @{ File = "Dermatologist.csv"; Category = "Dermatologists" },
  @{ File = "Chiropractor.csv"; Category = "Chiropractors" },
  @{ File = "Physical_Therapy.csv"; Category = "Physical Therapy" },
  @{ File = "Psychologist.csv"; Category = "Psychologists" },
  @{ File = "Mental_Health_Clinic.csv"; Category = "Mental Health Clinics" },
  @{ File = "Veterinary_Clinic.csv"; Category = "Veterinary Clinics" }
)

Set-Location $root
foreach ($item in $files) {
  $path = Join-Path $leads $item.File
  Write-Host "`n=== Importing $($item.File) as $($item.Category) ===" -ForegroundColor Cyan
  npx tsx scripts/import-csv-fast.ts $path $item.Category
  if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: $($item.File)" -ForegroundColor Red
    exit $LASTEXITCODE
  }
}
Write-Host "`nAll imports finished." -ForegroundColor Green

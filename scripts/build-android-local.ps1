param(
    [switch]$NonProduction,
    [string]$KeystorePath,
    [string]$PublicCertificatePath,
    [string]$ExpectedCertificateSha256
)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$projectRoot = (Get-Location).Path
if (!$env:JAVA_HOME -or !(Test-Path "$env:JAVA_HOME/bin/java.exe")) { throw 'Set JAVA_HOME to a compatible JDK (JDK 21 validated for this project).' }
if (!$env:ANDROID_HOME -or !(Test-Path "$env:ANDROID_HOME/platforms/android-36")) { throw 'Set ANDROID_HOME to the Android SDK containing platform 36.' }
if (!$NonProduction -and (!$KeystorePath -or !$PublicCertificatePath -or !$ExpectedCertificateSha256)) {
    throw 'Production requires -KeystorePath, -PublicCertificatePath and -ExpectedCertificateSha256. Passwords are requested interactively.'
}
$env:EXPO_PUBLIC_API_URL = 'https://api.nexorainterview.io.vn/api/v1'
$env:EXPO_PUBLIC_ENV = 'production'
$env:NODE_ENV = 'production'
if (!$env:GRADLE_USER_HOME) { $env:GRADLE_USER_HOME = Join-Path $projectRoot '.local-build/gradle' }
$localBuild = Join-Path $projectRoot '.local-build'
$buildTemp = Join-Path $localBuild 'tmp'
New-Item $buildTemp -ItemType Directory -Force | Out-Null
$env:TEMP = $buildTemp
$env:TMP = $buildTemp
$env:CMAKE_BUILD_PARALLEL_LEVEL = '2'
$prebuildLog = Join-Path $localBuild 'android-prebuild.log'
$gradleLog = Join-Path $localBuild 'android-release-build.log'
$statusPath = Join-Path $localBuild 'android-build-status.json'
$signingInput = $null
$env:NEXORA_SIGNING_PROPERTIES = $null
$env:NEXORA_ALLOW_DEBUG_RELEASE = $null
try {
    if ($NonProduction) {
        $env:NEXORA_ALLOW_DEBUG_RELEASE = '1'
        Write-Warning 'Explicit debug signing for validation only. NOT FOR GOOGLE PLAY.'
    } else {
        $keyFullPath = [IO.Path]::GetFullPath($KeystorePath)
        if ($keyFullPath.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
            throw 'Private signing material must be outside the repository.'
        }
        $candidateInput = Join-Path (Split-Path $keyFullPath -Parent) '.nexora-upload-build.properties'
        if (Test-Path $candidateInput) { throw 'A signing input already exists; refusing overwrite. Check for another active build.' }
        $signingInput = $candidateInput
        # Operator types directly into Java Console; do not redirect this call.
        try {
            $ErrorActionPreference = 'Continue'
            & "$env:JAVA_HOME/bin/java.exe" (Join-Path $PSScriptRoot 'PrepareAndroidSigning.java') $keyFullPath $PublicCertificatePath $signingInput $ExpectedCertificateSha256
            $signingExit = $LASTEXITCODE
        } finally { $ErrorActionPreference = 'Stop' }
        if ($signingExit -ne 0) { throw 'Upload key validation failed.' }
        $env:NEXORA_SIGNING_PROPERTIES = $signingInput
    }
    @{ status = 'building'; log = $gradleLog } | ConvertTo-Json | Set-Content $statusPath
    $packagePath = Join-Path $projectRoot 'package.json'
    $packageBefore = [IO.File]::ReadAllBytes($packagePath)
    try {
        # Windows PowerShell treats native stderr warnings as errors with Stop.
        # The process exit code, not the presence of a warning, determines failure.
        $ErrorActionPreference = 'Continue'
        & npx.cmd expo prebuild --platform android --no-install *> $prebuildLog
        $prebuildExit = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = 'Stop'
        [IO.File]::WriteAllBytes($packagePath, $packageBefore)
    }
    if ($prebuildExit -ne 0) { throw "Expo prebuild failed. See $prebuildLog" }
    Set-Content android/local.properties ('sdk.dir=' + $env:ANDROID_HOME.Replace('\', '/'))
    Write-Host "Building locally. Log: $gradleLog"
    Push-Location android
    try {
        $ErrorActionPreference = 'Continue'
        & ./gradlew.bat :app:bundleRelease --no-daemon --console=plain --stacktrace --max-workers=1 *> $gradleLog
        $gradleExit = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = 'Stop'
        Pop-Location
    }
    if ($gradleExit -ne 0) { throw "Gradle bundleRelease failed. See $gradleLog" }
    $bundle = Join-Path $projectRoot 'android/app/build/outputs/bundle/release/app-release.aab'
    if (!(Test-Path $bundle)) { throw 'Gradle returned success without an AAB.' }
    @{ status = 'built_requires_binary_verification'; artifact = $bundle; nonProduction = [bool]$NonProduction } | ConvertTo-Json | Set-Content $statusPath
    Write-Host "AAB built; independent verification required: $bundle"
} catch {
    @{ status = 'failed'; error = $_.Exception.Message; log = $gradleLog } | ConvertTo-Json | Set-Content $statusPath
    throw
} finally {
    $env:NEXORA_SIGNING_PROPERTIES = $null
    $env:NEXORA_ALLOW_DEBUG_RELEASE = $null
    if ($signingInput -and (Test-Path $signingInput)) { Remove-Item -LiteralPath $signingInput -Force }
}

Param(
  [string]$ProjectDir = "C:\Users\SUBHAM\OneDrive\Desktop\MGPS",
  [string]$MavenCmd = "mvn",
  [string]$WithOjdbc = "true",
  [string]$TomcatWebapps = "C:\\Program Files\\Apache Software Foundation\\Tomcat 9.0\\webapps",
  [string]$TomcatServiceName = "",    # optional: Tomcat service name to stop/start
  [switch]$RestartService
)

Write-Host "Building project..." -ForegroundColor Cyan
Push-Location $ProjectDir
try {
    $profileArg = ''
    if ($WithOjdbc -eq 'true') { $profileArg = '-Dwith.ojdbc=true' }
    & $MavenCmd clean package $profileArg
    if ($LASTEXITCODE -ne 0) { throw "Maven build failed (exit $LASTEXITCODE)" }

    # locate WAR
    $pom = Join-Path $ProjectDir 'pom.xml'
    if (-not (Test-Path $pom)) { throw "pom.xml not found in $ProjectDir" }
    $artifactId = (Select-String -Path $pom -Pattern '<artifactId>(.+?)</artifactId>' -AllMatches).Matches[0].Groups[1].Value
    $version = (Select-String -Path $pom -Pattern '<version>(.+?)</version>' -AllMatches).Matches[0].Groups[1].Value
    $warName = "$artifactId-$version.war"
    $warPath = Join-Path $ProjectDir "target\$warName"
    if (-not (Test-Path $warPath)) {
        # fallback: first .war in target
        $warFiles = Get-ChildItem -Path (Join-Path $ProjectDir 'target') -Filter *.war -ErrorAction SilentlyContinue
        if ($warFiles.Length -gt 0) { $warPath = $warFiles[0].FullName } else { throw "WAR not found in target directory." }
    }

    Write-Host "Found WAR: $warPath" -ForegroundColor Green

    if ($RestartService -and $TomcatServiceName) {
        Write-Host "Stopping Tomcat service $TomcatServiceName..." -ForegroundColor Yellow
        Stop-Service -Name $TomcatServiceName -ErrorAction Stop
    }

    $dest = Join-Path $TomcatWebapps (Split-Path $warPath -Leaf)
    Write-Host "Copying WAR to $dest" -ForegroundColor Cyan
    Copy-Item -Path $warPath -Destination $dest -Force

    if ($RestartService -and $TomcatServiceName) {
        Write-Host "Starting Tomcat service $TomcatServiceName..." -ForegroundColor Yellow
        Start-Service -Name $TomcatServiceName -ErrorAction Stop
    }

    Write-Host "Deployment complete. Check Tomcat manager or logs for application status." -ForegroundColor Green
} finally {
    Pop-Location
}

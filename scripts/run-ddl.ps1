Param(
  [string]$SqlplusPath = "sqlplus",
  [string]$SysConnect = "/ as sysdba",
  [string]$AppUser = "mgps_app",
  [string]$AppPass = "mgps_password",
  [string]$JdbcConnect = "//localhost:1521/XE",
  [string]$SqlFile = "C:\Users\SUBHAM\OneDrive\Desktop\MGPS\db\mgps_schema.sql"
)

Write-Host "This script will run the DDL. Ensure Oracle is running and sqlplus is available." -ForegroundColor Yellow

# Create user (will prompt for SYS if necessary) - only run if needed
Write-Host "Creating application user (if not exists) as SYS..."
$createUser = "CREATE USER $AppUser IDENTIFIED BY $AppPass; GRANT CONNECT, RESOURCE TO $AppUser;"

& $SqlplusPath $SysConnect <<<'SQL'
SET FEEDBACK OFF
WHENEVER SQLERROR EXIT FAILURE
$createUser
EXIT
SQL

Write-Host "Running DDL as $AppUser..."
& $SqlplusPath "$AppUser/$AppPass@$JdbcConnect" "@$SqlFile"

Write-Host "Done. Verify tables with: SELECT table_name FROM user_tables;" -ForegroundColor Green

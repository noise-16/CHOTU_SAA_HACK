@echo off
title CareWell Hospital Portal - Local Server
cd /d "%~dp0"
echo ========================================================
echo   Launching CareWell Hospital Portal (Localhost Server)
echo   Local URL: http://localhost:3000/
echo ========================================================

rem Auto-open browser
start http://localhost:3000/

rem Check if Heckheck directory exists or if we are already inside it
if exist "%~dp0Heckheck\index.html" (
    set "SERVE_DIR=%~dp0Heckheck"
) else (
    set "SERVE_DIR=%~dp0"
)

rem Try launching with Python built-in HTTP server
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Starting Python HTTP server on port 3000...
    python -m http.server 3000 --directory "%SERVE_DIR%"
    goto :eof
)

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Starting Python (py launcher) HTTP server on port 3000...
    py -m http.server 3000 --directory "%SERVE_DIR%"
    goto :eof
)

rem Fallback to native Windows PowerShell HTTP server
echo Starting PowerShell native HTTP server...
powershell -NoProfile -ExecutionPolicy Bypass -Command "& { $port = 3000; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:' + $port + '/'); $listener.Start(); Write-Host 'Server running at http://localhost:3000/'; while ($listener.IsListening) { $ctx = $listener.GetContext(); $req = $ctx.Request; $res = $ctx.Response; $rel = $req.Url.LocalPath.TrimStart('/'); if ([string]::IsNullOrEmpty($rel)) { $rel = 'index.html'; }; $f = Join-Path '%SERVE_DIR%' $rel; if (Test-Path $f -PathType Leaf) { $b = [System.IO.File]::ReadAllBytes($f); $ext = [System.IO.Path]::GetExtension($f).ToLower(); $m = switch ($ext) { '.html' {'text/html; charset=utf-8'} '.js' {'application/javascript; charset=utf-8'} '.css' {'text/css; charset=utf-8'} '.json' {'application/json'} '.svg' {'image/svg+xml'} '.png' {'image/png'} default {'application/octet-stream'} }; $res.ContentType = $m; $res.ContentLength64 = $b.Length; $res.OutputStream.Write($b, 0, $b.Length); } else { $res.StatusCode = 404; $err = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found'); $res.OutputStream.Write($err, 0, $err.Length); }; $res.Close(); } }"

pause

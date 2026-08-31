$endpoints = @(
    'http://localhost:3005/',
    'http://localhost:3005/unauthorized',
    'http://localhost:3005/dashboard',
    'http://localhost:3005/dashboard/student',
    'http://localhost:3005/api/health'
)

foreach ($url in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing
        Write-Host "$url : $($response.StatusCode)"
    } catch {
        Write-Host "$url : Error $($_.Exception.Message)"
    }
}

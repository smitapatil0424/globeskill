$urls = @(
    'https://globeskill.vercel.app',
    'https://globeskill-git-main-smitapatil0424s-projects.vercel.app'
)

foreach ($target in $urls) {
    try {
        $res = Invoke-WebRequest -Uri $target -UseBasicParsing -TimeoutSec 6
        Write-Host "$target -> $($res.StatusCode)"
    } catch {
        Write-Host "$target -> $($_.Exception.Message)"
    }
}

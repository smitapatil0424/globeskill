$res = Invoke-WebRequest -Uri 'http://localhost:3005/unauthorized' -UseBasicParsing
$html = $res.Content
Write-Host "Status Code: " $res.StatusCode
Write-Host "HTML Length: " $html.Length
Write-Host "Has GlobeSkill: " ($html -like "*GlobeSkill*")
Write-Host "Has AI & TECH: " ($html -like "*AI &amp; TECH EDUCATION*")
Write-Host "Has Demo Role: " ($html -like "*Demo Role*")
Write-Host "Has Courses: " ($html -like "*Courses*")
Write-Host "Has Support Us: " ($html -like "*Support Us*")
Write-Host "Has 80G Tax Exemption: " ($html -like "*80G Tax Exemption Registered*")
Write-Host "Has Ask AI Mentor: " ($html -like "*Ask AI Mentor*")
Write-Host "Has Loading gate: " ($html -like "*Loading security gate*")
Write-Host "Has SWITCH DEMO: " ($html -like "*SWITCH DEMO ROLE*")
Write-Host "Has Trainer Management: " ($html -like "*Trainer Management Hub*")


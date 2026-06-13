
$usuario = "jacinto-aisa"
$repositorio = "desaprendiendo-playwright-e2e-localfirst"
$rutaProyecto = "C:\LabGuiado07"

Set-Location $rutaProyecto

git init
git status

git add .

git commit -m "Iteración 08 - CI/CD aplicado al proyecto Playwright"

git branch -M main

$remoteUrl = "https://github.com/$usuario/$repositorio.git"

# Si ya existe origin, actualiza la URL. Si no existe, lo crea.
$originExiste = git remote get-url origin 2>$null

if ($LASTEXITCODE -eq 0) {
    git remote set-url origin $remoteUrl
} else {
    git remote add origin $remoteUrl
}

git remote -v

git push -u origin main

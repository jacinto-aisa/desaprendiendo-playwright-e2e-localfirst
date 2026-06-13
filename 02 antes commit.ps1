cd c:\
cd C:\LabGuiado07

git status

git check-ignore -v node_modules
git check-ignore -v playwright-report
git check-ignore -v test-results

git diff --cached --name-only

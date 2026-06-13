cd c:\
cd C:\LabGuiado07
npm pkg set 'scripts.lint=eslint \"**/*.{js,mjs,cjs,ts}\"'
npm pkg set 'scripts.lint:fix=eslint "**/*.{js,mjs,cjs,ts}" --fix'
npm pkg set 'scripts.lint:strict=eslint "**/*.{js,mjs,cjs,ts}" --max-warnings=0'
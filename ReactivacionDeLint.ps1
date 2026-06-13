cd c:\
cd C:\LabGuiado07
npm pkg set 'scripts.lint=eslint \"**/*.{js,mjs,cjs,ts}\"'
npm pkg set 'scripts.lint:fix=eslint "**/*.{js,mjs,cjs,ts}" --fix'
npm pkg set 'scripts.lint:strict=eslint "**/*.{js,mjs,cjs,ts}" --max-warnings=0'
npm pkg set 'scripts.lint:playwright=eslint ""tests/**/*.ts""'
npm pkg set 'scripts.lint:playwright:strict=eslint ""tests/**/*.ts"" --max-warnings=0'
npm pkg set 'scripts.quality:playwright=npm run lint:playwright'
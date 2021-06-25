rd /Q /S "../docs/js"
rd /Q /S "../docs/css"
del "../docs/index.html"
call npm run build
pause
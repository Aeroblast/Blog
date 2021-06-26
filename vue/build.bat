rd /Q /S "public/Text"
rd /Q /S "public/Index"
rd /Q /S "../docs/css"
del "../docs/index.html"
call npm run build
pause
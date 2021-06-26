rd /Q /S "public/Text"
rd /Q /S "public/Index"
rd /Q /S "../docs/css"
rd /Q /S "../docs/js"
del "../docs/index.html"
call npm run build
pause
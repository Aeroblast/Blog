rd /Q /S "public/Text"
rd /Q /S "public/Index"
rd /Q /S "public/Images"
rd /Q /S "../docs/css"
rd /Q /S "../docs/js"
rd /Q /S "../docs/assets"
del "../docs/index.html"
call npm run build
pause
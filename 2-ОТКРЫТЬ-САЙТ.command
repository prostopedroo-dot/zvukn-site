#!/bin/bash
# Открыть готовый сайт в браузере.
# Если сайт ещё не собран — соберётся сам и откроется.

cd "$(dirname "$0")" || exit 1
export PATH="$HOME/.local/node/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin"

if [ ! -f "_site/index.html" ]; then
  echo "Сайт ещё не собран — собираю…"
  if [ ! -d node_modules ]; then npm install >/dev/null 2>&1; fi
  npx eleventy >/dev/null 2>&1
fi

if [ -f "_site/index.html" ]; then
  open "_site/index.html"
  echo "Открыл главную страницу в браузере."
  echo "Остальные страницы — по ссылкам в меню."
  sleep 1
else
  echo "Не удалось собрать сайт. Запустите 1-СОБРАТЬ-САЙТ.command и посмотрите, что там написано."
  read -r -p "Нажмите Enter, чтобы закрыть…"
fi

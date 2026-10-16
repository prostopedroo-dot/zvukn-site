#!/bin/bash
# Собрать сайт «Звук N» после правок.
# Двойной клик по этому файлу — соберётся сайт в папке _site.

cd "$(dirname "$0")" || exit 1
export PATH="$HOME/.local/node/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Сборка сайта «Звук N»"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

if [ ! -d node_modules ]; then
  echo "Первый запуск: устанавливаю всё нужное (это займёт минуту)…"
  npm install || { echo; echo "Не получилось установить. Позовите помощника."; read -r -p "Нажмите Enter, чтобы закрыть…"; exit 1; }
  echo
fi

npx eleventy
status=$?

echo
if [ $status -eq 0 ]; then
  echo "✅ Готово! Сайт собран в папке _site."
  echo "   Теперь можно открыть файл 2-ОТКРЫТЬ-САЙТ.command"
else
  echo "❌ Что-то пошло не так. Скорее всего, в тексте опечатка."
  echo "   Проверьте последние правки в файлах папки src/content"
  echo "   (частая причина — лишние или потерянные кавычки)."
fi
echo
read -r -p "Нажмите Enter, чтобы закрыть это окно…"

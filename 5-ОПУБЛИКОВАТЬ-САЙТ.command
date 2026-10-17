#!/bin/bash
# Выложить сайт в интернет: собрать и отправить в хранилище.
# Дальше Netlify сам пересоберёт и обновит сайт (около минуты).
# Ключ вводить не нужно — он уже запомнен (см. 0-ЗАПОМНИТЬ-КЛЮЧ.command).

cd "$(dirname "$0")" || exit 1
export PATH="$HOME/.local/node/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin"

echo "Собираю сайт…"
if [ ! -d node_modules ]; then npm install >/dev/null 2>&1; fi
if ! npx eleventy >/dev/null 2>&1; then
  echo "❌ Сборка не удалась. Возможно, опечатка в тексте."
  echo "   Подробности:"
  npx eleventy 2>&1 | tail -12
  read -r -p "Enter…"; exit 1
fi

git add -A
if git diff --cached --quiet; then
  echo "ℹ️  Изменений нет — выкладывать нечего."
  read -r -p "Enter…"; exit 0
fi
git commit -q -m "Правки сайта: $(date '+%d.%m.%Y %H:%M')"

echo "Отправляю в хранилище…"
if git push -q origin main 2>/dev/null; then
  echo "✅ Отправлено. Сайт обновится примерно через минуту."
else
  echo "❌ Отправить не получилось — возможно, ключ не запомнен."
  echo "   Запустите 0-ЗАПОМНИТЬ-КЛЮЧ.command (один раз)."
fi
echo
read -r -p "Нажмите Enter, чтобы закрыть это окно…"
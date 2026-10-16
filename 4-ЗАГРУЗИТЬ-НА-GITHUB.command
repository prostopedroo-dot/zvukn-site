#!/bin/bash
# Загрузить файлы сайта в «облачный шкаф» GitHub.
# Запускается один раз, двойным щелчком.
#
# Что понадобится:
#   1) ссылка на хранилище (выглядит так: https://github.com/ваше-имя/zvukn-site)
#   2) ключ доступа (токен) — его выдаёт GitHub, см. docs/КАК-ОПУБЛИКОВАТЬ.md

cd "$(dirname "$0")" || exit 1
export PATH="$HOME/.local/node/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Загрузка сайта «Звук N» на GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "❌ Это папка не похожа на подготовленный проект. Позовите помощника."
  read -r -p "Нажмите Enter, чтобы закрыть…"
  exit 1
fi

echo "Шаг 1. Вставьте ссылку на ваше хранилище."
echo "        Пример: https://github.com/natalia/zvukn-site"
read -r -p "Ссылка: " REPO
REPO="$(echo "$REPO" | tr -d '[:space:]')"
case "$REPO" in
  https://github.com/*/*) ;;
  *) echo; echo "❌ Ссылка должна начинаться с https://github.com/ и содержать имя хранилища."; read -r -p "Enter…"; exit 1;;
esac
REPO="${REPO%.git}"

echo
echo "Шаг 2. Вставьте ключ доступа и нажмите Enter."
echo "        На экране он не отобразится — это нормально."
read -r -s -p "Ключ: " TOKEN
echo
if [ -z "$TOKEN" ]; then
  echo "❌ Ключ пустой. Попробуйте ещё раз."
  read -r -p "Enter…"; exit 1
fi

HOST_PATH="${REPO#https://}"
AUTH_URL="https://${TOKEN}@${HOST_PATH}.git"

echo
echo "Отправляю файлы (это займёт до минуты)…"
git remote remove origin 2>/dev/null
git remote add origin "$AUTH_URL"

if git push -u origin main 2>/tmp/zvukn-push-error.txt; then
  OK=1
else
  echo "Хм, не с первого раза. Пробую аккуратно объединить с тем, что уже есть в хранилище…"
  if git pull --rebase --allow-unrelated-histories -X ours origin main >/dev/null 2>&1 && git push -u origin main 2>/tmp/zvukn-push-error.txt; then
    OK=1
  else
    OK=0
  fi
fi

git remote set-url origin "${REPO}.git" 2>/dev/null

echo
if [ "$OK" = "1" ]; then
  echo "✅ Готово! Файлы сайта теперь в вашем хранилище GitHub."
  echo "   Следующий шаг — подключить это хранилище к хостингу Netlify."
  echo "   (Подробно: docs/КАК-ОПУБЛИКОВАТЬ.md)"
  echo
  echo "Важно: ключ доступа больше не нужен — его можно удалить в настройках GitHub"
  echo "(Settings → Developer settings → Personal access tokens), чтобы он не остался."
else
  echo "❌ Не получилось загрузить. Скорее всего, что-то с ключом доступа или ссылкой."
  echo
  echo "Подробности ошибки (покажите их помощнику):"
  tail -6 /tmp/zvukn-push-error.txt
  echo
  echo "Частые причины:"
  echo "  • ключ доступа скопирован не полностью;"
  echo "  • у ключа не отмечена галочка «repo»;"
  echo "  • хранилище указано с чужим именем."
fi
echo
read -r -p "Нажмите Enter, чтобы закрыть это окно…"

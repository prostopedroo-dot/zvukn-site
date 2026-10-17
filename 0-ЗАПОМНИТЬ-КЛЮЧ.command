#!/bin/bash
# ОДИН РАЗ: запомнить ключ доступа GitHub, чтобы больше его не вводить.
# Ключ хранится в «Связке ключей» macOS (зашифрованно) — не в файлах проекта.

cd "$(dirname "$0")" || exit 1
export PATH="$HOME/.local/node/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Запоминаем ключ — это нужно один раз"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "Нужен ключ доступа GitHub (начинается с ghp_)."
echo "Взять или обновить: https://github.com/settings/tokens"
echo

read -r -s -p "Вставьте ключ и нажмите Enter: " TOKEN
echo
if [ -z "$TOKEN" ]; then
  echo "❌ Ключ пустой. Ничего не сохранено."
  read -r -p "Enter…"; exit 1
fi

git config credential.helper osxkeychain
git remote set-url origin "https://prostopedroo-dot@github.com/prostopedroo-dot/zvukn-site.git"

printf 'protocol=https\nhost=github.com\nusername=prostopedroo-dot\npassword=%s\n\n' "$TOKEN" \
  | git credential-osxkeychain store

if git ls-remote origin >/dev/null 2>&1; then
  echo "✅ Ключ запомнен. Больше вводить его не придётся."
  echo "   Дальше выкладывать сайт можно файлом 5-ОПУБЛИКОВАТЬ-САЙТ.command"
  echo "   (или вообще не делать ничего — ассистент выложит сам)."
else
  echo "❌ Не сработало — ключ не принят."
  echo "   Проверьте, что скопировали ключ целиком и что у него есть галочка «repo»."
  echo "   Создать новый: https://github.com/settings/tokens/new?scopes=repo"
fi
echo
read -r -p "Нажмите Enter, чтобы закрыть это окно…"
#!/bin/bash
# Открыть папку с текстами сайта — здесь меняются слова, цены и фотографии.

cd "$(dirname "$0")" || exit 1
open "src/content"
echo "Открыл папку с текстами сайта."
echo
echo "Что где лежит:"
echo "  site.yaml         — адрес, телефон, соцсети, меню"
echo "  home.yaml         — тексты и цены главной страницы"
echo "  o-pedagoge.yaml   — страница «О педагоге»"
echo "  zanyatiya.yaml    — страница «Занятия и стоимость»"
echo "  kontakty.yaml     — страница «Контакты»"
echo "  politika.yaml     — политика конфиденциальности"
echo "  blog.yaml         — страница блога"
echo "  posts/            — статьи блога (обычные текстовые файлы)"
echo
echo "После правок запустите 1-СОБРАТЬ-САЙТ.command"
sleep 2

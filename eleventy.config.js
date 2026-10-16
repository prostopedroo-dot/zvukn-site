// Настройка сборки сайта «Звук N».
// Здесь почти ничего не нужно менять — сборка работает сама.
// Подробности: docs/КАК-УСТРОЕН-САЙТ.md

import { load as loadYaml } from "js-yaml";

// Файлы с содержимым сайта (тексты, цены, фото) лежат в папке src/content —
// они подключаются сами, менять здесь ничего не нужно.

// Глубокое слияние: базовый текст + изменения для варианта.
function deepMerge(base, extra) {
	if (extra === undefined || extra === null) return base;
	if (Array.isArray(base) && Array.isArray(extra)) return extra;
	if (
		typeof base === "object" &&
		typeof extra === "object" &&
		base !== null &&
		extra !== null &&
		!Array.isArray(base) &&
		!Array.isArray(extra)
	) {
		const out = { ...base };
		for (const key of Object.keys(extra)) {
			out[key] =
				key in base ? deepMerge(base[key], extra[key]) : extra[key];
		}
		return out;
	}
	return extra;
}

export default function (eleventyConfig) {
	// 1. Читаем файлы с содержимым (папка src/content, формат .yaml).
	eleventyConfig.addDataExtension("yaml,yml", (contents) => loadYaml(contents));

	// 2. Помощники для шаблонов.
	eleventyConfig.addFilter("merge", deepMerge);
	eleventyConfig.addFilter("get", (obj, key) => (obj ? obj[key] : undefined));
	eleventyConfig.addFilter("datakeys", function () { return Object.keys(this.ctx || {}).join(", "); });
	eleventyConfig.addFilter("num", (value) => String(value).padStart(2, "0"));
	// Доступ к файлу содержимого (в том числе с дефисом в имени): '' | pageData('o-pedagoge').
	// Первый аргумент фильтра — значение слева от |, оно не используется.
	eleventyConfig.addFilter("pageData", function (value, key) {
		return key && this.ctx ? this.ctx[key] : undefined;
	});
	eleventyConfig.addFilter("ruDate", (value) => {
		if (!value) return "";
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return String(value);
		return date.toLocaleDateString("ru-RU", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	});
	eleventyConfig.addFilter("sortPosts", (posts) =>
		[...(posts ?? [])].sort(
			(a, b) => new Date(b.date ?? 0) - new Date(a.date ?? 0),
		),
	);

	// 3. Статьи блога — обычные файлы (.md) в src/content/posts.
	//    Но src/content — это папка данных, и Eleventy по умолчанию не собирает
	//    из неё страницы. Разрешаем сборку шаблонов из этой папки: так статьи
	//    остаются для владельца обычными текстовыми файлами рядом с остальным содержимым.
	eleventyConfig.on("eleventy.ignores", (ignores) => {
		const index = ignores.findIndex((entry) => entry.replace(/^\.\//, "") === "src/content/**");
		if (index !== -1) ignores.splice(index, 1);
	});

	// 4. Копируем на сайт то, что не собирается из шаблонов:
	//    стили, скрипты, картинки, шрифты и панель управления.
	eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
	eleventyConfig.addPassthroughCopy({ static: "." });
	eleventyConfig.addPassthroughCopy({ admin: "admin" });

	// 5. Внутренние ссылки и пути: /o-pedagoge -> o-pedagoge.html
	//    Пути делаем относительными, чтобы сайт открывался двойным кликом
	//    по файлу, без запуска сервера.
	eleventyConfig.addFilter("url", (value) => {
		if (!value) return "";
		const v = String(value).trim();
		if (/^(https?:|mailto:|tel:|data:|#)/i.test(v)) return v;
		const [path, ...rest] = v.split("#");
		const hash = rest.length ? `#${rest.join("#")}` : "";
		const relative = path.replace(/^\//, "");
		if (/\.[a-z0-9]{2,5}$/i.test(relative)) return `${relative}${hash}`; // готовый файл или картинка
		return `${relative.replace(/\/$/, "")}.html${hash}`;
	});

	// 6. Где что лежит.
	return {
		dir: {
			input: "src",
			includes: "_includes",
			data: "content",
			output: "_site",
		},
		templateFormats: ["njk", "md", "html"],
		markdownTemplateEngine: "njk",
		htmlTemplateEngine: "njk",
	};
}
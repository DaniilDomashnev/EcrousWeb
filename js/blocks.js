const BLOCK_TYPES = {
	navbar: {
		name: 'Навбар',
		description: 'Верхняя навигация сайта',
		defaultContent:
			'<a href="#services">Услуги</a><a href="#cases">Кейсы</a><a href="#contact">Контакты</a>',
		defaultStyles: {
			backgroundColor: '#08111f',
			textColor: '#eef4ff',
			padding: '18',
			margin: '0',
			brand: 'Ecrous Studio',
		},
		properties: [
			{ name: 'brand', label: 'Название бренда', type: 'text' },
			{ name: 'content', label: 'HTML ссылок', type: 'textarea' },
			{ name: 'backgroundColor', label: 'Цвет фона', type: 'color' },
			{ name: 'textColor', label: 'Цвет текста', type: 'color' },
			{ name: 'padding', label: 'Внутренний отступ (px)', type: 'number', min: 0, max: 80 },
		],
	},
	hero: {
		name: 'Hero',
		description: 'Главный экран лендинга',
		defaultContent:
			'<p class="hero-badge">Digital Production</p><h1>Создаем сайты, которые выглядят дорого и продают спокойно.</h1><p>От концепции до запуска: структура, визуал, адаптив, интеграции и чистый экспорт без сборки.</p>',
		defaultStyles: {
			backgroundColor: '#101b31',
			color: '#ffffff',
			padding: '72',
			margin: '0',
			textAlign: 'left',
			borderRadius: '34',
		},
		properties: [
			{ name: 'content', label: 'Содержимое (HTML)', type: 'textarea' },
			{ name: 'backgroundColor', label: 'Цвет фона', type: 'color' },
			{ name: 'color', label: 'Цвет текста', type: 'color' },
			{ name: 'textAlign', label: 'Выравнивание', type: 'select', options: [
				{ value: 'left', label: 'Слева' },
				{ value: 'center', label: 'По центру' },
				{ value: 'right', label: 'Справа' },
			] },
			{ name: 'padding', label: 'Внутренний отступ (px)', type: 'number', min: 0, max: 180 },
			{ name: 'borderRadius', label: 'Скругление (px)', type: 'number', min: 0, max: 80 },
		],
	},
	heading: {
		name: 'Заголовок',
		description: 'H1, H2 или H3',
		defaultContent: 'Сильный заголовок секции',
		defaultStyles: {
			fontSize: '40',
			color: '#eef4ff',
			backgroundColor: 'transparent',
			textAlign: 'left',
			padding: '0',
			margin: '0',
			headingLevel: 'h2',
		},
		properties: [
			{ name: 'content', label: 'Текст', type: 'text' },
			{ name: 'headingLevel', label: 'Уровень', type: 'select', options: [
				{ value: 'h1', label: 'H1' },
				{ value: 'h2', label: 'H2' },
				{ value: 'h3', label: 'H3' },
			] },
			{ name: 'fontSize', label: 'Размер шрифта (px)', type: 'number', min: 12, max: 90 },
			{ name: 'color', label: 'Цвет текста', type: 'color' },
			{ name: 'backgroundColor', label: 'Цвет фона', type: 'color' },
			{ name: 'textAlign', label: 'Выравнивание', type: 'select', options: [
				{ value: 'left', label: 'Слева' },
				{ value: 'center', label: 'По центру' },
				{ value: 'right', label: 'Справа' },
			] },
			{ name: 'padding', label: 'Внутренний отступ (px)', type: 'number', min: 0, max: 120 },
			{ name: 'margin', label: 'Внешний отступ (px)', type: 'number', min: 0, max: 120 },
		],
	},
	text: {
		name: 'Текст',
		description: 'Параграф или HTML-описание',
		defaultContent:
			'<p>Здесь можно кратко описать продукт, преимущества, процесс работы или оффер. Поддерживается HTML для ссылок, акцентов и списков.</p>',
		defaultStyles: {
			fontSize: '17',
			color: '#a8b6cc',
			backgroundColor: 'transparent',
			textAlign: 'left',
			padding: '0',
			margin: '0',
			lineHeight: '1.7',
		},
		properties: [
			{ name: 'content', label: 'Текст (HTML)', type: 'textarea' },
			{ name: 'fontSize', label: 'Размер шрифта (px)', type: 'number', min: 12, max: 48 },
			{ name: 'color', label: 'Цвет текста', type: 'color' },
			{ name: 'backgroundColor', label: 'Цвет фона', type: 'color' },
			{ name: 'textAlign', label: 'Выравнивание', type: 'select', options: [
				{ value: 'left', label: 'Слева' },
				{ value: 'center', label: 'По центру' },
				{ value: 'right', label: 'Справа' },
				{ value: 'justify', label: 'По ширине' },
			] },
			{ name: 'lineHeight', label: 'Межстрочный интервал', type: 'number', min: 1, max: 3, step: 0.1 },
			{ name: 'padding', label: 'Внутренний отступ (px)', type: 'number', min: 0, max: 120 },
			{ name: 'margin', label: 'Внешний отступ (px)', type: 'number', min: 0, max: 120 },
		],
	},
	features: {
		name: 'Преимущества',
		description: 'Сетка карточек с плюсами',
		defaultContent:
			'<article class="feature-card"><h3>Быстрый старт</h3><p>Получаете рабочий лендинг, а не пустой каркас.</p></article><article class="feature-card"><h3>Чистый HTML</h3><p>Экспорт без лишних зависимостей и сборщиков.</p></article><article class="feature-card"><h3>Гибкая настройка</h3><p>Правьте тексты, цвета, отступы и ссылки прямо в редакторе.</p></article>',
		defaultStyles: {
			backgroundColor: 'transparent',
			padding: '0',
			margin: '0',
		},
		properties: [
			{ name: 'content', label: 'Содержимое (HTML)', type: 'textarea' },
			{ name: 'backgroundColor', label: 'Цвет фона', type: 'color' },
			{ name: 'padding', label: 'Внутренний отступ (px)', type: 'number', min: 0, max: 160 },
			{ name: 'margin', label: 'Внешний отступ (px)', type: 'number', min: 0, max: 120 },
		],
	},
	card: {
		name: 'Карточка',
		description: 'Контентный блок с изображением',
		defaultContent:
			'<img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80" alt="Команда"><h3>Проект под ключ</h3><p>Структура, тексты, дизайн и запуск в одном рабочем цикле.</p>',
		defaultStyles: {
			padding: '22',
			margin: '0',
			backgroundColor: '#12213a',
			color: '#eef4ff',
			borderRadius: '26',
		},
		properties: [
			{ name: 'content', label: 'Содержимое (HTML)', type: 'textarea' },
			{ name: 'backgroundColor', label: 'Цвет фона', type: 'color' },
			{ name: 'color', label: 'Цвет текста', type: 'color' },
			{ name: 'borderRadius', label: 'Скругление (px)', type: 'number', min: 0, max: 80 },
			{ name: 'padding', label: 'Внутренний отступ (px)', type: 'number', min: 0, max: 120 },
		],
	},
	button: {
		name: 'Кнопка',
		description: 'CTA-кнопка с ссылкой',
		defaultContent: 'Обсудить проект',
		defaultStyles: {
			fontSize: '16',
			color: '#ffffff',
			backgroundColor: '#ff7a18',
			textAlign: 'left',
			padding: '14',
			margin: '0',
			borderRadius: '999',
			fullWidth: false,
			width: '',
			height: '',
			buttonUrl: '#contact',
		},
		properties: [
			{ name: 'content', label: 'Текст кнопки', type: 'text' },
			{ name: 'buttonUrl', label: 'Ссылка (URL)', type: 'text' },
			{ name: 'fontSize', label: 'Размер шрифта (px)', type: 'number', min: 12, max: 36 },
			{ name: 'color', label: 'Цвет текста', type: 'color' },
			{ name: 'backgroundColor', label: 'Цвет фона', type: 'color' },
			{ name: 'textAlign', label: 'Выравнивание блока', type: 'select', options: [
				{ value: 'left', label: 'Слева' },
				{ value: 'center', label: 'По центру' },
				{ value: 'right', label: 'Справа' },
			] },
			{ name: 'borderRadius', label: 'Скругление (px)', type: 'number', min: 0, max: 999 },
			{ name: 'padding', label: 'Внутренний отступ (px)', type: 'number', min: 0, max: 60 },
			{ name: 'margin', label: 'Внешний отступ (px)', type: 'number', min: 0, max: 120 },
			{ name: 'fullWidth', label: 'На всю ширину', type: 'checkbox' },
			{ name: 'width', label: 'Ширина (CSS)', type: 'text' },
			{ name: 'height', label: 'Высота (px)', type: 'number', min: 0, max: 200 },
		],
	},
	image: {
		name: 'Изображение',
		description: 'Фото, баннер или мокап',
		defaultContent: 'Превью проекта',
		defaultStyles: {
			imageUrl:
				'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80',
			textAlign: 'center',
			padding: '0',
			margin: '0',
			maxWidth: '100',
			borderRadius: '28',
		},
		properties: [
			{ name: 'imageUrl', label: 'URL изображения', type: 'text' },
			{ name: 'content', label: 'Alt-текст', type: 'text' },
			{ name: 'textAlign', label: 'Выравнивание', type: 'select', options: [
				{ value: 'left', label: 'Слева' },
				{ value: 'center', label: 'По центру' },
				{ value: 'right', label: 'Справа' },
			] },
			{ name: 'maxWidth', label: 'Максимальная ширина (%)', type: 'number', min: 10, max: 100 },
			{ name: 'borderRadius', label: 'Скругление (px)', type: 'number', min: 0, max: 80 },
			{ name: 'padding', label: 'Внутренний отступ (px)', type: 'number', min: 0, max: 100 },
			{ name: 'margin', label: 'Внешний отступ (px)', type: 'number', min: 0, max: 100 },
		],
	},
	section: {
		name: 'Секция',
		description: 'Контейнер для кастомного контента',
		defaultContent: '<div><h3>Произвольная секция</h3><p>Используйте блок для кастомной HTML-разметки.</p></div>',
		defaultStyles: {
			backgroundColor: '#0f1c30',
			padding: '32',
			margin: '0',
			borderRadius: '26',
			color: '#eef4ff',
		},
		properties: [
			{ name: 'content', label: 'Содержимое (HTML)', type: 'textarea' },
			{ name: 'backgroundColor', label: 'Цвет фона', type: 'color' },
			{ name: 'color', label: 'Цвет текста', type: 'color' },
			{ name: 'borderRadius', label: 'Скругление (px)', type: 'number', min: 0, max: 80 },
			{ name: 'padding', label: 'Внутренний отступ (px)', type: 'number', min: 0, max: 140 },
			{ name: 'margin', label: 'Внешний отступ (px)', type: 'number', min: 0, max: 120 },
		],
	},
	contactForm: {
		name: 'Форма контакта',
		description: 'Быстрая форма обратной связи',
		defaultContent:
			'<section id="contact"><form><input placeholder="Ваше имя"><input type="email" placeholder="Email"><textarea placeholder="Расскажите о задаче"></textarea><button type="submit">Отправить запрос</button></form></section>',
		defaultStyles: {
			padding: '0',
			margin: '0',
			backgroundColor: 'transparent',
		},
		properties: [
			{ name: 'content', label: 'HTML формы', type: 'textarea' },
			{ name: 'backgroundColor', label: 'Цвет фона', type: 'color' },
			{ name: 'padding', label: 'Внутренний отступ (px)', type: 'number', min: 0, max: 160 },
			{ name: 'margin', label: 'Внешний отступ (px)', type: 'number', min: 0, max: 120 },
		],
	},
	divider: {
		name: 'Разделитель',
		description: 'Горизонтальная линия',
		defaultContent: '',
		defaultStyles: {
			color: '#26374f',
			height: '1',
			margin: '10',
		},
		properties: [
			{ name: 'height', label: 'Толщина (px)', type: 'number', min: 1, max: 12 },
			{ name: 'color', label: 'Цвет', type: 'color' },
			{ name: 'margin', label: 'Отступ (px)', type: 'number', min: 0, max: 80 },
		],
	},
	spacer: {
		name: 'Отступ',
		description: 'Пустое пространство между блоками',
		defaultContent: '',
		defaultStyles: {
			height: '40',
			backgroundColor: 'transparent',
		},
		properties: [
			{ name: 'height', label: 'Высота (px)', type: 'number', min: 10, max: 260 },
			{ name: 'backgroundColor', label: 'Цвет фона', type: 'color' },
		],
	},
	footer: {
		name: 'Футер',
		description: 'Нижняя часть страницы',
		defaultContent:
			'<p>© 2026 Ecrous Studio. Дизайн, прототипирование и запуск цифровых продуктов.</p>',
		defaultStyles: {
			backgroundColor: '#050c18',
			color: '#a8b6cc',
			padding: '28',
			margin: '0',
			textAlign: 'center',
		},
		properties: [
			{ name: 'content', label: 'Содержимое (HTML)', type: 'textarea' },
			{ name: 'backgroundColor', label: 'Цвет фона', type: 'color' },
			{ name: 'color', label: 'Цвет текста', type: 'color' },
			{ name: 'textAlign', label: 'Выравнивание', type: 'select', options: [
				{ value: 'left', label: 'Слева' },
				{ value: 'center', label: 'По центру' },
				{ value: 'right', label: 'Справа' },
			] },
			{ name: 'padding', label: 'Внутренний отступ (px)', type: 'number', min: 0, max: 120 },
		],
	},
}

function createBlock(type) {
	const blockType = BLOCK_TYPES[type]
	if (!blockType) return null

	return {
		id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
		type,
		content: blockType.defaultContent,
		styles: { ...blockType.defaultStyles },
	}
}

function createStarterBlocks() {
	return [
		createBlock('navbar'),
		createBlock('hero'),
		createBlock('spacer'),
		createBlock('heading'),
		createBlock('text'),
		createBlock('features'),
		createBlock('spacer'),
		createBlock('image'),
		createBlock('card'),
		createBlock('button'),
		createBlock('divider'),
		createBlock('contactForm'),
		createBlock('footer'),
	].filter(Boolean)
}

function renderBlock(block) {
	if (!block || !BLOCK_TYPES[block.type]) return ''

	const styles = block.styles || {}
	const shellStyles = [
		styles.margin !== undefined ? `margin:${styles.margin}px 0;` : 'margin:0;',
		styles.backgroundColor ? `background-color:${styles.backgroundColor};` : '',
		styles.color ? `color:${styles.color};` : '',
		styles.borderRadius !== undefined ? `border-radius:${styles.borderRadius}px;` : '',
	].join('')

	const contentStyles = [
		styles.padding !== undefined ? `padding:${styles.padding}px;` : '',
		styles.textAlign ? `text-align:${styles.textAlign};` : '',
	].join('')

	switch (block.type) {
		case 'heading': {
			const tag = styles.headingLevel || 'h2'
			return `
				<div class="block-shell block-heading" style="${shellStyles}">
					<div class="block-surface" style="${contentStyles}">
						<${tag} style="font-size:${styles.fontSize || 40}px;color:${styles.color || '#eef4ff'};">${block.content}</${tag}>
					</div>
				</div>
			`
		}

		case 'text':
			return `
				<div class="block-shell block-text" style="${shellStyles}">
					<div class="block-surface" style="${contentStyles}font-size:${styles.fontSize || 16}px;line-height:${styles.lineHeight || 1.6};color:${styles.color || '#a8b6cc'};">
						${block.content}
					</div>
				</div>
			`

		case 'button': {
			const isFullWidth = styles.fullWidth === true || styles.fullWidth === 'true'
			const buttonStyle = [
				styles.width ? `width:${styles.width};` : '',
				styles.height ? `height:${styles.height}px;` : '',
				`padding:${styles.padding || 14}px 24px;`,
				`font-size:${styles.fontSize || 16}px;`,
				`color:${styles.color || '#ffffff'};`,
				`background-color:${styles.backgroundColor || '#ff7a18'};`,
				`border-radius:${styles.borderRadius || 999}px;`,
			].join('')
			return `
				<div class="block-shell block-button" style="margin:${styles.margin !== undefined ? styles.margin : 0}px 0;">
					<div class="block-surface" style="${contentStyles}">
						<a class="${isFullWidth ? 'full-width' : ''}" href="${styles.buttonUrl || '#'}" style="${buttonStyle}">
							${block.content}
						</a>
					</div>
				</div>
			`
		}

		case 'image': {
			const imageUrl = styles.imageUrl || ''
			if (!imageUrl) {
				return `
					<div class="block-shell block-image placeholder" style="${shellStyles}${contentStyles}">
						Добавьте URL изображения
					</div>
				`
			}
			return `
				<div class="block-shell block-image" style="${shellStyles}">
					<div class="block-surface" style="${contentStyles}">
						<img src="${imageUrl}" alt="${block.content || ''}" style="max-width:${styles.maxWidth || 100}%;border-radius:${styles.borderRadius || 0}px;">
					</div>
				</div>
			`
		}

		case 'section':
			return `
				<section class="block-shell block-section" style="${shellStyles}">
					<div class="block-surface" style="${contentStyles}">${block.content}</div>
				</section>
			`

		case 'spacer':
			return `
				<div class="block-spacer" style="height:${styles.height || 40}px;background:${styles.backgroundColor || 'transparent'};"></div>
			`

		case 'navbar':
			return `
				<nav class="block-shell block-navbar" style="${shellStyles}color:${styles.textColor || '#eef4ff'};">
					<div class="block-surface" style="${contentStyles}">
						<div class="nav-inner">
							<div class="nav-brand">${styles.brand || 'Brand'}</div>
							<div class="nav-links">${block.content}</div>
						</div>
					</div>
				</nav>
			`

		case 'hero':
			return `
				<section class="block-shell block-hero" style="${shellStyles}color:${styles.color || '#ffffff'};">
					<div class="block-surface" style="${contentStyles}text-align:${styles.textAlign || 'left'};">
						<div class="hero-inner">${block.content}</div>
					</div>
				</section>
			`

		case 'features':
			return `
				<section class="block-shell block-features" style="${shellStyles}">
					<div class="block-surface" style="${contentStyles}">
						<div class="features-grid">${block.content}</div>
					</div>
				</section>
			`

		case 'card':
			return `
				<div class="block-shell block-card" style="${shellStyles}">
					<div class="block-surface" style="${contentStyles}color:${styles.color || '#eef4ff'};">
						${block.content}
					</div>
				</div>
			`

		case 'contactForm':
			return `
				<div class="block-shell block-form" style="${shellStyles}">
					<div class="block-surface" style="${contentStyles}">
						${block.content}
					</div>
				</div>
			`

		case 'divider':
			return `
				<hr class="block-divider" style="border:none;height:${styles.height || 1}px;background:${styles.color || '#26374f'};margin:${styles.margin || 10}px 0;">
			`

		case 'footer':
			return `
				<footer class="block-shell block-footer" style="${shellStyles}">
					<div class="block-surface" style="${contentStyles}color:${styles.color || '#a8b6cc'};text-align:${styles.textAlign || 'center'};">
						${block.content}
					</div>
				</footer>
			`

		default:
			return ''
	}
}

function renderBlockForExport(block) {
	return renderBlock(block)
}

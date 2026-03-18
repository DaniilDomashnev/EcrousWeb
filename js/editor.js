class WebsiteEditor {
	constructor() {
		this.blocks = []
		this.selectedBlockId = null
		this.draggedBlockId = null
		this.draggedNewBlockType = null
		this.activeProjectName = null
		this.allProjects = { activeProject: null, projects: {} }
		this.pageSettings = this.getDefaultPageSettings()
		this.history = []
		this.historyIndex = -1
		this.blockSearchQuery = ''
		this.currentView = 'desktop'

		this.canvas = document.getElementById('canvas')
		this.propertiesPanel = document.getElementById('propertiesPanel')
		this.blocksLibrary = document.getElementById('blocksLibrary')
		this.blocksCountValue = document.getElementById('blocksCountValue')
		this.canvasFrame = document.querySelector('.canvas-frame')
		this.blockSearchInput = document.getElementById('blockSearchInput')

		this.init()
	}

	init() {
		this.loadAllProjectsFromStorage()
		this.attachEventListeners()
		this.renderBlocksLibrary()
		this.setCanvasView(this.currentView)

		const lastActiveProject = this.allProjects.activeProject
		if (lastActiveProject && this.allProjects.projects[lastActiveProject]) {
			this.loadProject(lastActiveProject)
		} else {
			this.createNewProject(false, true)
		}
	}

	getDefaultPageSettings() {
		return {
			siteTitle: 'Ecrous WebStudio Project',
			siteDescription: 'Экспортировано из Ecrous WebStudio',
			pageBackground:
				'radial-gradient(circle at top left, rgba(255,122,24,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(73,151,255,0.16), transparent 32%), linear-gradient(180deg, #07111f 0%, #040913 100%)',
		}
	}

	getSnapshot() {
		return {
			blocks: JSON.parse(JSON.stringify(this.blocks)),
			selectedBlockId: this.selectedBlockId,
			pageSettings: { ...this.pageSettings },
		}
	}

	recordHistory() {
		const snapshot = JSON.stringify(this.getSnapshot())
		const currentSnapshot =
			this.historyIndex >= 0 ? JSON.stringify(this.history[this.historyIndex]) : null
		if (snapshot === currentSnapshot) return

		this.history = this.history.slice(0, this.historyIndex + 1)
		this.history.push(JSON.parse(snapshot))
		this.historyIndex = this.history.length - 1
		if (this.history.length > 80) {
			this.history.shift()
			this.historyIndex -= 1
		}
	}

	applyHistoryState(state) {
		this.blocks = JSON.parse(JSON.stringify(state.blocks || []))
		this.selectedBlockId = state.selectedBlockId || null
		this.pageSettings = {
			...this.getDefaultPageSettings(),
			...(state.pageSettings || {}),
		}
		this.renderCanvas()
		if (this.selectedBlockId && !this.blocks.find(block => block.id === this.selectedBlockId)) {
			this.selectedBlockId = null
		}
		this.renderPropertiesPanel()
		this.updateStats()
		this.saveCurrentProject()
	}

	undo() {
		if (this.historyIndex <= 0) return false
		this.historyIndex -= 1
		this.applyHistoryState(this.history[this.historyIndex])
		return true
	}

	redo() {
		if (this.historyIndex >= this.history.length - 1) return false
		this.historyIndex += 1
		this.applyHistoryState(this.history[this.historyIndex])
		return true
	}

	getFilteredCategories() {
		const categories = {
			'Готовые секции': ['navbar', 'hero', 'features', 'contactForm', 'footer'],
			Контент: ['heading', 'text', 'image', 'card', 'button'],
			Структура: ['section', 'divider', 'spacer'],
		}

		if (!this.blockSearchQuery.trim()) return categories

		const query = this.blockSearchQuery.trim().toLowerCase()
		const result = {}

		Object.entries(categories).forEach(([categoryName, blockNames]) => {
			const filtered = blockNames.filter(type => {
				const blockType = BLOCK_TYPES[type]
				if (!blockType) return false
				return [blockType.name, blockType.description, type]
					.join(' ')
					.toLowerCase()
					.includes(query)
			})
			if (filtered.length) result[categoryName] = filtered
		})

		return result
	}

	renderBlocksLibrary() {
		this.blocksLibrary.innerHTML = ''

		const categories = this.getFilteredCategories()
		const icons = {
			navbar: 'ri-layout-top-line',
			hero: 'ri-rocket-line',
			features: 'ri-apps-2-line',
			contactForm: 'ri-mail-send-line',
			footer: 'ri-layout-bottom-line',
			heading: 'ri-heading',
			text: 'ri-text',
			image: 'ri-image-2-line',
			card: 'ri-layout-grid-line',
			button: 'ri-cursor-line',
			section: 'ri-layout-masonry-line',
			divider: 'ri-separator',
			spacer: 'ri-drag-move-line',
		}

		if (!Object.keys(categories).length) {
			this.blocksLibrary.innerHTML = `
				<div class="no-selection">
					<i class="ri-search-line no-selection-icon"></i>
					<h3>Ничего не найдено</h3>
					<p>Попробуйте другой запрос для поиска блока.</p>
				</div>
			`
			return
		}

		Object.entries(categories).forEach(([categoryName, blockNames]) => {
			const categoryElement = document.createElement('div')
			categoryElement.className = 'block-category'

			const titleElement = document.createElement('div')
			titleElement.className = 'block-category-title'
			titleElement.textContent = categoryName
			categoryElement.appendChild(titleElement)

			const listElement = document.createElement('div')
			listElement.className = 'block-category-list'

			blockNames.forEach(type => {
				const blockType = BLOCK_TYPES[type]
				if (!blockType) return

				const item = document.createElement('button')
				item.type = 'button'
				item.className = 'block-item'
				item.draggable = true
				item.dataset.type = type
				item.innerHTML = `
					<div class="block-item-icon"><i class="${icons[type] || 'ri-box-3-line'}"></i></div>
					<div class="block-item-info">
						<div class="block-item-name">${blockType.name}</div>
						<div class="block-item-desc">${blockType.description}</div>
					</div>
				`
				item.addEventListener('click', () => this.addBlock(type))
				item.addEventListener('dragstart', event => {
					this.draggedNewBlockType = type
					item.classList.add('dragging')
					if (event.dataTransfer) {
						event.dataTransfer.effectAllowed = 'copy'
						event.dataTransfer.setData('text/plain', type)
					}
				})
				item.addEventListener('dragend', () => {
					this.draggedNewBlockType = null
					item.classList.remove('dragging')
					this.clearDragTargets()
				})
				listElement.appendChild(item)
			})

			categoryElement.appendChild(listElement)
			this.blocksLibrary.appendChild(categoryElement)
		})
	}

	addBlock(type) {
		this.addBlockAt(type, this.blocks.length)
	}

	addBlockAt(type, index) {
		const block = createBlock(type)
		if (!block) return
		const targetIndex = Math.max(0, Math.min(index, this.blocks.length))
		this.blocks.splice(targetIndex, 0, block)
		this.selectedBlockId = block.id
		this.renderCanvas()
		this.renderPropertiesPanel()
		this.recordHistory()
		this.saveCurrentProject()
		this.updateStats()
	}

	insertStarterTemplate() {
		this.blocks = createStarterBlocks()
		this.selectedBlockId = this.blocks[0]?.id || null
		this.renderCanvas()
		this.renderPropertiesPanel()
		this.recordHistory()
		this.saveCurrentProject()
		this.updateStats()
	}

	renderCanvas() {
		if (!this.blocks.length) {
			this.showCanvasPlaceholder()
			this.updateStats()
			return
		}

		this.canvas.innerHTML = ''
		this.blocks.forEach((block, index) => {
			this.canvas.appendChild(this.createBlockElement(block, index))
		})
		this.updateStats()
	}

	createBlockElement(block, index) {
		const wrapper = document.createElement('div')
		wrapper.className = 'canvas-block'
		wrapper.dataset.blockId = block.id
		wrapper.dataset.index = String(index)
		wrapper.draggable = true
		wrapper.classList.toggle('selected', block.id === this.selectedBlockId)

		const controls = document.createElement('div')
		controls.className = 'block-controls'
		controls.innerHTML = `
			<button class="block-control-btn" data-action="moveUp" title="Поднять выше"><i class="ri-arrow-up-line"></i></button>
			<button class="block-control-btn" data-action="moveDown" title="Опустить ниже"><i class="ri-arrow-down-line"></i></button>
			<button class="block-control-btn" data-action="duplicate" title="Дублировать"><i class="ri-file-copy-line"></i></button>
			<button class="block-control-btn danger" data-action="delete" title="Удалить"><i class="ri-delete-bin-line"></i></button>
		`

		const content = document.createElement('div')
		content.className = 'block-content'
		content.innerHTML = renderBlock(block)

		wrapper.appendChild(controls)
		wrapper.appendChild(content)

		wrapper.addEventListener('click', event => {
			if (!event.target.closest('.block-controls')) this.selectBlock(block.id)
		})

		controls.addEventListener('click', event => {
			const button = event.target.closest('.block-control-btn')
			if (!button) return
			event.stopPropagation()

			const action = button.dataset.action
			if (action === 'moveUp') this.moveBlock(block.id, -1)
			if (action === 'moveDown') this.moveBlock(block.id, 1)
			if (action === 'duplicate') this.duplicateBlock(block.id)
			if (action === 'delete') this.deleteBlock(block.id)
		})

		wrapper.addEventListener('dragstart', () => {
			this.draggedBlockId = block.id
			wrapper.classList.add('dragging')
		})

		wrapper.addEventListener('dragend', () => {
			this.draggedBlockId = null
			wrapper.classList.remove('dragging')
			document
				.querySelectorAll('.canvas-block.drag-over')
				.forEach(item => item.classList.remove('drag-over'))
		})

		wrapper.addEventListener('dragover', event => {
			event.preventDefault()
			if (
				(this.draggedBlockId && this.draggedBlockId !== block.id) ||
				this.draggedNewBlockType
			) {
				wrapper.classList.add('drag-over')
			}
		})

		wrapper.addEventListener('dragleave', () => wrapper.classList.remove('drag-over'))

		wrapper.addEventListener('drop', event => {
			event.preventDefault()
			wrapper.classList.remove('drag-over')
			if (this.draggedNewBlockType) {
				this.addBlockAt(this.draggedNewBlockType, index)
				this.draggedNewBlockType = null
				return
			}
			if (this.draggedBlockId && this.draggedBlockId !== block.id) {
				this.reorderBlocks(this.draggedBlockId, block.id)
			}
		})

		return wrapper
	}

	selectBlock(blockId) {
		this.selectedBlockId = blockId
		document.querySelectorAll('.canvas-block').forEach(element => {
			element.classList.toggle('selected', element.dataset.blockId === blockId)
		})
		this.renderPropertiesPanel()
	}

	renderPropertiesPanel() {
		const block = this.blocks.find(item => item.id === this.selectedBlockId)
		if (!block) {
			this.propertiesPanel.innerHTML = `
				<div class="no-selection">
					<i class="ri-settings-4-line no-selection-icon"></i>
					<h3>Страница готова к настройке</h3>
					<p>Выберите блок на холсте или откройте настройки страницы через кнопку "Страница" в шапке.</p>
				</div>
			`
			return
		}

		const blockType = BLOCK_TYPES[block.type]
		const icons = {
			navbar: 'ri-layout-top-line',
			hero: 'ri-rocket-line',
			features: 'ri-apps-2-line',
			contactForm: 'ri-mail-send-line',
			footer: 'ri-layout-bottom-line',
			heading: 'ri-heading',
			text: 'ri-text',
			image: 'ri-image-2-line',
			card: 'ri-layout-grid-line',
			button: 'ri-cursor-line',
			section: 'ri-layout-masonry-line',
			divider: 'ri-separator',
			spacer: 'ri-drag-move-line',
		}

		let html = `<div class="property-group"><div class="property-group-title"><i class="${icons[block.type] || 'ri-box-3-line'}"></i>${blockType.name}</div>`

		blockType.properties.forEach(property => {
			const currentValue =
				property.name === 'content'
					? block.content
					: block.styles[property.name] !== undefined
						? block.styles[property.name]
						: ''

			html += `<div class="property-item"><label class="property-label">${property.label}</label>`

			if (property.type === 'text') {
				html += `<input class="property-input" type="text" data-property="${property.name}" value="${this.escapeHtml(String(currentValue))}">`
			}
			if (property.type === 'textarea') {
				html += `<textarea class="property-textarea" data-property="${property.name}">${this.escapeHtml(String(currentValue))}</textarea>`
			}
			if (property.type === 'number') {
				const min = property.min ?? 0
				const max = property.max ?? 1000
				const step = property.step ?? 1
				html += `<input class="property-input" type="number" data-property="${property.name}" value="${currentValue}" min="${min}" max="${max}" step="${step}">`
			}
			if (property.type === 'color') {
				html += `<input class="property-input" type="color" data-property="${property.name}" value="${this.normalizeColorValue(currentValue)}">`
			}
			if (property.type === 'checkbox') {
				const checked = currentValue === true || currentValue === 'true' ? 'checked' : ''
				html += `<input class="property-input" type="checkbox" data-property="${property.name}" ${checked}>`
			}
			if (property.type === 'select') {
				html += `<select class="property-select" data-property="${property.name}">`
				property.options.forEach(option => {
					const isSelected = option.value === currentValue ? 'selected' : ''
					html += `<option value="${option.value}" ${isSelected}>${option.label}</option>`
				})
				html += `</select>`
			}

			html += `</div>`
		})

		html += `</div>`
		this.propertiesPanel.innerHTML = html

		this.propertiesPanel
			.querySelectorAll('.property-input, .property-textarea, .property-select')
			.forEach(input => {
				input.addEventListener('input', event => {
					const target = event.target
					const propertyName = target.dataset.property
					const value = target.type === 'checkbox' ? target.checked : target.value
					this.updateBlockProperty(this.selectedBlockId, propertyName, value)
				})
			})
	}

	updateBlockProperty(blockId, property, value) {
		const block = this.blocks.find(item => item.id === blockId)
		if (!block) return

		if (property === 'content') block.content = value
		else block.styles[property] = value

		this.renderCanvas()
		this.selectBlock(blockId)
		this.recordHistory()
		this.saveCurrentProject()
	}

	updatePageSettings(nextSettings) {
		this.pageSettings = {
			...this.pageSettings,
			...nextSettings,
		}
		this.recordHistory()
		this.saveCurrentProject()
	}

	moveBlock(blockId, direction) {
		const index = this.blocks.findIndex(block => block.id === blockId)
		if (index === -1) return
		const nextIndex = index + direction
		if (nextIndex < 0 || nextIndex >= this.blocks.length) return

		;[this.blocks[index], this.blocks[nextIndex]] = [this.blocks[nextIndex], this.blocks[index]]
		this.renderCanvas()
		this.selectBlock(blockId)
		this.recordHistory()
		this.saveCurrentProject()
	}

	reorderBlocks(draggedId, targetId) {
		const draggedIndex = this.blocks.findIndex(block => block.id === draggedId)
		const targetIndex = this.blocks.findIndex(block => block.id === targetId)
		if (draggedIndex === -1 || targetIndex === -1) return

		const [draggedBlock] = this.blocks.splice(draggedIndex, 1)
		this.blocks.splice(targetIndex, 0, draggedBlock)
		this.renderCanvas()
		this.selectBlock(draggedId)
		this.recordHistory()
		this.saveCurrentProject()
	}

	duplicateBlock(blockId) {
		const block = this.blocks.find(item => item.id === blockId)
		if (!block) return

		const clonedBlock = {
			...block,
			id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
			styles: { ...block.styles },
		}

		const index = this.blocks.findIndex(item => item.id === blockId)
		this.blocks.splice(index + 1, 0, clonedBlock)
		this.selectedBlockId = clonedBlock.id
		this.renderCanvas()
		this.renderPropertiesPanel()
		this.recordHistory()
		this.saveCurrentProject()
	}

	async deleteBlock(blockId) {
		const confirmed = await showConfirm('Удалить этот блок из проекта?', 'Подтверждение')
		if (!confirmed) return

		this.blocks = this.blocks.filter(item => item.id !== blockId)
		if (this.selectedBlockId === blockId) this.selectedBlockId = null
		this.renderCanvas()
		this.renderPropertiesPanel()
		this.recordHistory()
		this.saveCurrentProject()
		this.updateStats()
	}

	showCanvasPlaceholder() {
		this.canvas.innerHTML = `
			<div class="canvas-placeholder">
				<i class="ri-layout-grid-line placeholder-icon"></i>
				<h3>Проект пока пустой</h3>
				<p>Добавьте первый блок вручную или вставьте стартовый шаблон с уже подготовленной структурой лендинга.</p>
				<div class="placeholder-actions">
					<button class="btn btn-primary" id="placeholderTemplateBtn" type="button">
						<i class="ri-sparkling-2-line"></i>
						Вставить шаблон
					</button>
					<button class="btn btn-secondary" id="placeholderFirstBlockBtn" type="button">
						<i class="ri-add-line"></i>
						Добавить заголовок
					</button>
				</div>
			</div>
		`
	}

	clearDragTargets() {
		document
			.querySelectorAll('.canvas-block.drag-over, .canvas.drag-over')
			.forEach(item => item.classList.remove('drag-over'))
	}

	async clearAll() {
		const confirmed = await showConfirm(
			'Очистить текущий проект и удалить все блоки? Это действие нельзя отменить.',
			'Очистка проекта',
		)
		if (!confirmed) return

		this.blocks = []
		this.selectedBlockId = null
		this.renderCanvas()
		this.renderPropertiesPanel()
		this.recordHistory()
		this.saveCurrentProject()
		this.updateStats()
	}

	exportHTML() {
		const siteTitle = this.escapeHtml(this.pageSettings.siteTitle || this.activeProjectName || 'Ecrous WebStudio Project')
		const siteDescription = this.escapeHtml(this.pageSettings.siteDescription || 'Экспортировано из Ecrous WebStudio')
		const pageBackground = this.pageSettings.pageBackground || '#07111f'
		const bodyMarkup = this.blocks.map(block => renderBlockForExport(block)).join('\n')

		return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${siteDescription}">
  <title>${siteTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --page-bg: #07111f;
      --panel: #0f1c30;
      --text: #eef4ff;
      --text-soft: #a8b6cc;
      --accent: #ff7a18;
      --accent-2: #ffb347;
      --line: rgba(255,255,255,0.12);
      --radius: 28px;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: 'Manrope', sans-serif;
      background: ${pageBackground};
      color: var(--text);
      line-height: 1.5;
    }
    img { display: block; max-width: 100%; height: auto; }
    a { color: inherit; }
    .page-shell { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 24px 0 56px; }
    .page-shell > :first-child {
      border-top-left-radius: 26px;
      border-top-right-radius: 26px;
      overflow: hidden;
    }
    .block-shell { width: 100%; }
    .block-surface { width: 100%; max-width: 100%; }
    .block-heading h1, .block-heading h2, .block-heading h3, .block-text p, .block-card h3, .block-card p, .block-hero h1, .block-hero p, .block-footer p { margin: 0; }
    .block-heading h1, .block-heading h2, .block-heading h3 { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.04em; line-height: 1.04; }
    .block-button a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      text-decoration: none;
      font-weight: 800;
      box-shadow: 0 18px 35px rgba(255,122,24,0.18);
    }
    .block-button a.full-width { display: flex; width: 100%; }
    .block-navbar .nav-inner,
    .block-features .features-grid,
    .block-form form { max-width: 1100px; margin: 0 auto; }
    .block-navbar .nav-inner { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
    .block-navbar .nav-brand { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.03em; }
    .block-navbar .nav-links { display: flex; flex-wrap: wrap; gap: 16px; color: var(--text-soft); }
    .block-navbar .nav-links a { text-decoration: none; }
    .block-hero { overflow: hidden; }
    .block-hero .hero-inner { max-width: 720px; margin: 0 auto; }
    .block-hero .hero-badge {
      display: inline-block; margin-bottom: 14px; padding: 8px 12px; border-radius: 999px;
      font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
      background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.76);
    }
    .block-hero h1 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(2.5rem, 7vw, 5.2rem); margin-bottom: 18px; }
    .block-hero p { font-size: 1.05rem; color: rgba(255,255,255,0.82); }
    .block-features .features-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
    .block-features .feature-card { padding: 24px; border-radius: 22px; background: rgba(255,255,255,0.04); border: 1px solid var(--line); }
    .block-features .feature-card h3 { margin: 0 0 10px; }
    .block-features .feature-card p { margin: 0; color: var(--text-soft); }
    .block-card { max-width: 760px; }
    .block-card img { width: 100%; border-radius: 18px; margin-bottom: 18px; }
    .block-form form { display: grid; gap: 14px; max-width: 720px; }
    .block-form input, .block-form textarea {
      width: 100%; padding: 14px 16px; border-radius: 16px; border: 1px solid var(--line);
      background: rgba(255,255,255,0.04); color: var(--text);
    }
    .block-form textarea { min-height: 140px; resize: vertical; }
    .block-form button {
      border: 0; border-radius: 999px; padding: 14px 20px; font-weight: 800; cursor: pointer;
      color: white; background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
    }
    .block-footer { border-radius: 28px; }
    .export-toast {
      position: fixed; right: 20px; bottom: 20px; padding: 12px 16px; border-radius: 999px;
      background: rgba(0,0,0,0.65); color: #fff; opacity: 0; transform: translateY(12px);
      pointer-events: none; transition: 0.2s ease;
    }
    .export-toast.show { opacity: 1; transform: translateY(0); }
    @media (max-width: 860px) {
      .page-shell { width: min(100% - 24px, 1180px); }
      .block-navbar .nav-inner, .block-features .features-grid { display: grid; grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="page-shell">
${bodyMarkup}
  </main>
  <div id="exportToast" class="export-toast">Форма работает в демо-режиме</div>
  <script>
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', event => {
        const href = link.getAttribute('href');
        const target = href ? document.querySelector(href) : null;
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', event => {
        event.preventDefault();
        const toast = document.getElementById('exportToast');
        if (!toast) return;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2200);
      });
    });
  </script>
</body>
</html>`
	}

	loadAllProjectsFromStorage() {
		try {
			const savedData = localStorage.getItem('ecrousWebStudioData')
			this.allProjects = savedData ? JSON.parse(savedData) : { activeProject: null, projects: {} }
			if (!this.allProjects.projects) this.allProjects.projects = {}
		} catch (error) {
			console.error('Ошибка загрузки проектов:', error)
			this.allProjects = { activeProject: null, projects: {} }
		}
	}

	saveAllProjectsToStorage() {
		try {
			localStorage.setItem('ecrousWebStudioData', JSON.stringify(this.allProjects))
		} catch (error) {
			console.error('Ошибка сохранения проектов:', error)
		}
	}

	saveCurrentProject() {
		if (!this.activeProjectName) return

		this.allProjects.projects[this.activeProjectName] = {
			blocks: JSON.parse(JSON.stringify(this.blocks)),
			pageSettings: { ...this.pageSettings },
			updatedAt: new Date().toISOString(),
		}
		this.allProjects.activeProject = this.activeProjectName
		this.saveAllProjectsToStorage()
	}

	loadProject(projectName) {
		const project = this.allProjects.projects[projectName]
		if (!project) return false

		this.activeProjectName = projectName
		this.blocks = JSON.parse(JSON.stringify(project.blocks || []))
		this.pageSettings = {
			...this.getDefaultPageSettings(),
			...(project.pageSettings || {}),
		}
		this.selectedBlockId = null
		this.allProjects.activeProject = projectName
		this.saveAllProjectsToStorage()
		this.renderCanvas()
		this.renderPropertiesPanel()
		this.history = []
		this.historyIndex = -1
		this.recordHistory()
		this.updateStats()
		return true
	}

	async createNewProject(confirmFirst = true, useStarterTemplate = false) {
		if (confirmFirst) {
			const confirmed = await showConfirm(
				'Создать новый проект? Несохраненные изменения в текущем проекте могут быть потеряны.',
				'Новый проект',
			)
			if (!confirmed) return false
		}

		this.activeProjectName = null
		this.selectedBlockId = null
		this.pageSettings = this.getDefaultPageSettings()
		this.blocks = useStarterTemplate ? createStarterBlocks() : []
		this.renderCanvas()
		this.renderPropertiesPanel()
		this.history = []
		this.historyIndex = -1
		this.recordHistory()
		this.updateStats()
		return true
	}

	async saveProjectAs() {
		const defaultName = this.activeProjectName || `Проект ${new Date().toLocaleDateString('ru-RU')}`
		const projectName = await showPrompt('Введите имя проекта:', defaultName, 'Сохранить проект')
		if (projectName === null) return null

		const normalizedName = projectName.trim()
		if (!normalizedName) return null

		this.activeProjectName = normalizedName
		if (!this.pageSettings.siteTitle || this.pageSettings.siteTitle === 'Ecrous WebStudio Project') {
			this.pageSettings.siteTitle = normalizedName
		}
		this.saveCurrentProject()
		return normalizedName
	}

	async deleteProject(projectName) {
		if (!this.allProjects.projects[projectName]) return false

		const confirmed = await showConfirm(
			`Удалить проект "${projectName}"? Это действие нельзя отменить.`,
			'Удаление проекта',
		)
		if (!confirmed) return false

		delete this.allProjects.projects[projectName]

		if (this.allProjects.activeProject === projectName) {
			const remainingProjectNames = Object.keys(this.allProjects.projects)
			if (remainingProjectNames.length) this.loadProject(remainingProjectNames[0])
			else {
				this.allProjects.activeProject = null
				this.createNewProject(false, true)
			}
		}

		this.saveAllProjectsToStorage()
		return true
	}

	setCanvasView(view) {
		this.currentView = view
		if (this.canvasFrame) this.canvasFrame.dataset.view = view

		document.querySelectorAll('.view-btn').forEach(button => {
			button.classList.toggle('active', button.dataset.view === view)
		})
	}

	updateStats() {
		if (this.blocksCountValue) this.blocksCountValue.textContent = String(this.blocks.length)
	}

	normalizeColorValue(value) {
		if (typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)) return value
		return '#ffffff'
	}

	escapeHtml(text) {
		const div = document.createElement('div')
		div.textContent = text
		return div.innerHTML
	}

	attachEventListeners() {
		document.getElementById('exportBtn').addEventListener('click', () => {
			document.getElementById('exportCode').value = this.exportHTML()
			document.getElementById('exportModal').classList.add('active')
		})

		document.getElementById('clearBtn').addEventListener('click', () => this.clearAll())
		document.getElementById('insertTemplateBtn').addEventListener('click', () => this.insertStarterTemplate())

		if (this.blockSearchInput) {
			this.blockSearchInput.addEventListener('input', event => {
				this.blockSearchQuery = event.target.value || ''
				this.renderBlocksLibrary()
			})
		}

		document.querySelectorAll('.view-btn').forEach(button => {
			button.addEventListener('click', () => this.setCanvasView(button.dataset.view))
		})

		this.canvas.addEventListener('click', event => {
			const target = event.target
			if (target.id === 'placeholderTemplateBtn') {
				this.insertStarterTemplate()
				showNotification('Стартовый шаблон добавлен в проект.', 'success')
				return
			}
			if (target.id === 'placeholderFirstBlockBtn') {
				this.addBlock('heading')
				showNotification('Первый блок добавлен.', 'success')
				return
			}
			if (target === this.canvas) {
				this.selectedBlockId = null
				this.renderCanvas()
				this.renderPropertiesPanel()
			}
		})

		this.canvas.addEventListener('dragover', event => {
			if (!this.draggedNewBlockType) return
			event.preventDefault()
			this.canvas.classList.add('drag-over')
			if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
		})

		this.canvas.addEventListener('dragleave', event => {
			if (event.target === this.canvas) this.canvas.classList.remove('drag-over')
		})

		this.canvas.addEventListener('drop', event => {
			if (!this.draggedNewBlockType) return
			event.preventDefault()
			this.canvas.classList.remove('drag-over')
			this.addBlockAt(this.draggedNewBlockType, this.blocks.length)
			this.draggedNewBlockType = null
		})
	}
}

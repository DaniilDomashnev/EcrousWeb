let editor

function showDialog(options = {}) {
	return new Promise(resolve => {
		const modal = document.getElementById('dialogModal')
		const title = document.getElementById('dialogTitle')
		const message = document.getElementById('dialogMessage')
		const input = document.getElementById('dialogInput')
		const okButton = document.getElementById('dialogOk')
		const cancelButton = document.getElementById('dialogCancel')
		const closeButton = document.getElementById('dialogClose')

		title.textContent = options.title || 'Внимание'
		message.textContent = options.message || ''
		okButton.textContent = options.okText || 'Ок'
		cancelButton.textContent = options.cancelText || 'Отмена'

		if (options.input) {
			input.style.display = 'block'
			input.value = options.defaultValue || ''
			input.placeholder = options.placeholder || ''
			setTimeout(() => input.focus(), 20)
		} else {
			input.style.display = 'none'
			input.value = ''
		}

		const cleanup = result => {
			modal.classList.remove('active')
			modal.setAttribute('aria-hidden', 'true')
			okButton.removeEventListener('click', onOk)
			cancelButton.removeEventListener('click', onCancel)
			closeButton.removeEventListener('click', onCancel)
			modal.removeEventListener('click', onBackdrop)
			document.removeEventListener('keydown', onKeyDown)
			resolve(result)
		}

		const onOk = () => cleanup(options.input ? input.value : true)
		const onCancel = () => cleanup(options.input ? null : false)
		const onBackdrop = event => {
			if (event.target === modal) onCancel()
		}
		const onKeyDown = event => {
			if (event.key === 'Escape') onCancel()
			if (event.key === 'Enter' && options.input) onOk()
		}

		okButton.addEventListener('click', onOk)
		cancelButton.addEventListener('click', onCancel)
		closeButton.addEventListener('click', onCancel)
		modal.addEventListener('click', onBackdrop)
		document.addEventListener('keydown', onKeyDown)

		modal.classList.add('active')
		modal.setAttribute('aria-hidden', 'false')
	})
}

function showConfirm(message, title = 'Подтверждение') {
	return showDialog({ title, message })
}

function showPrompt(message, defaultValue = '', title = 'Введите значение') {
	return showDialog({ title, message, input: true, defaultValue })
}

document.addEventListener('DOMContentLoaded', () => {
	editor = new WebsiteEditor()
	initModal()
	initPageSettingsModal()
	initProjectMenu()
	initPreview()
	initHistoryControls()
	updateUIForActiveProject()
})

function initPreview() {
	const previewButton = document.getElementById('previewBtn')
	if (!previewButton) return

	previewButton.addEventListener('click', event => {
		event.preventDefault()
		if (!editor) return

		const previewWindow = window.open('', '_blank')
		if (!previewWindow) {
			showNotification('Браузер заблокировал окно предпросмотра.', 'warning')
			return
		}

		previewWindow.document.write(editor.exportHTML())
		previewWindow.document.close()
	})
}

function initHistoryControls() {
	const undoButton = document.getElementById('undoBtn')
	const redoButton = document.getElementById('redoBtn')
	if (!undoButton || !redoButton) return

	undoButton.addEventListener('click', () => {
		if (editor.undo()) {
			updateHistoryButtons()
			showNotification('Последнее действие отменено.', 'info')
		}
	})

	redoButton.addEventListener('click', () => {
		if (editor.redo()) {
			updateHistoryButtons()
			showNotification('Действие повторено.', 'info')
		}
	})

	updateHistoryButtons()
}

function updateHistoryButtons() {
	const undoButton = document.getElementById('undoBtn')
	const redoButton = document.getElementById('redoBtn')
	if (!undoButton || !redoButton || !editor) return

	undoButton.disabled = editor.historyIndex <= 0
	redoButton.disabled = editor.historyIndex >= editor.history.length - 1
}

function initPageSettingsModal() {
	const modal = document.getElementById('pageSettingsModal')
	const openButton = document.getElementById('pageSettingsBtn')
	const closeButton = document.getElementById('pageSettingsClose')
	const cancelButton = document.getElementById('pageSettingsCancel')
	const saveButton = document.getElementById('pageSettingsSave')
	const titleInput = document.getElementById('siteTitleInput')
	const descriptionInput = document.getElementById('siteDescriptionInput')
	const bgInput = document.getElementById('siteBgInput')

	const closeModal = () => {
		modal.classList.remove('active')
		modal.setAttribute('aria-hidden', 'true')
	}

	const openModal = () => {
		const settings = editor.pageSettings
		titleInput.value = settings.siteTitle || ''
		descriptionInput.value = settings.siteDescription || ''
		bgInput.value = settings.pageBackground || ''
		modal.classList.add('active')
		modal.setAttribute('aria-hidden', 'false')
	}

	openButton.addEventListener('click', openModal)
	closeButton.addEventListener('click', closeModal)
	cancelButton.addEventListener('click', closeModal)
	modal.addEventListener('click', event => {
		if (event.target === modal) closeModal()
	})

	saveButton.addEventListener('click', () => {
		editor.updatePageSettings({
			siteTitle: titleInput.value.trim() || 'Ecrous WebStudio Project',
			siteDescription:
				descriptionInput.value.trim() || 'Экспортировано из Ecrous WebStudio',
			pageBackground:
				bgInput.value.trim() ||
				editor.getDefaultPageSettings().pageBackground,
		})
		updateHistoryButtons()
		closeModal()
		showNotification('Настройки страницы сохранены.', 'success')
	})
}

function initProjectMenu() {
	const menuButton = document.getElementById('projectMenuBtn')
	const dropdown = document.getElementById('projectDropdown')
	const menuRoot = document.querySelector('.project-menu')

	menuButton.addEventListener('click', event => {
		event.stopPropagation()
		menuRoot.classList.toggle('active')
		if (menuRoot.classList.contains('active')) updateRecentProjectsList()
	})

	document.addEventListener('click', () => menuRoot.classList.remove('active'))
	dropdown.addEventListener('click', event => event.stopPropagation())

	document.getElementById('newProjectBtn').addEventListener('click', async event => {
		event.preventDefault()
		const created = await editor.createNewProject(true, true)
		if (!created) return
		updateUIForActiveProject()
		updateHistoryButtons()
		menuRoot.classList.remove('active')
		showNotification('Создан новый проект на основе стартового шаблона.', 'success')
	})

	document.getElementById('saveProjectAsBtn').addEventListener('click', async event => {
		event.preventDefault()
		const projectName = await editor.saveProjectAs()
		if (projectName) {
			updateUIForActiveProject()
			showNotification(`Проект "${projectName}" сохранен.`, 'success')
		}
		menuRoot.classList.remove('active')
	})
}

function updateRecentProjectsList() {
	const listContainer = document.getElementById('recentProjectsList')
	if (!listContainer || !editor) return

	listContainer.innerHTML = ''
	const projectNames = Object.keys(editor.allProjects.projects)

	if (!projectNames.length) {
		const emptyState = document.createElement('div')
		emptyState.style.cssText = 'padding:12px 16px;color:var(--text-soft);font-size:13px;'
		emptyState.textContent = 'Пока нет сохраненных проектов'
		listContainer.appendChild(emptyState)
		return
	}

	projectNames.forEach(name => {
		const item = document.createElement('a')
		item.href = '#'
		item.className = 'recent-project-item'

		const title = document.createElement('span')
		title.textContent = name
		if (name === editor.activeProjectName) {
			title.style.fontWeight = '800'
			title.style.color = 'var(--accent-2)'
		}

		const deleteButton = document.createElement('button')
		deleteButton.className = 'delete-project-btn'
		deleteButton.type = 'button'
		deleteButton.title = 'Удалить проект'
		deleteButton.innerHTML = '&times;'

		item.appendChild(title)
		item.appendChild(deleteButton)

		item.addEventListener('click', event => {
			event.preventDefault()
			if (event.target === deleteButton) return
			if (editor.loadProject(name)) {
				updateUIForActiveProject()
				updateHistoryButtons()
				showNotification(`Проект "${name}" загружен.`, 'info')
			}
			document.querySelector('.project-menu').classList.remove('active')
		})

		deleteButton.addEventListener('click', async event => {
			event.preventDefault()
			event.stopPropagation()
			const removed = await editor.deleteProject(name)
			if (!removed) return
			updateUIForActiveProject()
			updateHistoryButtons()
			updateRecentProjectsList()
			showNotification(`Проект "${name}" удален.`, 'info')
		})

		listContainer.appendChild(item)
	})
}

function updateUIForActiveProject() {
	const title = document.querySelector('.app-title')
	const status = document.getElementById('projectStatusText')

	if (editor.activeProjectName) {
		title.textContent = `Ecrous WebStudio / ${editor.activeProjectName}`
		status.textContent = `Активный проект: ${editor.activeProjectName}`
	} else {
		title.textContent = 'Ecrous WebStudio'
		status.textContent = 'Черновик готов к редактированию'
	}

	editor.updateStats()
	updateRecentProjectsList()
	updateHistoryButtons()
}

function initModal() {
	const modal = document.getElementById('exportModal')
	const closeButton = document.getElementById('closeModal')
	const downloadButton = document.getElementById('downloadBtn')
	const copyButton = document.getElementById('copyBtn')

	const closeModal = () => {
		modal.classList.remove('active')
		modal.setAttribute('aria-hidden', 'true')
	}

	closeButton.addEventListener('click', closeModal)
	modal.addEventListener('click', event => {
		if (event.target === modal) closeModal()
	})

	document.addEventListener('keydown', event => {
		if (event.key === 'Escape') closeModal()
	})

	downloadButton.addEventListener('click', () => {
		const html = document.getElementById('exportCode').value
		const filename = `${editor.activeProjectName || 'index'}.html`
		downloadFile(filename, html)
		showNotification('Файл успешно скачан.', 'success')
	})

	copyButton.addEventListener('click', async () => {
		const html = document.getElementById('exportCode').value
		const copied = await copyTextToClipboard(html)
		if (copied) showNotification('Код скопирован в буфер обмена.', 'success')
		else showNotification('Не удалось скопировать код.', 'danger')
	})
}

function downloadFile(filename, content) {
	const link = document.createElement('a')
	const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
	const objectUrl = URL.createObjectURL(blob)
	link.href = objectUrl
	link.download = filename
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(objectUrl)
}

async function copyTextToClipboard(text) {
	try {
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(text)
			return true
		}

		const textarea = document.createElement('textarea')
		textarea.value = text
		textarea.setAttribute('readonly', '')
		textarea.style.position = 'fixed'
		textarea.style.opacity = '0'
		document.body.appendChild(textarea)
		textarea.select()
		const success = document.execCommand('copy')
		document.body.removeChild(textarea)
		return success
	} catch (error) {
		console.error('Ошибка копирования:', error)
		return false
	}
}

function showNotification(message, type = 'info') {
	const host = document.getElementById('notificationHost')
	if (!host) return

	const notification = document.createElement('div')
	notification.className = `notification ${type}`
	notification.textContent = message
	host.appendChild(notification)

	requestAnimationFrame(() => notification.classList.add('show'))

	setTimeout(() => {
		notification.classList.remove('show')
		notification.addEventListener('transitionend', () => notification.remove(), {
			once: true,
		})
	}, 3200)
}

document.addEventListener('keydown', async event => {
	if (!editor) return

	if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) {
		event.preventDefault()
		if (editor.undo()) {
			updateHistoryButtons()
			showNotification('Последнее действие отменено.', 'info')
		}
	}

	if (
		(event.ctrlKey || event.metaKey) &&
		(event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))
	) {
		event.preventDefault()
		if (editor.redo()) {
			updateHistoryButtons()
			showNotification('Действие повторено.', 'info')
		}
	}

	if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
		event.preventDefault()
		if (editor.activeProjectName) {
			editor.saveCurrentProject()
			showNotification(`Проект "${editor.activeProjectName}" сохранен.`, 'success')
		} else {
			const projectName = await editor.saveProjectAs()
			if (projectName) {
				updateUIForActiveProject()
				showNotification(`Проект "${projectName}" сохранен.`, 'success')
			}
		}
	}

	if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'e') {
		event.preventDefault()
		document.getElementById('exportBtn').click()
	}

	if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd' && editor.selectedBlockId) {
		event.preventDefault()
		editor.duplicateBlock(editor.selectedBlockId)
		updateHistoryButtons()
		showNotification('Блок продублирован.', 'success')
	}

	if (event.key === 'Delete' && editor.selectedBlockId) {
		const activeTag = document.activeElement?.tagName
		if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return
		event.preventDefault()
		editor.deleteBlock(editor.selectedBlockId)
	}
})

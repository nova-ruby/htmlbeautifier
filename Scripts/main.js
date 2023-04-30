const htmlbeautifier = require("./utils/index")
const { configFor, applyTextEdit } = require("./helpers")

let skipFormatOnSave = false
let triggeredByFormat = false

/** @type {Disposable[]} */
const formatOnSaveEventHandlers = []

/** Activate the extension. */
exports.activate = function() {
	formatOnSaveEventHandlers.forEach(handler => handler.dispose())

	// Format on save if specified
	if (configFor(htmlbeautifier.config.htmlbeautifier.get("formatOnSave"))) {
		const didAddTextEditorHandler = nova.workspace.onDidAddTextEditor((editor) => {
			if (!htmlbeautifier.SYNTAXES.includes(editor.document.syntax)) return

			const didSaveHandler = editor.onDidSave(async (editor) => {
				if (!triggeredByFormat) {
					nova.commands.invoke("tommasonegri.htmlbeautifier._format", editor)
					triggeredByFormat = false
				}
			})

			const didDestroyHandler = editor.onDidDestroy(() => {
				didSaveHandler.dispose()
			})

			formatOnSaveEventHandlers.push(didSaveHandler)
			formatOnSaveEventHandlers.push(didDestroyHandler)
		})

		formatOnSaveEventHandlers.push(didAddTextEditorHandler)
	}
}

/** Deactivate the extension. */
exports.deactivate = function() {
	formatOnSaveEventHandlers.forEach(handler => handler.dispose())
}

/** Reload the extension. */
const reload = () => {
	exports.deactivate()
	exports.activate()
}

nova.subscriptions.add(
	nova.config.onDidChange("tommasonegri.htmlbeautifier.formatOnSave", reload)
)
nova.subscriptions.add(
	nova.workspace.config.onDidChange("tommasonegri.htmlbeautifier.formatOnSave", reload)
)

// Internal format command
nova.subscriptions.add(
	nova.commands.register("tommasonegri.htmlbeautifier._format", /** @param {TextEditor} editor */ async (_, editor) => {
		if (skipFormatOnSave) {
			skipFormatOnSave = false
			return
		}

		try {
			const config         = htmlbeautifier.config
			const commandArgs    = []
			if (!editor.softTabs) commandArgs.push("--tab")
			if (editor.softTabs)  commandArgs.push(`--tab-stops=${editor.tabLength}`)
			commandArgs.push(`--keep-blank-lines=${configFor(htmlbeautifier.config.htmlbeautifier.get("keepBlankLines"))}`)
			commandArgs.push("<")
			commandArgs.push(nova.workspace.relativizePath(editor.document.path).toString())

			const beautifiedText = await htmlbeautifier.commands.htmlbeautifier(commandArgs, config)

			await applyTextEdit(editor, beautifiedText)

			triggeredByFormat = true
			editor.save()
		} catch (error) {
			console.error(error)
		}
	})
)

// EDITOR COMMANDS

// Format command
nova.subscriptions.add(
	nova.commands.register("tommasonegri.htmlbeautifier.format", (editor) => {
		editor.save()
		nova.commands.invoke("tommasonegri.htmlbeautifier._format", editor)
	})
)

// Save without formatting command
nova.subscriptions.add(
	nova.commands.register("tommasonegri.htmlbeautifier.saveWithoutFormatting", (editor) => {
		skipFormatOnSave = true
		editor.save()
	})
)


const htmlbeautifier = require("./utils/index")
const { configFor, applyTextEdit } = require("./helpers")

let skipFormatOnSave = false

/** @type {Disposable[]} */
const formatOnSaveEventHandlers = []

/** Activate the extension. */
exports.activate = function() {
	formatOnSaveEventHandlers.forEach(handler => handler.dispose())

	// Format on save if specified
	if (configFor(htmlbeautifier.config.htmlbeautifier.get("formatOnSave"))) {
		const didAddTextEditorHandler = nova.workspace.onDidAddTextEditor((editor) => {
			if (!htmlbeautifier.SYNTAXES.includes(editor.document.syntax)) return

			const willSaveHandler = editor.onWillSave(async (editor) => {
				await nova.commands.invoke("tommasonegri.htmlbeautifier._format", editor)
			})

			const didDestroyHandler = editor.onDidDestroy(() => {
				willSaveHandler.dispose()
			})

			formatOnSaveEventHandlers.push(willSaveHandler)
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
	nova.commands.register("tommasonegri.htmlbeautifier._format", async (_, editor) => {
		if (skipFormatOnSave) {
			skipFormatOnSave = false
			return
		}

		try {
			const path           = nova.workspace.relativizePath(editor.document.path)
			const commandArgs    = ["<", path.toString()]
			const config         = htmlbeautifier.config
			const beautifiedText = await htmlbeautifier.commands.htmlbeautifier(commandArgs, config)

			applyTextEdit(editor, beautifiedText)
		} catch (error) {
			console.error(error)
		}
	})
)

// EDITOR COMMANDS

// Format command
nova.subscriptions.add(
	nova.commands.register("tommasonegri.htmlbeautifier.format", (editor) => {
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


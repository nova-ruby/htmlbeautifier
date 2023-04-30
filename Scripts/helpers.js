/**
 * If overwritten retrieve a config from the current workspace, otherwise use the global default
 * @param {string} key - Config key
 * @returns {(string|number|boolean|array|null)} The value retrieved from the config
 */
exports.configFor = (config) => {
	const workspace   = sanitazeConfig(nova.workspace.config.get(config.key))
	const environment = sanitazeConfig(nova.config.get(config.key))

	if (workspace != null && workspace !== "") {
		return workspace
	} else if (environment != null) {
		return environment
	} else {
		return config.default
	}
}

const sanitazeConfig = (value) => {
	if (value === "")           return null
	else if (value === "true")  return true
	else if (value === "false") return false
	else return value
}

/**
 * Apply a text edit in the given editor.
 * @param {TextEditor} editor
 * @param {string} text
 */
exports.applyTextEdit = (editor, text) => {
	return editor.edit((edit) => {
		const range = new Range(0, editor.document.length)

		edit.replace(range, text)
	})
}

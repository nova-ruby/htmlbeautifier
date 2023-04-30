const { configFor } = require("../../helpers")

const htmlbeautifier = {
	/**
	 * Return the path of the HTML Beautifier command.
	 */
	path: () => {
		return "/usr/bin/env"
	},

	/**
	 * Return the args for the HTML Beautifier command.
	 * @param {object} config
	 */
	args: (config) => {
		const commandPath = configFor(config.htmlbeautifier.get("commandPath"))

		return [ commandPath ]
	}
}

module.exports = {
	htmlbeautifier
}

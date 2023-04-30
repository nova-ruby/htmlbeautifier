const helpers = require("./helpers")

module.exports = async (commandArgs, config) => {
	/** @type {string[]} */
	let args = helpers.htmlbeautifier.args(config)

	args = [...args, ...commandArgs]

	return new Promise((resolve, reject) => {
		const process = new Process(helpers.htmlbeautifier.path(), {
			cwd: nova.workspace.path,
			args: args,
			stdio: ["ignore", "pipe", "pipe"],
			env: {
				cwd: nova.workspace.path
			},
			shell: true
		})

		let str = ""
		let err = ""

		process.onStdout((output) => { str += output })

		process.onStderr((error) => { err += error })

		process.onDidExit((status) => {
			if (status == 1) reject(err)

			return resolve(str)
		})

		process.start()
	})
}

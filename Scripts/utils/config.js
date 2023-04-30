const extension = require("../../extension.json")

exports.htmlbeautifier = new Map(
	extension.config.filter(config => config.key.split(".").length == 3).map(config => {
		return [
			config.key.split(".")[2],
			{
				key: config.key,
				type: config.type,
				default: config.default,
			}
		]
	})
)

/** @type {string[]} */
exports.keys = [
	...Array.from(exports.htmlbeautifier.values()).map(c => c.key).filter(key => !key.includes("internals"))
]

module.exports = {
	plugins: [
		[
			"module-resolver",
			{
				alias: {
					"@": "./",
					"@config": "./config",
					"@src": "./src",
					"@app": "./src/app",
				},
			},
		],
	],
};

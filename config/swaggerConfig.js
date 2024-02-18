import SwaggerJsdoc from "swagger-jsdoc";

const options = {
	definition: {
		info: {
			title: "RE:memory",
			version: "1.0.0",
			description: "Rememory API 설명",
		},
		// host: "dev.mattie3e.store",
		host: "localhost:3000", //로컬 테스트용
		basepath: "../",
	},
	apis: [
		"./src/app/*/userRoute.js",
		"./src/app/*/pcapsuleRoute.js",
		"./src/app/*/rcapsuleRoute.js",
		"./src/app/*/healthRoute.js",
		"./swagger/*.yaml",
	],
};

export const specs = SwaggerJsdoc(options);

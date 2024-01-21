import SwaggerJsdoc from "swagger-jsdoc";

const options = {
	definition: {
		info: {
			title: "RE:memory",
			version: "1.0.0",
			description: "Rememory API 설명",
		},
		host: "localhost:3000",
		basepath: "../",
	},
	apis: ["./src/app/*/Route.js", "./swagger/*.yaml"],
};

export const specs = SwaggerJsdoc(options);

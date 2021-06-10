import swaggerJsDoc from 'swagger-jsdoc'
export {default as swaggerUI}  from 'swagger-ui-express'

const swaggerOptions = {
	swaggerDefinition: {
		info: {
			title: `Video Gallery API`,
			version: `1.0.1`,
		},
	},
	apis: [`./src/modules/video/video.controller.ts`, `./src/modules/auth/authentication.controller.ts`,
		`./src/modules/user/user.controller.ts`,
	],
}

export const swaggerDocs = swaggerJsDoc(swaggerOptions)
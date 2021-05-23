import express from 'express'

const app = express()

async function start() {
	app.listen(5000, () => {
		console.log(`server work`)
		console.log(`server workdd`)
	})
}

start()

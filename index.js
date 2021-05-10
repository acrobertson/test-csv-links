/// @ts-check
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import parse from 'csv-parse'
import { webkit } from 'playwright'
import { config } from 'dotenv'

config()

async function main() {
	// Parse input
	const args = process.argv.slice(2)

	if (args.length === 0) {
		console.log(chalk.red('Missing input file. Pass as arg.'))
		return
	}

	if (args.length > 1) {
		console.log(chalk.red('Too many args. Pass input file as only arg.'))
		return
	}

	const filename = args[0]

	if (filename == null) {
		console.log(chalk.red('Missing input file'))
		return
	}

	const filepath = path.resolve(filename)

	fs.stat(filepath, (err, stats) => {
		if (err) {
			console.error(err)
			return
		}

		if (!stats.isFile()) {
			console.error('input file is not a file')
			return
		}

		if (stats.size === 0) {
			console.error('input file is empty')
			return
		}
	})

	// create output file & stream
	try {
		if (!fs.existsSync('output')) {
			fs.mkdirSync('output')
		}

		fs.writeFileSync('output/successes.txt', '')
		fs.writeFileSync('output/errors.txt', '')
	} catch (err) {
		console.error(err)
		return
	}

	const successesWriteStream = fs.createWriteStream('./output/successes.txt')
	const errorsWriteStream = fs.createWriteStream('./output/errors.txt')

	// init CSV parser
	const parser = fs.createReadStream(filepath).pipe(
		parse({
			columns: true,
		})
	)

	const username = process.env.AUTH_USER
	const password = process.env.AUTH_PASS

	// init playwright
	const browser = await webkit.launch()
	const page = await browser.newPage({
		httpCredentials: {
			username,
			password,
		},
	})

	process.stdout.write('start\n')

	for await (const record of parser) {
		const url = record['staging url']

		const response = await page.goto(url)
		const status = response.status()
		const redirectedFrom = response.request().redirectedFrom()
		const redirectedTo = response.request().redirectedTo()
		let message = `Request URL: ${url}\nStatus: ${status}\nResponse URL: ${response.url()}\n`

		if (redirectedFrom && redirectedTo) {
			message += `Redirected From: ${redirectedTo}\nRedirectedTo: ${redirectedTo}`
		}

		if (response.ok()) {
			successesWriteStream.write(`${message}\n`)
			console.log(message)
		} else {
			errorsWriteStream.write(`${message}\n`)
			console.log(message)
		}
	}

	await browser.close()

	process.stdout.write('...done\n')
}

main()

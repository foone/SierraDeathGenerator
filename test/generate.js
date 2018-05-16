const puppeteer = require('puppeteer');

const fs = require('fs');
const util = require('util');
const path = require('path');
const readFile = util.promisify(fs.readFile);

(async () => {
	const browser = await puppeteer.launch({'args':['--allow-file-access-from-files'],'headless':true});
	const indexURL = 'file://' + path.resolve(__dirname,'../index.html') + '#';
	const origPage = await browser.newPage();
	await origPage.goto(indexURL)
	var generators = await origPage.evaluate('generators')
	var output={}
	for(let generator of Object.keys(generators)){
			let out = output[generator] = {}
			const page = await browser.newPage();

			//page.on('console', msg => console.log('PAGE LOG:', msg.text()));

			await page.goto(indexURL + generator);
			await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: './'});
			//await page.waitForFunction("$('#sourcetext').text('')")
			//await page.type('#sourcetext','hello');
			var image = await page.evaluate('getDataURLImage()')

			out['image']=image
			out['options'] = await page.evaluate('getOptions()')
	}
	await browser.close();
	console.log(JSON.stringify(output))
})();

const puppeteer = require('puppeteer');

const path = require('path');
const getStdin = require('get-stdin');

(async () => {
	const browser = await puppeteer.launch({'args':['--allow-file-access-from-files','--no-sandbox'],'headless':true});
	var testjson = await getStdin()
	var testinfo = JSON.parse(testjson)
	const indexURL = 'file://' + path.resolve(__dirname,'../index.html') + '#' + testinfo['generator'];
	var results = {}
	for (const name of Object.keys(testinfo['tests'])){
		const page = await browser.newPage();
		await page.goto(indexURL)
		var output={}
		await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: './'});
		var options = await page.evaluate("getOptions()") 
		await page.evaluate("fontInfo.scale=1")
		await page.evaluate('renderText()');
		var image = await page.evaluate('getDataURLImage()')
		results[name]={'image':image,'options':options}
		await page.close()
	}
	await browser.close();
	console.log(JSON.stringify(results))
})();

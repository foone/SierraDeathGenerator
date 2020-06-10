function makeGIF(context){
	var encoder = new GIFEncoder()
	encoder.setRepeat(0) 
	encoder.setDelay(200)
	encoder.start()
	var source = $('textarea#sourcetext')
	var fulltext = source.val()
	var stripped = fulltext
	if(/([_\uFF3F])(\s*)$/.test(stripped)){
		stripped = fulltext.replace(/\s+$/,'')
		// If the last character is an underscore, remove it since we're gonna add it back on
		stripped = stripped.substring(0, stripped.length - 1)
	}
	for(var i=0;i<10;i++){
		source.val(stripped + ((i&1) ? '\uFF3F' : ''))
		renderText(false)
		encoder.addFrame(context)
	}
	encoder.finish()
	source.val(fulltext)
	return URL.createObjectURL(new Blob([new Uint8Array(encoder.stream().bin)], {type : "image/gif" } ))
}
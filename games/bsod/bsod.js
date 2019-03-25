function makeGIF(context){
	var encoder = new GIFEncoder()
	encoder.setRepeat(0) 
	encoder.setDelay(200)
	encoder.start()
	var source = $('textarea#sourcetext')
	var fulltext = source.val()

	for(var i=0;i<10;i++){
		source.val(fulltext + ((i&1) ? '\uFF3F' : ''))
		renderText(false)
		encoder.addFrame(context)
	}
	encoder.finish()
	return URL.createObjectURL(new Blob([new Uint8Array(encoder.stream().bin)], {type : "image/gif" } ))
}
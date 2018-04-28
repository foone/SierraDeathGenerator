function makeGIF(context){
	var encoder = new GIFEncoder()
	encoder.setRepeat(0) 
	encoder.setDelay(100)
	encoder.start()
	var source = $('textarea#sourcetext')
	var fulltext = source.val()

	for(var i=0;i<fulltext.length+1;i++){
		source.val(fulltext.slice(0,i))
		$('#overlay-mouth').val('open')
		renderText(false)
		encoder.addFrame(context)
		$('#overlay-mouth').val('closed')
		renderText(false)
		encoder.addFrame(context)
	}
	encoder.setDelay(2000)
	encoder.addFrame(context)

	encoder.finish()
	return URL.createObjectURL(new Blob([new Uint8Array(encoder.stream().bin)], {type : "image/gif" } ))
}
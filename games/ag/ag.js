function makeGIF(context){
	var encoder = new GIFEncoder()
	encoder.setRepeat(0) 
	encoder.setDelay(100)
	encoder.start()
	var source = $('textarea#sourcetext')
	var fulltext = source.val()
	var colors=['red','white','blue']
	for(var i=0;i<9;i++){
		$('#overlay-stars').val(colors[i%colors.length])
		renderText(false)
		encoder.addFrame(context)
	}

	encoder.finish()
	return URL.createObjectURL(new Blob([new Uint8Array(encoder.stream().bin)], {type : "image/gif" } ))
}
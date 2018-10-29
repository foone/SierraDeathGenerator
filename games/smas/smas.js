function makeGIF(context){
	var encoder = new GIFEncoder()
	encoder.setRepeat(0) 
	encoder.setDelay(400)
	encoder.start()
	var source = $('textarea#sourcetext')
	var fulltext = source.val()
	for(var i=0;i<9;i++){
		var num=i%3
		source.val('[font'+(num+1)+']'+fulltext)
		renderText(false)
		encoder.addFrame(context)
	}
	encoder.finish()
	return URL.createObjectURL(new Blob([new Uint8Array(encoder.stream().bin)], {type : "image/gif" } ))
}
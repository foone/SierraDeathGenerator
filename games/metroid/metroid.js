function makeGIF(context){
	var encoder = new GIFEncoder()
	encoder.setRepeat(0) 
	encoder.setDelay(267)
	encoder.start()
	for(var i=1;i<=8;i++){
		$('#overlay-stars').val('stars'+i)
		renderText(false)
		encoder.addFrame(context)
	}
	encoder.finish()
	return URL.createObjectURL(new Blob([new Uint8Array(encoder.stream().bin)], {type : "image/gif" } ))
}
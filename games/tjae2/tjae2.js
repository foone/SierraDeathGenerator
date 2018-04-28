function makeGIF(context){
	var encoder = new GIFEncoder()
	encoder.setRepeat(0) 
	encoder.setDelay(133)
	encoder.start()
	for(var i=0;i<8;i++){
		$('#overlay-font').val('font1')
		renderText(false)
		encoder.addFrame(context)
		$('#overlay-font').val('font2')
		renderText(false)
		encoder.addFrame(context)
	}
	encoder.finish()
	return URL.createObjectURL(new Blob([new Uint8Array(encoder.stream().bin)], {type : "image/gif" } ))
}
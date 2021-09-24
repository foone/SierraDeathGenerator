function makeGIF(context){
	var encoder = new GIFEncoder()
	encoder.setRepeat(0) 
	// 10 frames between updates at 60 FPS: 0.17 milliseconds
	encoder.setDelay(170)
	encoder.start()
	const FRAMECOUNT = 8
	const REPEATS = 2
	
	for(var j=0;j<REPEATS;j++){
		for(var i=0;i<FRAMECOUNT;i++){
			$('#overlay-frame').val('loop_'+(1+i))
			renderText(false)
			encoder.addFrame(context)
		}
	}

	encoder.finish()
	return URL.createObjectURL(new Blob([new Uint8Array(encoder.stream().bin)], {type : "image/gif" } ))
}
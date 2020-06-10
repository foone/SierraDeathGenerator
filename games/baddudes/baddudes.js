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
	/* Twitter MP4 Fix:
	   Twitter drops the last frame of MP4 files, so on desktop these will loop too fast.
	   We don't just show the last frame twice with full length, because mobile does 
	   NOT drop the last frame, and therefore the last frame delay would be twice as long 
	   there. This gives us a very tiny difference between mobile and desktop, which should 
	   be fine. */
	encoder.setDelay(20)
	encoder.addFrame(context)

	encoder.finish()
	return URL.createObjectURL(new Blob([new Uint8Array(encoder.stream().bin)], {type : "image/gif" } ))
}
function makeGIF(context){
	var encoder = new GIFEncoder()
	encoder.setRepeat(0) 
	encoder.setDelay(33)
	encoder.start()
	var source = $('textarea#sourcetext')
	var fulltext = source.val()
	var portrait = $('#overlay-portrait').val()
	portrait = portrait.substring(0, portrait.length-1)
	var portrait_closed = portrait + '1'
	var portrait_open = portrait + '2'
	for(var i=0;i<fulltext.length+1;i++){
		source.val(fulltext.slice(0,i))
		$('#overlay-portrait').val(portrait + ((Math.round(i/4)%2)+1))
		renderText(false)
		encoder.addFrame(context)
	}
	$('#overlay-portrait').val(portrait+'1')
	renderText(false)
	encoder.setDelay(2000)
	encoder.addFrame(context)

	encoder.finish()
	return URL.createObjectURL(new Blob([new Uint8Array(encoder.stream().bin)], {type : "image/gif" } ))
}
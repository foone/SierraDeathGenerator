function make_blanks_version(s){
	return s.replace(/[^ \n]/gi,' ')
}

function makeGIF(context){
	var encoder = new GIFEncoder()
	encoder.setRepeat(0) 
	encoder.setDelay(100)
	encoder.start()
	var source = $('textarea#sourcetext')
	var fulltext = source.val()
	var blankstext = make_blanks_version(fulltext)
	source.val(blankstext);
	fontInfo['hooks']['border']='border_sides="fffffffff"' // Hide the border complete
	for(var i=0;i<2;i++){ //Two frames with no border
		renderText(false) 
		encoder.addFrame(context)
	}

	// Slowly lower the border
	var numlines = Math.max(5,fulltext.split(/\n/).length)
	console.log(fulltext.split(/\n/))
	for(var i=0;i<numlines;i++){
		fontInfo['hooks']['border']='border_sides="ttttttfff";bh='+(21+(i*16))
		renderText(false)
		encoder.addFrame(context)
	}
	// Re-enable the whole border
	fontInfo['hooks']['border']='border_sides="ttttttttt"'
	renderText(false)
	encoder.addFrame(context)
	for(var i=0;i<fulltext.length+1;i++){
		source.val(fulltext.slice(0,i)+blankstext.slice(i))
		renderText(false)
		encoder.addFrame(context)
	}
	// Twitter likes to ignore long frames and glitch them when it converts them to mp4, so we just add A BUNCH OF IDENTICAL FRAMES
	for (var i=0;i<16;i++){
		renderText(false)
		encoder.addFrame(context)
	}

	encoder.finish()
	return URL.createObjectURL(new Blob([new Uint8Array(encoder.stream().bin)], {type : "image/gif" } ))
}
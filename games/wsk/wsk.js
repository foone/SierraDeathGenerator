function make_blanks_version(s){
	return s.replace(/[^ \n]/gi,'_')
}

function makeGIF(context){
	var encoder = new GIFEncoder()
	encoder.setRepeat(0) 
	encoder.setDelay(50)
	encoder.start()
	var source = $('textarea#sourcetext')
	var lines = renderText(false,true).plainLines()
	var fulltext = lines.join('\n')
	var blankstext = make_blanks_version(fulltext)


	for(var i=1;i<fulltext.length+1;i++){
		if(fulltext.charAt(i)==' '){
			// Skip a blank character. But just one: if there's more than one, we only skip one. 
			i++;
		}else if(fulltext.charAt(i-1)=='\n'){
			// Pause for 11 (GIF) frames, 33 frames at NTSC 60 FPS
			for(var pause=0;pause<11;pause++){
				renderText(false)
				encoder.addFrame(context)
			}
			continue;
		}
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
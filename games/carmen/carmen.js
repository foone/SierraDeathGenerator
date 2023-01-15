
function makeGIF(context){
	var encoder = new GIFEncoder()
	encoder.setRepeat(0) 
	encoder.setDelay(25)
	encoder.start()
	var source = $('textarea#sourcetext')
	var real_fulltext = source.val()
	var fulltext = real_fulltext
	var old_font_hook = fontInfo['hooks']['font']
	fontInfo['hooks']['font'] = ''
	var fonts={
		'main': new BitmapFont(fontInfo, fontImage)
	}
	var customWrapper = new FontManager(context, fulltext, fonts, {})
	var old_wordwrap_checked = $('#wordwrap').prop('checked')
	if(old_wordwrap_checked){
		customWrapper.wordwrap(fontInfo['wrap-width'])
	}
	function renderWithPauseIf(should_pause){
		for(var pause=0;pause<(should_pause?15:1);pause++){
			renderText(false)
			encoder.addFrame(context)
		}
	}
	var out=''
	for(const line of customWrapper.lines){
		for(const snippet of line.snippets){
			var txtlen = snippet.text.length
			for(var i=0;i<txtlen;i++){
				out+=snippet.text.slice(i,i+1)
				source.val(out+"\u{E000}")
				renderWithPauseIf(out.charAt(out.length-1)==',')
			}
			if(txtlen==0){
				renderWithPauseIf(true)
			}
		}
		out+='\n'
		source.val(out+"\u{E000}")
		renderWithPauseIf(out.length>1 && out.charAt(out.length-2)=='\n')

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
	source.val(real_fulltext)
	renderText(false)
	fontInfo['hooks']['font'] = old_font_hook
	$('#wordwrap').prop('checked',old_wordwrap_checked)
	return URL.createObjectURL(new Blob([new Uint8Array(encoder.stream().bin)], {type : "image/gif" } ))
}
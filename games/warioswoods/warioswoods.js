function makeGIF(context){
	var encoder = new GIFEncoder()
	encoder.setRepeat(0) 
	encoder.start()
	var source = $('textarea#sourcetext')
	var fulltext = source.val()
	var changes = {
	}
	function setSubValueAtFrame(frame, subvalue, key, value){
		var update;
		if(frame in changes){
			update=changes[frame]
			if (!(subvalue in update)){
				update[subvalue]={}
			}
		}else{
			update=changes[frame]={}
			update[subvalue]={}
		}
		update[subvalue][key]=value
	}
	function setOverlayAtFrame(frame, overlay, value){
		setSubValueAtFrame(frame,'overlays',overlay,value)
	}
	function setHookAtFrame(frame, hook, value){
		setSubValueAtFrame(frame,'hooks',hook,value)
	}
	var changes={
		0:{
			'source':'',
			'overlays':{
				'mouth':'closed',
				'arm':'down',
				'word_balloon':0,
				'more_arrow':'hidden',
				'toad':1
			}
		}
	}
	var swings={
		0:1,1:2,2:3,
		8:1,14:2,15:3,
		21:1,27:2,28:3,
		34:1,40:2,41:3,
		47:1
	}
	for(var i=0;i<48;i++){
		if(i in swings){
			setOverlayAtFrame(i,'toad',swings[i])
		}
		setHookAtFrame(i,'font','overlays.toad.x='+(i+1))
	}
	
	setOverlayAtFrame(49,'word_balloon','1')
	setOverlayAtFrame(50,'word_balloon','2')
	setOverlayAtFrame(51,'word_balloon','3')
	setOverlayAtFrame(52,'word_balloon','4')
	setOverlayAtFrame(53,'word_balloon','5')
	
	var mouth = 'open';
	for(var i=0;i<fulltext.length+1;i++){
		if(i>1 && fulltext[i-1]!=' '){
			mouth = (mouth=='open') ? 'closed' : 'open';
			
		}
		changes[54+i*3]={
			'source':fulltext.slice(0,i),
			'overlays':{
				'mouth':mouth
			}
		}
	}
	
	
	for(var i=0;i<4;i++){
		var base=55+i*63
		setOverlayAtFrame(base+0,'arm','mid')
		setOverlayAtFrame(base+7,'arm','up')
		setOverlayAtFrame(base+31,'arm','mid')
		setOverlayAtFrame(base+39,'arm','down')
	}
	var more_arrow = $('#overlay-more_arrow').val() == 'shown'
	if(more_arrow){
		for(var i=0;i<=8;i++){
			var base=127 + i*34;
			setOverlayAtFrame(base,'more_arrow','shown')
			setOverlayAtFrame(base+17,'more_arrow','hidden')
		}
		// Make sure it's shown at the end
		setOverlayAtFrame(405,'more_arrow','shown')
	}

	
	// The Twitter mp4 fix hacked into the frames system.
	changes[404]={}
	changes[405]={}
	var frames=Object.keys(changes);
	frames.sort(function(a,b){return parseInt(a,10)-parseInt(b,10)})
	
	
	for(var i=0;i<frames.length-1;i++){
		var nextFrame = frames[i+1];
		var thisFrame = frames[i];
		var delay=1000/60.0 * (nextFrame-thisFrame);
		encoder.setDelay(delay)
		var frame=changes[thisFrame];
		if('source' in frame){
			source.val(frame.source)
		}
		if('overlays' in frame){
			for(const [key,value] of Object.entries(frame.overlays)){
				$('#overlay-'+key).val(value)
			}
		}
		if('hooks' in frame){
			for(const [key,value] of Object.entries(frame.hooks)){
				fontInfo['hooks'][key]='{'+value+'}';
			}
		}
		renderText(false)
		encoder.addFrame(context)
	}
	encoder.finish()
	return URL.createObjectURL(new Blob([new Uint8Array(encoder.stream().bin)], {type : "image/gif" } ))
}
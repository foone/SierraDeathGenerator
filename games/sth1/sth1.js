var FRAMES=[
	{
		"blorb": {
			"x": 320,
		},
		"zone": {
			"x": -320
		},
		"act": {
			"x": 320
		},
		"!originx": "-624"
	},
	{
		"blorb": {
			"x": 313,
		},
		"!originx": -64
	},
	{
		"blorb": {
			"x": 297,
		},
		"!originx": -48
	},
	{
		"blorb": {
			"x": 281,
		},
		"!originx": -32
	},
	{
		"blorb": {
			"x": 265,
		},
		"!originx": -16
	},
	{
		"blorb": {
			"x": 249,
		},
		"!originx": 0
	},
	{
		"blorb": {
			"x": 233,
		},
		"!originx": 16
	},
	{
		"blorb": {
			"x": 217,
		},
		"!originx": 32
	},
	{
		"blorb": {
			"x": 201,
		},
		"!originx": 48
	},
	{
		"blorb": {
			"x": 185,
		},
		"!originx": 64
	},
	{
		"!originx": 80
	},
	{
		"!originx": 96
	},
	{
		"!originx": 112
	},
	{
		"!originx": 128
	},
	{
		"!originx": 144
	},
	{
		"!originx": 160
	},
	{},
	{},
	{},
	{},
	{
		"zone": {
			"x": -52
		}
	},
	{
		"zone": {
			"x": -36
		}
	},
	{
		"zone": {
			"x": -20
		}
	},
	{
		"zone": {
			"x": -4
		}
	},
	{
		"zone": {
			"x": 12
		}
	},
	{
		"zone": {
			"x": 28
		}
	},
	{
		"zone": {
			"x": 44
		}
	},
	{
		"zone": {
			"x": 60
		}
	},
	{
		"zone": {
			"x": 76
		}
	},
	{
		"zone": {
			"x": 92
		}
	},
	{
		"zone": {
			"x": 108
		}
	},
	{
		"zone": {
			"x": 124
		}
	},
	{
		"zone": {
			"x": 140
		}
	},
	{
		"zone": {
			"x": 156
		}
	},
	{
		"act": {
			"x": 304
		}
	},
	{
		"act": {
			"x": 288
		}
	},
	{
		"act": {
			"x": 272
		}
	},
	{
		"act": {
			"x": 256
		}
	},
	{
		"act": {
			"x": 240
		}
	},
	{
		"act": {
			"x": 224
		}
	},
	{
		"act": {
			"x": 208
		}
	},
	{
		"act": {
			"x": 192
		}
	}
]

function makeGIF(context){
	var encoder = new GIFEncoder()
	encoder.setRepeat(0) 
	encoder.setDelay(17)
	encoder.start()
	parts = []
	var old_pre_overlays = fontInfo['hooks']['pre-overlays']
	for(var i=0;i<FRAMES.length;i++){
		var frame = FRAMES[i];
		for (const [overlay_name, adjustments] of Object.entries(frame)) {
			if(overlay_name.startsWith("!")){
				var without_sigil = overlay_name.substring(1)
				parts.push(`${without_sigil}=${adjustments}`)
			}else{
				for (const [property_name, new_value] of Object.entries(adjustments)) {
					parts.push(`overlays.${overlay_name}.${property_name}=${new_value}`)
				}
			}
		}
		var partstr = parts.join(";")
		fontInfo['hooks']['font'] = partstr
		fontInfo['hooks']['pre-overlays'] = ''
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
	fontInfo['hooks']['pre-overlays'] = old_pre_overlays
	fontInfo['hooks']['font']=''
	return URL.createObjectURL(new Blob([new Uint8Array(encoder.stream().bin)], {type : "image/gif" } ))
}
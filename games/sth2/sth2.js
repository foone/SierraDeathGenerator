var FRAMES=[
	{
		"blue_background": {
			"y": -224
		},
		"yellow_background": {
			"x": 320
		},
		"red_background": {
			"x": -256
		},
		"zone_number": {
			"x": -88
		},
		"!originx": "624"
	},
	{
		"blue_background": {
			"y": -208
		}
	},
	{
		"blue_background": {
			"y": -192
		}
	},
	{
		"blue_background": {
			"y": -176
		}
	},
	{
		"blue_background": {
			"y": -160
		}
	},
	{
		"blue_background": {
			"y": -144
		}
	},
	{
		"blue_background": {
			"y": -128
		}
	},
	{
		"blue_background": {
			"y": -112
		}
	},
	{
		"blue_background": {
			"y": -96
		},
		"yellow_background": {
			"x": 304
		}
	},
	{
		"blue_background": {
			"y": -80
		},
		"yellow_background": {
			"x": 288
		}
	},
	{
		"blue_background": {
			"y": -64
		},
		"yellow_background": {
			"x": 272
		}
	},
	{
		"blue_background": {
			"y": -48
		},
		"yellow_background": {
			"x": 256
		}
	},
	{
		"blue_background": {
			"y": -32
		},
		"yellow_background": {
			"x": 240
		}
	},
	{
		"blue_background": {
			"y": -16
		},
		"yellow_background": {
			"x": 224
		}
	},
	{
		"blue_background": {
			"y": 0
		},
		"yellow_background": {
			"x": 208
		}
	},
	{
		"yellow_background": {
			"x": 192
		}
	},
	{
		"yellow_background": {
			"x": 176
		}
	},
	{
		"yellow_background": {
			"x": 160
		}
	},
	{
		"yellow_background": {
			"x": 144
		}
	},
	{
		"yellow_background": {
			"x": 128
		}
	},
	{
		"yellow_background": {
			"x": 112
		}
	},
	{
		"yellow_background": {
			"x": 96
		},
		"red_background": {
			"x": -96
		}
	},
	{
		"yellow_background": {
			"x": 80
		},
		"red_background": {
			"x": -80
		}
	},
	{
		"yellow_background": {
			"x": 64
		},
		"red_background": {
			"x": -64
		}
	},
	{
		"yellow_background": {
			"x": 48
		},
		"red_background": {
			"x": -48
		},
		"!originx": "624"
	},
	{
		"yellow_background": {
			"x": 32
		},
		"red_background": {
			"x": -32
		},
		"!originx": "608"
	},
	{
		"yellow_background": {
			"x": 16
		},
		"red_background": {
			"x": -16
		},
		"!originx": "592"
	},
	{
		"yellow_background": {
			"x": 0
		},
		"red_background": {
			"x": 0
		},
		"!originx": "576"
	},
	{
		"zone_number": {
			"x": -71
		},
		"!originx": "560"
	},
	{
		"zone_number": {
			"x": -55
		},
		"!originx": "544"
	},
	{
		"zone_number": {
			"x": -39
		},
		"!originx": "528"
	},
	{
		"zone_number": {
			"x": -23
		},
		"!originx": "512"
	},
	{
		"zone_number": {
			"x": -7
		},
		"!originx": "496"
	},
	{
		"zone_number": {
			"x": 9
		},
		"!originx": "480"
	},
	{
		"zone_number": {
			"x": 25
		},
		"!originx": "464"
	},
	{
		"zone_number": {
			"x": 41
		},
		"!originx": "448"
	},
	{
		"zone_number": {
			"x": 57
		},
		"!originx": "432"
	},
	{
		"zone_number": {
			"x": 73
		},
		"!originx": "416"
	},
	{
		"zone_number": {
			"x": 89
		},
		"!originx": "400"
	},
	{
		"zone_number": {
			"x": 105
		},
		"!originx": "384"
	},
	{
		"zone_number": {
			"x": 121
		},
		"!originx": "368"
	},
	{
		"zone_number": {
			"x": 137
		},
		"!originx": "352"
	},
	{
		"zone_number": {
			"x": 153
		},
		"!originx": "336"
	},
	{
		"zone_number": {
			"x": 169
		},
		"!originx": "320"
	},
	{
		"zone_number": {
			"x": 185
		},
		"!originx": "304"
	},
	{
		"zone_number": {
			"x": 201
		},
		"!originx": "288"
	}

]

function makeGIF(context){
	var encoder = new GIFEncoder()
	encoder.setRepeat(0) 
	encoder.setDelay(17)
	encoder.start()
	parts = []
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
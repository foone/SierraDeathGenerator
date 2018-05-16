var canvas = document.querySelector('canvas#death')
var context = canvas.getContext('2d')
var baseImage = null
var fontImage = null
var fontInfo = null
var overlayNames = null
var overlayOverrides = null
var selectedGenerator = 'pq2'

if(window.location.hash.length > 0){
	selectedGenerator = window.location.hash.substr(1)
}

function first(){
	for(var i=0;i<arguments.length;i++){
		if(arguments[i] !== undefined){
			return arguments[i]
		}
	}
}

class BitmapFont {
	constructor(info, image) {
		this.info = info
		this.image = image
		this.y = info.origin.y
	}
}

class NewLine{
	constructor(){
		this.type = 'NewLine'
	}
}

class LineGroup{
	constructor(firstLine){
		this.firstLine=firstLine
		this.snippets = []
		this.height = 0 
	}

	add(snippet){
		this.snippets.push(snippet)
		this.height = Math.max(this.height, snippet.getHeight(this.firstLine))
	}

	getWidth(){
		var w=0
		for(var snippet of this.snippets){
			w+=snippet.getWidth()
		}
		return w
	}

	getHeight(){
		return this.height
	}

	isEmpty(){
		return this.snippets.length == 0 
	}

	draw(context, scale, xStart, y){
		var x = xStart
		for(let snippet of this.snippets){
			x = snippet.draw(context, scale, x, y)
		}
	}
}

class Snippet{
	constructor(font, text){
		this.type = 'Snippet'
		this.font = font
		this.text = text
	}

	draw(context, scale, xStart, y){
		var x=xStart
		for(let char of this.parse()){
			context.drawImage(this.font.image,char.x,char.y,char.w,char.h,x*scale,y*scale,char.w*scale,char.h*scale)
			x+=char.w
		}
		return x
	}

	parse(fontOriginY=0){
		var out=[]
		var font = this.font.info
		var defaultInfo = first(font.default, {})
		// FIXME: can doing uppercase/lowercase break astral codepoints?
		var line = this.text
		if(font['case-fold'] == 'upper'){
			line = line.toUpperCase()
		}else if(font['case-fold'] == 'lower'){
			line = line.toLowerCase()
		}
		for(var i=0;i<line.length;i++){
			var c=line.charCodeAt(i)
			if(c>= 0xD800 && c<=0xDBFF){
				c = line.codePointAt(i)
				i++; // Can this be more than 2? ARG JS UNICODE IS BAD
			}
			var info=font[c]
			if(info==null){
				info=font[font["null-character"]]
			}
			out.push({
				'x': first(info.x, defaultInfo.x),
				'y': first(info.y, defaultInfo.y, fontOriginY),
				'w': first(info.w, defaultInfo.w),
				'h': first(info.h, defaultInfo.h)
			})
		}
		return out
	}

	getWidth(){
		var w=0
		for(var char of this.parse()){
			w += char.w
		}
		return w
	}

	getHeight(firstLine){
		var info = this.font.info
		if(firstLine){
			return first(info['first-height'], info['height'])
		}else{
			return info['height']
		}
	}

}

class FontManager{
	constructor(context, text, fonts) {
		this.context = context
		this.text = text
		this.fonts = fonts
		this.lines = this.applyMarkup()
	}

	splitSnippet(font, text ){
		var parts = text.split(/(\n)/)
		var out=[]
		for(var part of parts){
			if(part=='\n'){
				out.push(new NewLine())
			}else{
				out.push(new Snippet(font, part))
			}
		}
		return out
	}

	buildLines(pieces){
		var out=[]
		var line = new LineGroup(true)
		for(var piece of pieces){
			if(piece instanceof NewLine){
				out.push(line)
				line = new LineGroup(false)
			}else{
				line.add(piece)
			}
		}
		if(!line.isEmpty()){
			out.push(line)
		}
		return out
	}

	applyMarkup(){
		var parts = this.text.split(/\[(\/?[a-zA-Z0-9]*)\]/)
		parts.unshift('/')
		var out=[]
		for(var i=0;i<parts.length;i+=2){
			var marker = parts[i]
			var text = parts[i+1]
			if(text!==''){ // Skip empty text segments
				if(marker.startsWith('/')){
					marker='main'
				}
				if(!(marker in this.fonts)){
					marker='main'
				}
				for(var snippet of this.splitSnippet(this.fonts[marker], text)){
					out.push(snippet)
				}
			}
		}
		return this.buildLines(out)
	}

	getHeight(){
		var height = 0
		for(var line of this.lines){
			height += line.getHeight()
		}
		return height
	}

	getWidth(){
		var width = 0 
		for(var line of this.lines){
			width = Math.max(width,line.getWidth())
		}
		return width
	}
	
	draw(mainFont, scale, originx, justify, fontOriginY){
		var y = mainFont.y
		if(justify=='v-center'){
			y -= Math.floor(this.getHeight()/2)
		}
		for(var line of this.lines){
			var x = originx
			if(justify == 'center'){
				x = originx - Math.floor(line.getWidth()/2)
			}
			line.draw(this.context, scale, x, y)
			y+=line.getHeight()
		}
	}

}


function hideGenerators(){
	$('a#hidelink').hide()
	$('a#showlink').show()
	$('#genlist').hide()
}

for(key in generators) {
	if(generators.hasOwnProperty(key)) {
		$('#genlist').append($('<a class="f6 link dim ph3 pv2 mb2 dib white bg-dark-gray"></a>').attr("href",'#'+key).text(generators[key].title).data('generator',key).click(function (){
			selectedGenerator=$(this).data('generator')
			selectGenerator()
		})).append(' ')
	}
}

function isAnyDefaultText(text){
	for(key in generators) {
		if(generators.hasOwnProperty(key)) {
			if(generators[key].defaulttext == text){
				return true
			}
		}
	}
	return false
}

function selectGenerator(){

	var gen=generators[selectedGenerator]
	window.location.hash=selectedGenerator
	if(gen === undefined){
		gen={
			title:'placeholder',
			defaulttext: '',
			sourceurl:'',
			source:'UNKNOWN'
		}
	}

	$('button.generator-switcher').each(function(){
		$(this).prop('disabled',$(this).data('generator')==selectedGenerator)
	})

	$('.change-title').text(gen.title + " Generator");
	$('.change-source').attr('href',gen.sourceurl).text(gen.source)
	if(gen['contributor']){
		if(gen['contributorurl']){
			$('#extra-contrib').text(' and ').append(
				$('<a>').attr('href',gen['contributorurl']).text(gen['contributor'])
			)
		}else{
			$('#extra-contrib').text(' and ' + gen['contributor'])
		}
	}else{
		$('#extra-contrib').text('')
	}
	var sourcetext = $('#sourcetext');

	if(sourcetext.text().length==0 || isAnyDefaultText(sourcetext.text())){
		$('#sourcetext').text(gen.defaulttext)
	}

	$('#throbber').hide()
	$('#uploading').hide()
	$('a#upload').show()

	fontInfo=null // Prevent flash of gibberish when switching images
	loadJSONForGenerator()
	$('.source').remove();

	gamesPath = 'games/' + selectedGenerator + '/'
	baseImage = $('<img id="template" class="source" />').attr('src', gamesPath + selectedGenerator + '-blank.png').appendTo('body')[0]
	fontImage = $('<img id="font" class="source" />').attr('src', gamesPath + selectedGenerator + '-font.png').appendTo('body')[0]

	baseImage = null
	$('.source').waitForImages(true).done(function(){
		baseImage=$('img#template')[0]
		//fontImage=$('img#font')[0]
		renderText()
	});


}

function parseOverlays(fontInfo){
	var overlays = {}
	if ('overlays' in fontInfo) {
		for(var i=0;i<overlayNames.length;i++){
			var oname=overlayNames[i]
			var currentOverlay=fontInfo.overlays[oname]

			var sname = $('#overlay-'+oname+' option:selected').text()
			var adv=currentOverlay.options[sname]

			overlays[oname] = {
				"name":sname,
				"x":currentOverlay.x,
				"y":currentOverlay.y,
				"w":adv.w,
				"h":adv.h,
				"blend":first(currentOverlay['blend-mode'], 'source-over'),
				"stage":first(currentOverlay.stage, "pre-text"),
				"source":{
					"x":adv.x,
					"y":adv.y
				}
			}

		}
	}
	return overlays
}

function getOptions(){
	let opts = {
		'main-text': $('#sourcetext').val()
	};
	$('select').each(function(_,e){
		opts[$(e).attr('id').split('-',2)[1]] = $(e).val()
	});
	return opts;
}

function setOptions(opts){
	$('#sourcetext').val(opts['main-text'])

	$('select').each(function(_,e){
		$(this).val(opts[$(e).attr('id').split('-',2)[1]])
	});
	return opts;
}

function getAllPossibleOptions(){
	let opts={}
	$('select').each(function(_,e){
		let sopt = opts[$(e).attr('id').split('-',2)[1]] = []
		$(this).find('option').each(function(_,o){
			sopt.push($(o).val())
		})
	});

	return opts;
}

function twitterifyCanvas(context){
	var pixel = context.getImageData(0,0,1,1)
	if(pixel.data[3]==255){
		pixel.data[3]=254
	}
	context.putImageData(pixel,0,0)
}

function renderText(scaled = true){
	if(fontInfo == null || baseImage == null){
		return
	}

	// Define the top-level font
	var mainFont = new BitmapFont(fontInfo, fontImage)
	var fonts={
		'main': mainFont
	}
	if('subfonts' in fontInfo){
		for(var key of Object.keys(fontInfo.subfonts)){
			fonts[key] = new BitmapFont(fontInfo.subfonts[key], fontImage)
		}
	}
	var originx = first(fontInfo.origin.x, 0)

	var overlays = parseOverlays(fontInfo)

	var rawtext = document.querySelector("textarea#sourcetext").value

	function switchFont(newFont){
		rawtext = '[' + newFont + ']' + rawtext
	}

	if('hooks' in fontInfo && 'font' in fontInfo['hooks']){
		eval(fontInfo.hooks.font)
	}

	var fontManager = new FontManager(context, rawtext, fonts)

	var justify = first(fontInfo.justify, 'left')

	var textbox={
		w: fontManager.getWidth(),
		h: fontManager.getHeight()
	}
	if(justify == 'center-box'){
		originx -= Math.floor(textbox.w/2)
	}


	var outputSize={
		w:baseImage.width,
		h:baseImage.height
	}
	if('dynamic-size' in fontInfo){
		outputSize.w = eval(fontInfo['dynamic-size'].w)
		outputSize.h = eval(fontInfo['dynamic-size'].h)
	}
	var buffer = 10
	var browserScale = $(window).width() / (outputSize.w + buffer)

	var fontScale = first(fontInfo.scale, 2);

	var scale = Math.min(browserScale, fontScale)
	if(!scaled){
		scale = fontScale
	}
	

	context.canvas.width = outputSize.w * scale
	context.canvas.height = outputSize.h * scale
	if(scale == 2.0){
		context.imageSmoothingEnabled = false
	}

	function drawOverlays(stage){
		Object.keys(overlays).forEach(function (key) {
			var adv = overlays[key]
			if(adv.stage == stage){
				context.globalCompositeOperation = adv.blend
				if(key in overlayOverrides){
					var img = overlayOverrides[key]
					context.drawImage(img,0,0,img.width,img.height,adv.x*scale,adv.y*scale,adv.w*scale,adv.h*scale)
				}else{
					context.drawImage(fontImage,adv.source.x,adv.source.y,adv.w,adv.h,adv.x*scale,adv.y*scale,adv.w*scale,adv.h*scale)
				}
			}
		})
		context.globalCompositeOperation = "source-over"
	}

	// Clear before drawing, as transparents might get overdrawn
	context.clearRect(0, 0, canvas.width, canvas.height)
	context.drawImage(baseImage, 0, 0, baseImage.width*scale, baseImage.height*scale)

	drawOverlays('pre-border')

	if('border' in fontInfo) {
		var bw=outputSize.w,bh=outputSize.h
		var border_x = first(fontInfo.border.x, 0)
		var border_y = first(fontInfo.border.y, 0)
		if('hooks' in fontInfo && 'border' in fontInfo['hooks']){
			// EVAL IS SAFE CODE, YES?
			eval(fontInfo['hooks']['border'])
		}
		buildBorder(fontImage,fontInfo,bw,bh)
		var bordercanvas = document.querySelector('canvas#border')
		context.drawImage(bordercanvas,0,0,bw,bh,border_x*scale,border_y*scale,bw*scale, bh*scale)
	}

	if('hooks' in fontInfo && 'pre-overlays' in fontInfo['hooks']){
		// EVAL IS SAFE CODE, YES?
		eval(fontInfo['hooks']['pre-overlays'])
	}


	drawOverlays('pre-text')


	var fontOriginY=0

	if('hooks' in fontInfo && 'pre-text' in fontInfo['hooks']){
		// EVAL IS SAFE CODE, YES?
		eval(fontInfo['hooks']['pre-text'])
	}
	fontManager.draw(mainFont, scale, originx, justify, fontOriginY)


	twitterifyCanvas(context)
}



function buildBorder(fontImage,fontInfo,w,h){

	function drawBorderPiece(x,y,piece){
		bctx.drawImage(fontImage,piece.x,piece.y,piece.w,piece.h,x,y,piece.w,piece.h)
	}
	var bctx = document.querySelector('canvas#border').getContext('2d')
	if(bctx.canvas.width == w && bctx.canvas.height == h){
		return
	}
	bctx.canvas.width = w
	bctx.canvas.height = h
	var border = fontInfo.border
	// todo: support styles other than "copy", like "stretch"

	// Draw center
	if(border.c.mode=='stretch'){
		var piece = border.c
		bctx.drawImage(fontImage,
			piece.x,piece.y,piece.w,piece.h,
			border.l.w,border.t.h,
			w-border.l.w-border.r.w,h-border.b.h-border.t.h
		)
	}else{
		for(var x=border.l.w;x<w-border.r.w;x+=border.c.w){
			for(var y=border.t.h;y<h-border.b.h;y+=border.c.h){
				drawBorderPiece(x,y,border.c)
			}
		}
	}

	// Draw top-center edge
	for(var x=border.tl.w;x<w-border.tr.w;x+=border.t.w){
		drawBorderPiece(x,0,border.t)
	}
	// Draw bottom-center edge
	for(var x=border.bl.w;x<w-border.br.w;x+=border.b.w){
		drawBorderPiece(x,h-border.b.h,border.b)
	}
	// Draw left edge
	for(var y=border.tl.h;y<h-border.bl.h;y+=border.l.h){
		drawBorderPiece(0,y,border.l)
	}
	// Draw right edge
	for(var y=border.tr.h;y<h-border.br.h;y+=border.r.h){
		drawBorderPiece(w-border.r.w,y,border.r)
	}

	// Top-Left corner
	drawBorderPiece(0,0,border.tl)
	// Top-Right corner
	drawBorderPiece(w-border.tr.w,0,border.tr)

	// Bottom-Left corner
	drawBorderPiece(0,h-border.bl.h,border.bl)

	// Bottom-Right corner
	drawBorderPiece(w-border.br.w,h-border.br.h,fontInfo.border.br)

}

function resetOverlays(){
	overlayOverrides = {}
	overlayNames = []
	$('.overlays p').remove()
	if('overlays' in fontInfo){
		var overlays = fontInfo.overlays
		for(key in overlays) {
			if(overlays.hasOwnProperty(key)) {
				overlayNames.push(key)
				var overlay = overlays[key]
				var pwrapper=$("<p>").text(overlay.title+': ')
				if(overlay.title ==''){
					// Internal effect, don't show to the user
					pwrapper.addClass('internal-overlay')
				}
				var select = $('<select class="overlay-selector">').attr('id','overlay-'+key)
				for(opt in overlay.options){
					if(overlay.options.hasOwnProperty(opt)){
						$('<option>').text(opt).prop('selected',opt==overlay['default']).appendTo(select)
					}
				}
				select.appendTo(pwrapper)
				if('replaceable' in overlay){
					var uploadlabel=$(' <label>Replace image:</label>')
					var upload=$('<input type="file" class="overlay-replacement" accept="image/*"/>').attr('id','replace-'+key)
					upload.appendTo(uploadlabel)
					uploadlabel.appendTo(pwrapper)
				}
				pwrapper.appendTo($('.overlays'))
			}
		}
	}
	$('.overlays select').change(renderText)
	$('.overlay-replacement').change(function(){
		// from http://jsfiddle.net/influenztial/qy7h5/
		var name = $(this).attr('id').split('-',2)[1]
		var reader = new FileReader();
	    reader.onload = function(event){
	        var img = new Image();
	        img.onload = function(){
	        	var overrideCanvas = $('<canvas class="source">').attr('width',img.width).attr('height',img.height).appendTo($('.overlays p'))[0]
	        	var octx = overrideCanvas.getContext('2d')
	        	octx.drawImage(img,0,0)
		        overlayOverrides[name]=overrideCanvas
			    renderText()
	        }
	        img.src = event.target.result;
	    }
	    reader.readAsDataURL(this.files[0]);
	})

}

function loadJSONForGenerator(){

	gamesPath = 'games/' + selectedGenerator + '/'
	$.getJSON(gamesPath + selectedGenerator + ".json",function(data){
		fontInfo = data
		resetOverlays()
		renderText()
		if(fontInfo.gif){
			$('#makegif').show()
		}else{
			$('#makegif').hide()
		}
		if(fontInfo.script){
			$.getScript(gamesPath + selectedGenerator + ".js");
		}
	})

}

function getNameForCurrentImage(ext){
	var text = document.querySelector("textarea#sourcetext").value
	text = text.replace(/\n/g," ").replace(/[^-._a-zA-Z0-9 ]/g,"")
	return selectedGenerator + "-" + text + "." + ext
}


selectGenerator()
$('#sourcetext').keyup(renderText)
$(window).resize(function () { renderText() });

function getDataURLImage(){
	// generate an unscaled version
	renderText(false)
	return context.canvas.toDataURL('image/png')

}

$('#save').click(function(){
	this.href = getDataURLImage()
	this.download = getNameForCurrentImage("png")
	return true
})
$('a#upload').click(function(){
	renderText(false)
	var imgdata = context.canvas.toDataURL('image/png').split(',',2)[1]
	$(this).hide()
	$('#throbber').show()
	$('#uploading').text('Uploading...').show()

	$.ajax({
		url: 'https://api.imgur.com/3/image',
		type: 'POST',
		headers: {
			Authorization: 'Client-ID 68dc4ab71488809',
			Accept: 'application/json'
		},
		data: {
			image: imgdata,
			type: 'base64',
			name: 'upload.png'
		},
		success: function(result) {
			$('#throbber').hide()
			if(result.success && result.data.link){
				var link = result.data.link;
				$('#uploading').text('Uploaded to ').append(
					$('<a>').attr('href',link).text(link)
				)
			}else{
				$('#uploading').text('Error uploading to imgur!')
			}
		},
		error: function(result) {
			$('#throbber').hide()
			$('#uploading').text('Error uploading to imgur!')
		}
	});
	return false
})

$('#makegif').click(function(){
	this.href = makeGIF(context)
	this.download = getNameForCurrentImage("gif")
	return true
})

$('a#showlink').click(function(){
	$(this).hide()
	$('a#hidelink').show()
	$('#genlist').show()
	return false
})

$('a#hidelink').click(function(){
	hideGenerators()
	return false
})


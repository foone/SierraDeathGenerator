var canvas = document.querySelector('canvas#death')
var context = canvas.getContext('2d')
var baseImage = null
var fontImage = null
var fontInfo = null
var overlayNames = null
var overlayOverrides = null
var selectedGenerator = null
var glitch = false

function applyHashChange(){
	selectedGenerator = window.location.hash.substr(1)
	if(selectedGenerator.startsWith('-')){
		selectedGenerator = selectedGenerator.substr(1)
		glitch=true
	}else{
		glitch=false
	}
	selectGenerator()
}

if(window.location.hash.length > 0){
	hideGenerators()
	applyHashChange()
}

window.addEventListener("hashchange", applyHashChange,false)

const smart_quote_map={
	// Single quote: '
	39: [0x2019,0x2018],
	// Double quote: "
	34: [0x201C,0x201D],
	// Left Lenticular bracket: 【
	12304: [91],
	// Right lenticular bracket: 】
	12305: [93],
	// Left bracket: [
	91: [12304],
	// Right bracket: ]
	93: [12305],
	// RIGHT SINGLE QUOTATION MARK ’
	0x2019:[39],
	// LEFT SINGLE QUOTATION MARK ‘
	0x2018:[39],
	// LEFT DOUBLE QUOTATION MARK “
	0x201C: [34],
	// RIGHT DOUBLE QUOTATION MARK ”
	0x201D: [34]
}

function map_smart_quotes(font, missing_char){
	if(missing_char in smart_quote_map){
		for(const replacement_char of smart_quote_map[missing_char]){
			if(replacement_char in font){
				return font[replacement_char];
			}
		}
	}
	return null;
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
		this.y = first(info.origin,{'y':0}).y
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

	split(maxwidth){
		if(this.getWidth()>maxwidth){
			var x=0;
			var out=[]
			var currentLine = new LineGroup(this.firstLine)
			for(var snippet of this.snippets){
				var w=snippet.getWidth()
				if(x+w>maxwidth){
					//console.log('SPLITTING',snippet)
					var parts = snippet.split(maxwidth-x)
					//console.log('resulting parts',parts)
					if(parts.length==1){
						// Failed split.
						if(!currentLine.isEmpty()){
							out.push(currentLine)
						}
						currentLine = new LineGroup(false)
						x=0
						currentLine.add(snippet)
					}else{
						for(var p of parts){
							currentLine.add(p)
							out.push(currentLine)
							currentLine = new LineGroup(false)
							x=0
						}
					}
				}else{
					currentLine.add(snippet)
					x+=w
				}
			}
			if(!currentLine.isEmpty()){
				out.push(currentLine)
			}
			return out
		}else{
			return [this]
		}

	}

	draw(context, scale, xStart, y){
		var x = xStart
		for(let snippet of this.snippets){
			x = snippet.draw(context, scale, x, y)
		}
	}

	asText(){
		var out=[]
		for(let snippet of this.snippets){
			out.push(snippet.text)
		}
		return out.join("")
	}
}

class Snippet{
	constructor(font, text){
		this.type = 'Snippet'
		this.font = font
		this.text = text
	}

	split(maxwidth){
		var chars = this.parse()
		function widthSoFar(font, bk){
			var w=0
			for(var i=0;i<bk;i++){
				w+=first(chars[i], font.info[font.info["null-character"]]).w
			}
			return w
		}
		var lb = new LineBreak(this.text)
		var last=null
		var bk
		var firstLine=true
		while(bk = lb.nextBreak()){
			if(widthSoFar(this.font,bk.position)>maxwidth){
				if(firstLine){
					last=bk.position
				}
				break
			}
			firstLine=false
			last=bk.position
		}
		if(last==null){
			// We had no break points, or our first breakpoint was over the max. So we can't split
			return [this]
		}else{
			var before = new Snippet(this.font, this.text.slice(0,last))
			var after = new Snippet(this.font, this.text.slice(last))
			var splits=[]
			for(let snippet of [before,after]){
				if(!snippet.isEmpty()){
					splits.push(snippet)
				}
			}
			return splits;
		}
	}

	draw(context, scale, xStart, y){
		var x=xStart
		var last = 0
		var lastchar = -1 
		var slope_offset = this.font.info.slope_offset
		for(let char of this.parse()){
			if(lastchar in char['unadvance-after']){
				x-= char['unadvance-after'][lastchar]
			}
			var minfo={'x':x,'y':y,'char':char,'scale':scale}
			if(slope_offset){
				slope_offset(minfo)
			}
			context.drawImage(
				this.font.image,
				minfo.char.x,
				minfo.char.y,
				minfo.char.w,
				minfo.char.h,
				minfo.x*minfo.scale,
				minfo.y*minfo.scale + minfo.char['vertical-shift'],
				minfo.char.w*minfo.scale,
				minfo.char.h*minfo.scale
			)
			x=minfo.x+(minfo.char.w - minfo.char.unadvance)
			if(!char['unadvance-through-font-changes']){
				last = minfo.char.unadvance
			}
			lastchar = minfo.char.char
		}
		return x + last
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
		var ligatures = first(font.ligatures, {})
		Object.assign(ligatures, first(font.insertables, {}))
		
		for(var i=0;i<line.length;i++){
			var c=line.charCodeAt(i)
			if(c>= 0xD800 && c<=0xDBFF){
				c = line.codePointAt(i)
				i++; // Can this be more than 2? ARG JS UNICODE IS BAD
			}
			var info=font[c]
			if(info==null){
				info = map_smart_quotes(font, c)
				if(info==null){
					info=font[font["null-character"]]
				}
			}
			var lig_unadvance = undefined
			var ligature_default = {}
			var matching_ligatures = Object.keys(ligatures).filter(x=>line.substring(i,i+x.length)==x)
			if(matching_ligatures.length>0){
				// Pick the longest match if there are multiple matches
				matching_ligatures.sort((a,b) => b.length - a.length)
				var matched_text = matching_ligatures[0]
				if(matched_text != 'default'){ // You can't have a ligature on the word default!
					ligature_default = first(first(font.ligatures,font.insertables, {}).default,{})
					var old_info = info
					info = ligatures[matched_text]
					var lig_chain = first(info['ligature-chain'], defaultInfo['ligature-chain'], 0)
					if(lig_chain>0){
						// FIXME: This won't calculate the correct unadvance if the chain is >1! 
						lig_unadvance = first(info.unadvance, defaultInfo.unadvance, 0) + first(old_info.w, defaultInfo.w) - 1 
					}
					// Extend i by the length of the ligature, minus 1 since the for loop will do i++
					i+= Math.max(0, (matching_ligatures[0].length -1 ) - lig_chain) 
				}
			}
			var x=first(info.x, ligature_default.x, defaultInfo.x)
			if(glitch){
				x*=0.95
			}
			var char_info={
				'x': x,
				'y': first(info.y, ligature_default.y, defaultInfo.y, fontOriginY),
				'w': first(info.w, ligature_default.w, defaultInfo.w),
				'h': first(info.h, ligature_default.h, defaultInfo.h),
				'unadvance': first(lig_unadvance, ligature_default.unadvance, info.unadvance, defaultInfo.unadvance, 0),
				'unadvance-through-font-changes': first(font['unadvance-through-font-changes'], false),
				'unadvance-after': first(info['unadvance-after'],ligature_default['unadvance-after'], {}),
				'vertical-shift': first(info['vertical-shift'], ligature_default['vertical-shift'], 0),
				'char':c
			}

			out.push(char_info)
		}
		return out
	}

	getWidth(){
		var w=0
		var last = 0
		var lastchar = -1
		for(var char of this.parse()){
			last = char.unadvance
			w += char.w - char.unadvance
			if(lastchar in char['unadvance-after']){
				w-= char['unadvance-after'][lastchar]
			}
			lastchar = char.char
		}
		return w + last
	}

	getHeight(firstLine){
		var info = this.font.info
		if(firstLine){
			return first(info['first-height'], info['height'], fontInfo['height'])
		}else{
			return first(info['height'],fontInfo['height'])
		}
	}
	isEmpty(){
		return this.text.length == 0
	}
}

class FontManager{
	constructor(context, text, fonts, aliases) {
		this.context = context
		this.text = text
		this.fonts = fonts
		this.aliases = aliases || {}
		this.lines = this.applyMarkup()
		//console.log('FontManager Constructor:',this.lines)
	}

	subset(other_text) {
		return new FontManager(this.context, other_text, this.fonts)
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

	wordwrap(maxwidth){

		function splitLine(line){
			var parts = line.split(maxwidth)
			if(parts.length==2){
				return [parts[0]].concat(splitLine(parts[1]))
			}else{ // should only be 1
				return parts
			}
		}

		var out=[]
		for(var line of this.lines){
			out = out.concat(splitLine(line))
		}
		this.lines = out
	}

	applyMarkup(){
		var parts = this.text.split(/\[(\/?[:_a-zA-Z0-9]*)\]/)
		parts.unshift('/')
		var out=[]
		for(var i=0;i<parts.length;i+=2){
			var marker = parts[i]
			var text = parts[i+1]
			if(text!==''){ // Skip empty text segments
				if(marker.startsWith('/')){
					marker='main'
				}
				// Apply font aliases before looking up font name
				marker = first(this.aliases[marker], marker)

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

	draw(mainFont, scale, originx, justify, justifyresolution, fontOriginY, first_line_justify, explicit_origins, output_size){
		var y = mainFont.y
		if(['v-center','all-center'].includes(justify)){
			y -= Math.floor(this.getHeight()/2)
		}
		for(let [line_number, line] of this.lines.entries()){
			var x = originx
			var origin_override = explicit_origins ? explicit_origins[line_number] : null
			var local_justify = line_number==0 ? first_line_justify : justify

			if(origin_override){
				// We overwrite originx as well so this'll stick for later lines
				originx = x = first(origin_override['x'], originx)
				y = first(origin_override['y'], y)
				if(origin_override['justify']){
					local_justify = origin_override['justify']

				}
			}
			if(line_number==0){
				if(local_justify == 'output-center'){
					x = Math.floor(output_size.w/2) - Math.floor(line.getWidth()/2);
					x = (x - (x % justifyresolution))
				}
				if(local_justify == 'center'){
					x = x - Math.floor(line.getWidth()/2);
					x = (x - (x % justifyresolution))
				}
			}
			if(line_number!=0 || first_line_justify==justify){
				if(['center','all-center'].includes(local_justify)){
					var jadjust = Math.floor(line.getWidth()/2);
					x = originx - (jadjust - (jadjust % justifyresolution));
				}
				if(local_justify=='right'){
					var jadjust = line.getWidth();
					x = originx - (jadjust - (jadjust % justifyresolution));
				}
			}
			line.draw(this.context, scale, x, y)
			y+=line.getHeight()
		}
	}

	plainLines(){
		let out=[]
		for(var line of this.lines){
			out.push(line.asText())
		}
		return out
	}
}


function hideGenerators(){
	$('a#hidelink').hide()
	$('a#showlink').show()
	$('#genlist').hide()
}

var week_ago = Date.now()-(7*24*3600000);

var sorted_generators = Object.entries(generators);
sorted_generators.sort(function(a,b){
	function getKey(x){
		return x[1].title.toLowerCase().replace(/^the /,'')
	}
	var keya = getKey(a), keyb=getKey(b)
	if(keya < keyb){return -1}
	if(keyb > keya){return +1}
	return 0;
})

for( let [gname, generator_item] of sorted_generators){
	var new_generator = false
	if('added' in generator_item || 'updated' in generator_item){

		if(Date.parse(first(generator_item.updated,generator_item.added)) > week_ago){
			new_generator = true
		}
	}
	$('#genlist').append($('<a class="f6 link dim ph3 pv2 mb2 dib white bg-dark-gray generator-switcher"></a>').attr("href",'#'+gname).text(generator_item.title).data('generator',gname).click(function (){
		hideGenerators()
		selectedGenerator=$(this).data('generator')
		selectGenerator()
	}).toggleClass('new-generator',new_generator)).append(' ')
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

function debugModeActive(){
	return window.location.hostname == 'localhost'	
}
function addDebugAlerts(gen, debugdiv){
	var mustHave = ['title','source','sourceurl','defaulttext','added','year','platform','gameinfo']
	var missings = [] 
	for (prop of mustHave) {
		if(!(prop in gen)){
			missings.push(prop)
		}
	}
	if(missings.length>0){
		var warn = $('<p class="w-90 ba br2 pa3 ma2 blue bg-washed-blue" role=alert></p>');
		warn.text('Missing properties: ' + missings.join(', '))
		var title=encodeURIComponent(gen.title)
		var debuglinks = $('<span class="debug-links"></span>')
		debuglinks.append(
			$('<a href="">twitter</a>')
			.attr('href','https://twitter.com/search?f=tweets&src=typd&q=from%3Afoone+'+title)
		)
		.append(
			$('<a href="">moby</a>')
			.attr('href','https://www.mobygames.com/search/quick?q='+title)
		)
		.append(
			$('<a href="">git</a>')
			.attr('href',`https://github.com/foone/SierraDeathGenerator/commits/master/games/${selectedGenerator}/${selectedGenerator}.json`)
		)
		warn.append(debuglinks)
		debugdiv.append(warn)
	}
}

function selectGenerator(){

	var gen=generators[selectedGenerator]
	window.location.hash=(glitch?'-':'') + selectedGenerator
	if(gen === undefined){
		gen={
			title:'placeholder',
			defaulttext: '',
			sourceurl:'',
			source:'UNKNOWN'
		}
	}
	$('a.generator-switcher').each(function(){
		var active = $(this).data('generator')==selectedGenerator
		$(this)
			.toggleClass('bg-dark-gray', !active)
			.toggleClass('bg-gray', active);


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
	if(gen['contributions']){
		var contentcontrib = $('#content-contrib').text(', and ')
		var first=true
		for(contribution of gen['contributions']){
			var ccontrib = contribution['contributor']
			if(contribution['url']){
				ccontrib = $('<a>').attr('href',contribution['url']).text(ccontrib)
			}
			if(!first){
				contentcontrib.append(", ")
			}
			if(contribution['type']){
				contentcontrib.append(contribution['type'] + ' by ').append(ccontrib)
			}else{
				contentcontrib.append(ccontrib)
			}
			first=false
		}
	}else{
		$('#content-contrib').text('')
	}
	if(gen['play']){
		$('#playlink').attr('href',gen['play'])
		$('#playlink').show()
		if(gen['how-to-use']){
			$('#how-to-use').text(gen['how-to-use'])
		}else{
			$('#how-to-use').text('Play this game')
		}
		if(gen['where-to-use']){
			$('#where-to-use').text(gen['where-to-use'])
		}else{
			$('#where-to-use').text('the Internet Archive')
		}
	}else{
		$('#playlink').hide()
	}

	var debugAlertsDiv = $('#debug-alerts')
	debugAlertsDiv.text('')
	if(debugModeActive()){
		addDebugAlerts(gen, debugAlertsDiv)
		$('.debug-only').show()
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
			if(currentOverlay.type=='slider'){
				overlays[oname] = {
					"name":sname,
					"type":"slider",
					"min":currentOverlay.min,
					"max":currentOverlay.max,
					"value":$('#overlay-'+oname).val(),
					"step":currentOverlay.step
				}
			}else{
				var sname = $('#overlay-'+oname+' option:selected').val()
				var adv=currentOverlay.options[sname]

				overlays[oname] = {
					"name":sname,
					"type":"select",
					"x":currentOverlay.x,
					"y":currentOverlay.y,
					"w":adv.w,
					"h":adv.h,
					"blend":first(currentOverlay['blend-mode'], 'source-over'),
					"stage":first(currentOverlay.stage, "pre-text"),
					"title":first(currentOverlay.title,sname),
					"flip":first(adv.flip, currentOverlay.flip, ''),
					"source":{
						"x":adv.x,
						"y":adv.y
					},
					"data":adv
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
		var new_value = opts[$(e).attr('id').split('-',2)[1]];
		if(typeof new_value !== 'undefined'){
			$(this).val(new_value)	
		}
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

function renderText(scaled = true, wordwrap_dryrun=false){
	if(fontInfo == null || baseImage == null){
		return
	}

	if('hooks' in fontInfo && 'pre-parse' in fontInfo['hooks']){
		eval(fontInfo.hooks['pre-parse'])
	}
	if(!('null-character' in fontInfo)){
		// Set a null character fallback if the JSON doesn't define one
		if('32' in fontInfo){
			// space is a good default, what font doesn't have space? 
			// A BAD ONE!
			fontInfo['null-character']='32'
		}else{
			var validcharacters = Object.keys(fontInfo).filter(x=>Number.isInteger(-x))
			fontInfo['null-character'] = validcharacters[0]
		}
	}
	// Define the top-level font
	var mainFont = new BitmapFont(fontInfo, fontImage)
	var fonts={
		'main': mainFont
	}
	var parent_fonts = [fontInfo]
	if('subfonts' in fontInfo){
		for(var key of Object.keys(fontInfo.subfonts)){
			fonts[key] = new BitmapFont(fontInfo.subfonts[key], fontImage)
			parent_fonts.push(fontInfo.subfonts[key])
		}
	}
	for(const parent_font of parent_fonts){
		if('shiftfonts' in parent_font){
			for(var key of Object.keys(parent_font.shiftfonts)){
				// Make a local clone of the JSON tree
				var fontcopy = JSON.parse(JSON.stringify(parent_font))
				if(!('default' in fontcopy)){
					fontcopy['default'] = {}
				}
				fontcopy['default']['y'] = parent_font.shiftfonts[key]
				delete fontcopy['height'] // Allow changes to the main object to be reflected into the subfont
				fonts[key] = new BitmapFont(fontcopy, fontImage)
			}
		}
	}
	var originx = first(fontInfo.origin.x, 0)

	var overlays = parseOverlays(fontInfo)

	var rawtext = document.querySelector("textarea#sourcetext").value
	var fontAliases = first(fontInfo['font-aliases'],{})

	function switchFont(newFont){
		rawtext = '[' + newFont + ']' + rawtext
	}

	if('hooks' in fontInfo && 'font' in fontInfo['hooks']){
		eval(fontInfo.hooks.font)
	}
	
	if('slope-offset' in fontInfo){
		fontInfo.slope_offset=eval('['+fontInfo['slope-offset']+']')[0]
	}

	var fontManager = new FontManager(context, rawtext, fonts, fontAliases)
	if('wrap-width' in fontInfo && $('#wordwrap').prop('checked')){
		fontManager.wordwrap(fontInfo['wrap-width'])
		//console.log('Wordwrapped: ',fontManager.lines)
	}

	if(wordwrap_dryrun){
		return fontManager
	}

	var justify = first(fontInfo.justify, 'left')
	var justify_resolution = first(fontInfo['justify-resolution'],1)
	var first_line_justify = fontInfo['first-line-justify']

	var explicit_origins = fontInfo['explicit-origins']

	var textbox={
		w: fontManager.getWidth(),
		h: fontManager.getHeight()
	}
	if(justify == 'center-box'){
		originx -= Math.floor(textbox.w/2)
	}else if(justify == 'right-box'){
		originx -= textbox.w
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
	var scaleMode = first(fontInfo['scale-mode'],'auto')
	if(scaleMode == 'nearest-neighbor' || (scaleMode == 'auto' && scale == 2.0)){
		context.imageSmoothingEnabled = false
	}

	function drawOverlays(stage){
		Object.keys(overlays).forEach(function (key) {
			var adv = overlays[key]
			if(adv.stage == stage){
				context.globalCompositeOperation = adv.blend
				var overlay_x = adv.x*scale, overlay_y = adv.y*scale;
				var overlay_w = adv.w*scale, overlay_h = adv.h*scale
				var source_x = adv.source.x, source_y = adv.source.y
				var source_w = adv.w, source_h = adv.h
				var source_image = fontImage

				context.save()
				if(adv.flip!==''){
					context.translate(overlay_x, overlay_y)
					overlay_x=overlay_y=0
					if(adv.flip.toUpperCase().includes('H')){
						overlay_x = -overlay_w
						context.scale(-1, 1)
					}
					if(adv.flip.toUpperCase().includes('V')){
						overlay_y = -overlay_h
						context.scale(1, -1)
					}
				}
				if(key in overlayOverrides){
					source_image = overlayOverrides[key]
					source_x = source_y = 0 
					source_w = source_image.width
					source_h = source_image.height
				}
				context.drawImage(
					source_image,
					source_x, source_y, source_w, source_h,
					overlay_x,overlay_y,overlay_w,overlay_h
				)
				context.restore()
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
		var border_sides='ttttttttt'
		if('hooks' in fontInfo && 'border' in fontInfo['hooks']){
			// EVAL IS SAFE CODE, YES?
			eval(fontInfo['hooks']['border'])
		}
		buildBorder(fontImage,fontInfo,bw,bh,border_sides)
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
	// Delay when we evaluate if first_line_justify should be reset to justify
	var first_line_justify = first(first_line_justify, justify)
	fontManager.draw(mainFont, scale, originx, justify, justify_resolution, fontOriginY, first_line_justify, explicit_origins, outputSize)

	drawOverlays('post-text')
}



function buildBorder(fontImage,fontInfo,w,h, border_sides){

	function drawBorderPiece(x,y,piece){
		bctx.drawImage(fontImage,piece.x,piece.y,piece.w,piece.h,x,y,piece.w,piece.h)
	}
	var bctx = document.querySelector('canvas#border').getContext('2d')
	if(bctx.canvas.width == w && bctx.canvas.height == h && bctx._border_sides == border_sides){
		return
	}
	bctx._border_sides = border_sides
	bctx.canvas.width = w
	bctx.canvas.height = h
	var border = fontInfo.border
	// todo: support styles other than "copy", like "stretch"

	if(border_sides[4]=='t'){
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
	}
	if(border_sides[1]=='t'){
		// Draw top-center edge
		for(var x=border.tl.w;x<w-border.tr.w;x+=border.t.w){
			drawBorderPiece(x,0,border.t)
		}
	}
	if(border_sides[7]=='t'){
		// Draw bottom-center edge
		for(var x=border.bl.w;x<w-border.br.w;x+=border.b.w){
			drawBorderPiece(x,h-border.b.h,border.b)
		}
	}
	if(border_sides[3]=='t'){
		// Draw left edge
		for(var y=border.tl.h;y<h-border.bl.h;y+=border.l.h){
			drawBorderPiece(0,y,border.l)
		}
	}
	if(border_sides[5]=='t'){
		// Draw right edge
		for(var y=border.tr.h;y<h-border.br.h;y+=border.r.h){
			drawBorderPiece(w-border.r.w,y,border.r)
		}
	}
	if(border_sides[0]=='t'){
		// Top-Left corner
		drawBorderPiece(0,0,border.tl)
	}
	if(border_sides[2]=='t'){
		// Top-Right corner
		drawBorderPiece(w-border.tr.w,0,border.tr)
	}
	if(border_sides[6]=='t'){
		// Bottom-Left corner
		drawBorderPiece(0,h-border.bl.h,border.bl)
	}
	if(border_sides[8]=='t'){
		// Bottom-Right corner
		drawBorderPiece(w-border.br.w,h-border.br.h,fontInfo.border.br)
	}

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
				if(overlay.type=='slider'){
					var range = $('<input type="range">').attr('id','overlay-'+key)
					range.attr('min',first(overlay.min,0))
					range.attr('max',first(overlay.max,100))
					range.attr('step',first(overlay.step,1))
					if(overlay.default){
						range.attr('value',overlay.default)
					}
					range.appendTo(pwrapper)
				}else{
					var select = $('<select class="overlay-selector">').attr('id','overlay-'+key)
					for(opt in overlay.options){
						if(overlay.options.hasOwnProperty(opt)){
							$('<option>').text(first(overlay.options[opt].title,opt)).attr('value',opt).prop('selected',opt==overlay['default']).appendTo(select)
						}
					}
					select.appendTo(pwrapper)
					if('replaceable' in overlay){
						var uploadlabel=$(' <label>Replace image:</label>')
						var upload=$('<input type="file" class="overlay-replacement" accept="image/*"/>').attr('id','replace-'+key)
						upload.appendTo(uploadlabel)
						uploadlabel.appendTo(pwrapper)
					}
				}
				pwrapper.appendTo($('.overlays'))
			}
		}
	}
	$('.overlays select, .overlays input[type=range]').change(function(){
		var name = $(this).attr('id').split('-',2)[1]
		var hookname = 'change-'+name
		if('hooks' in fontInfo && hookname in fontInfo.hooks){
			eval(fontInfo.hooks[hookname])
		}
		renderText()
	})
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
		$('.wordwrap').toggle('wrap-width' in fontInfo)
		renderText()
		$('#makegif').toggle(!!fontInfo.gif)
		if(fontInfo.script){
			$.getScript(gamesPath + selectedGenerator + ".js");
		}

		if('notes' in fontInfo){
			$('#notes').text(fontInfo.notes)
		}else{
			$('#notes').text('')
		}
		addLinksForSpecialCharactersAndInsertables()
	})

}

function addLinksForSpecialCharactersAndInsertables(){
	var specials = [] 
	Object.keys(fontInfo).forEach(function (key) {
		if($.isNumeric(key)){
			if(key>=128){
				specials.push(key)
			}
		}
	});
	if(specials.length>0){
		var specialdiv = $('<div class="special-keys"><b>Special characters:</b> <br /></div>')
		for (character of specials) {
			specialdiv.append('<a class="add-special" href="" data-character="'+character+'" title="U+'+(character-0).toString(16)+' #'+character+'">[&#'+character+';]</a> ')
		}
		$('#notes').append(specialdiv)
		var sourcetext_focused = false
		$('.add-special').mousedown(function(){
			sourcetext_focused = $('#sourcetext').is(':focus')
			return true
		})
		$('.add-special').click(function(){
			var sourcetext = $('#sourcetext')
			var before_text = sourcetext.val()
			var to_insert = String.fromCodePoint($(this).data('character'))
			var caret_pos = sourcetext[0].selectionStart
			if (typeof caret_pos === 'number') {
				if (!sourcetext_focused) {
					caret_pos = before_text.length
				}
				sourcetext.val(before_text.substring(0, caret_pos) + to_insert + before_text.substring(caret_pos))
				sourcetext.focus()
				sourcetext[0].selectionStart = sourcetext[0].selectionEnd = caret_pos + to_insert.length
			} else {
				sourcetext.val(before_text + to_insert)
			}
			renderText()
			return false
		})
	}
	var insertables = Object.keys(first(fontInfo.insertables,{})).filter((e)=>e!='default')
	if(insertables.length>0){
		var specialdiv = $('<div class="insertable-keys"><b>Insertables:</b> <br /></div>')
		for (insertable of insertables) {
			specialdiv.append(
				'<a class="add-insertable" href="" data-insertable="' 
				+ insertable + '" title="' 
				+ insertable+'">['+insertable+']</a> ')
		}
		$('#notes').append(specialdiv)
		var sourcetext_focused = false
		$('.add-insertable').mousedown(function(){
			sourcetext_focused = $('#sourcetext').is(':focus')
			return true
		})
		$('.add-insertable').click(function(){
			var sourcetext = $('#sourcetext')
			var before_text = sourcetext.val()
			var to_insert = $(this).data('insertable')
			var caret_pos = sourcetext[0].selectionStart
			if (typeof caret_pos === 'number') {
				if (!sourcetext_focused) {
					caret_pos = before_text.length
				}
				sourcetext.val(before_text.substring(0, caret_pos) + to_insert + before_text.substring(caret_pos))
				sourcetext.focus()
				sourcetext[0].selectionStart = sourcetext[0].selectionEnd = caret_pos + to_insert.length
			} else {
				sourcetext.val(before_text + to_insert)
			}
			renderText()
			return false
		})
	}
}

function getNameForCurrentImage(ext){
	var text = document.querySelector("textarea#sourcetext").value
	text = text.replace(/\n/g," ").replace(/[^-._a-zA-Z0-9 ]/g,"")
	return selectedGenerator + "-" + text + "." + ext
}

if(selectedGenerator===null){
	var generator_names = Object.keys(generators)
	selectedGenerator = generator_names[Math.round(generator_names.length * Math.random())]
}
selectGenerator()
$('#sourcetext').keyup(renderText)
$(window).resize(function () { renderText() });

$('.wordwrap').change(renderText)


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
$('#jsondump').click(function(){
	function b64EncodeUnicode(str) {
	    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
	        return String.fromCharCode('0x' + p1);
	    }));
	}
	var jsonurl = 'data:application/json;charset=utf-8;base64,' + b64EncodeUnicode(JSON.stringify(getOptions()))
	this.href = jsonurl;
	this.download = getNameForCurrentImage("json")
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


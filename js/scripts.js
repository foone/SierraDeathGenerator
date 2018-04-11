var canvas = document.querySelector('canvas')
var context = canvas.getContext('2d')
var baseImage = null
var fontImage = null
var fontInfo = null
var overlayNames = null
var selectedGenerator = 'pq2'

if(window.location.hash.length > 0){
	selectedGenerator = window.location.hash.substr(1)
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

	$('button.generator-switcher').each(function(){
		$(this).prop('disabled',$(this).data('generator')==selectedGenerator)
	})

	$('.change-title').text(gen.title + " Generator");
	$('.change-source').attr('href',gen.sourceurl).text(gen.source)
	if(gen['contributor']){
		$('#extra-contrib').text(' and ' + gen['contributor'])
	}else{
		$('#extra-contrib').text('')
	}
	var sourcetext = $('#sourcetext');

	if(sourcetext.text().length==0 || isAnyDefaultText(sourcetext.text())){
		$('#sourcetext').text(gen.defaulttext)
	}

	fontInfo=null // Prevent flash of gibberish when switching images
	loadJSONForGenerator()
	$('.source').remove();

	gamesPath = 'games/' + selectedGenerator + '/'
	baseImage = $('<img id="template" class="source" />').attr('src', gamesPath + selectedGenerator + '-blank.png').appendTo('body')[0]
	fontImage = $('<img id="font" class="source" />').attr('src', gamesPath + selectedGenerator + '-font.png').appendTo('body')[0]

	$('.source').waitForImages(true).done(function(){
		baseImage=$('img#template')[0]
		//fontImage=$('img#font')[0]
		renderText()
	});

}

function getWidth(lines){

	var maxw=0;
	for (let line of lines){
		var w=0;
		for(var i=0;i<line.length;i++){
			var info=fontInfo[line.charCodeAt(i)]
			if(info==null){
				info=fontInfo[fontInfo["null-character"]]
			}
			w+=info.w
		}
		maxw=Math.max(maxw,w)
	}
	return maxw

}
function getHeight(lines){

	if(lines.length == 9){
		return 0;
	}
	if(fontInfo['first-height'] == null){
		return fontInfo.height * lines.length
	}
	
	return Math.max(0,fontInfo.height * (lines.length-1)) + fontInfo['first-height']

}

function renderText(scaled = true){

	var buffer = 10
	var browserScale = $(window).width() / (baseImage.width + buffer)

	if(fontInfo == null){
		return
	}
	var fontScale = 2;
	if(fontInfo['scale'] != null){
		fontScale = fontInfo.scale
	}
	var justify = 'left'
	if(fontInfo['justify'] != null){
		justify = fontInfo['justify']
	}

	var scale = Math.min(browserScale, fontScale)
	if(!scaled){
		scale = fontScale
	}
	context.canvas.width = baseImage.width * scale
	context.canvas.height = baseImage.height * scale
	if(scale == 2.0){
		context.imageSmoothingEnabled = false
	}

	var originx=fontInfo.origin.x

	var bx=fontInfo.box.x,by=fontInfo.box.y
	var text = document.querySelector("textarea#sourcetext").value.split('\n')

	// Clear before drawing, as transparents might get overdrawn
	context.clearRect(0, 0, canvas.width, canvas.height)
	context.drawImage(baseImage, 0, 0, baseImage.width*scale, baseImage.height*scale)
	var firstLine=true;

	if(justify == 'center-box'){
		originx -= Math.floor(getWidth(text)/2)
	}

	if ('overlays' in fontInfo) {
		for(var i=0;i<overlayNames.length;i++){
			var oname=overlayNames[i]
			var currentOverlay=fontInfo.overlays[oname]
			var x=currentOverlay.x
			var y=currentOverlay.y
			var adv=currentOverlay.options
			adv=adv[$('#overlay-'+oname+' option:selected').text()]
			context.drawImage(fontImage,adv.x,adv.y,adv.w,adv.h,x*scale,y*scale,adv.w*scale,adv.h*scale)
		}
	}

	var y=fontInfo.origin.y

	if(justify=='v-center'){
		y -= Math.floor(getHeight(text)/2)
	}

	for (let line of text){
		if(fontInfo['case-fold'] == 'upper'){
			line = line.toUpperCase()
		}else if(fontInfo['case-fold'] == 'lower'){
			line = line.toLowerCase()
		}
		var x=originx
		if(justify == 'center'){
			x = originx - Math.floor(getWidth([line])/2)
		}
		for(var i=0;i<line.length;i++){
			var info=fontInfo[line.charCodeAt(i)]
			if(info==null){
				info=fontInfo[fontInfo["null-character"]]
			}
			bx=info.w
			by=info.h
			context.drawImage(fontImage,info.x,0,bx,by,x*scale,y*scale,bx*scale,by*scale)
			x+=info.w
		}
		if(firstLine){
			if(fontInfo['first-height'] != null){
				// remove out fontInfo.height because it's going to be re-added later.
				y+=fontInfo['first-height']-fontInfo.height
			}
			firstLine = false;
		}
		y+=fontInfo.height
	}

}

function resetOverlays(){

	overlayNames = []
	$('.overlays p').remove()
	if('overlays' in fontInfo){
		var overlays = fontInfo.overlays
		for(key in overlays) {
			if(overlays.hasOwnProperty(key)) {
				overlayNames.push(key)
				var overlay = overlays[key]
				var pwrapper=$("<p>").text(overlay.title+': ')
				var select = $('<select class="overlay-selector">').attr('id','overlay-'+key)
				for(opt in overlay.options){
					if(overlay.options.hasOwnProperty(opt)){
						$('<option>').text(opt).prop('selected',opt==overlay['default']).appendTo(select)
					}
				}
				select.appendTo(pwrapper)
				pwrapper.appendTo($('.overlays'))
			}
		}
	}
	$('.overlays select').change(renderText)

}

function loadJSONForGenerator(){

	gamesPath = 'games/' + selectedGenerator + '/'
	$.getJSON(gamesPath + selectedGenerator + ".json",function(data){
		fontInfo = data
		resetOverlays()
		renderText()
	})

}

selectGenerator()
$('#sourcetext').keyup(renderText)
$(window).resize(function () { renderText() });

$('#save').click(function(){
	// generate an unscaled version
	renderText(false)
	this.href=context.canvas.toDataURL('image/png')
	var text = document.querySelector("textarea#sourcetext").value
	text = text.replace(/\n/," ").replace(/[^-._a-zA-Z0-9 ]/,"")
	this.download = selectedGenerator + "-" + text + ".png"
	return true
})
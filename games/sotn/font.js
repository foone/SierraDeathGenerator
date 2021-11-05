{
	let lines=rawtext.split('\\n');
	if(lines.length>0){lines[0]='['+overlays.theme.data.info['title-font']+']'+lines[0]+'[/]'};
	if(lines.length>1){lines[1]='['+overlays.theme.data.info['dialogue-font']+']'+lines[1]};
	rawtext=lines.join('\\n');
}
{
	fontInfo['scale']=2;
	if(overlays.theme.name.startsWith('christmas')){
		fontInfo['wrap-width']=176+15;}else if(overlays.theme.name=='bernie-sanders'){fontInfo['wrap-width']=352;fontInfo['scale']=1;}else{fontInfo['wrap-width']=176;}var new_origins=fontInfo['meta-explicit-origins'][overlays.theme.data.info['origin-set']];fontInfo['explicit-origins']=JSON.parse(JSON.stringify(new_origins))}
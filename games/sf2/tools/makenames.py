from PIL import Image
TEMPLATE="""
"{}": {{
	"x": {},
	"y": {},
	"w": 128,
	"h": 128,
	"flip":"h"
}},""".strip()

with open('names.txt','r') as f:
	lines=[x.strip() for x in f]


im = Image.open('sf2-font.png')

for i,line in enumerate(lines):
	y=16+i*128
	name=line.strip('"')
	print TEMPLATE.format(name+'_win',0,y)
	losses=[]

	for xi in range(1,16):
		pos = (128*xi,y)
		try:
			_,_,_,a = im.getpixel(pos)
		except IndexError:
			break
		if a>0:
			losses.append(('{}_loss{}'.format(name,xi),pos[0],pos[1]))
		else:
			break

	if len(losses)==1:
		name,x,y=losses[0]
		losses = [(name.rstrip('1'), x, y)]

	for loss in losses:
		print TEMPLATE.format(*loss)

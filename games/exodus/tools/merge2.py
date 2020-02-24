from PIL import Image,ImageOps
W,H=128,48

src = Image.open('EXPIC.BIN.0000B758.0-linear-rect.png')
out = Image.new('RGBA',(W,H*2))
def rgb(num):
	return (
		int(num[0:2],16),
		int(num[2:4],16),
		int(num[4:6],16),
		255
	)
COLORS=[
	rgb('000000'),
	rgb('0000AA'),
	rgb('00AA00'),
	rgb('00AAAA'),
	rgb('AA0000'),
	rgb('AA00AA'),
	rgb('AA5500'),
	rgb('AAAAAA'),
	rgb('555555'),
	rgb('5555FF'),
	rgb('55FF55'),
	rgb('55FFFF'),
	rgb('FF5555'),
	rgb('FF55FF'),
	rgb('FFFF55'),
	rgb('FFFFFF')
]

for x in range(W):
	for y in range(H):
		r=(src.getpixel((x,y+48*0))[0]>0)*1
		g=(src.getpixel((x,y+48*1))[0]>0)*2
		b=(src.getpixel((x,y+48*2))[0]>0)*4
		i=(src.getpixel((x,y+48*3))[0]>0)*8

		out.putpixel((x,y),COLORS[r|g|b|i])

for x in range(0,W,8):
	im=out.crop((x,0,x+8,H))
	im=ImageOps.mirror(im)
	out.paste(im,(x,48))


out.save('exodus-font.png')




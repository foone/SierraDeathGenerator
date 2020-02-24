from PIL import Image
W,H=768,8

src = Image.open('chr000-linear-rect.png')
out = Image.new('RGBA',(W,H))
def rgb(num):
	if num=='000000':
		return (0,0,0,0)
	if num=='FFFFFF':
		return (0,0,0,255)
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
		r=(src.getpixel((x,y+ 0))[0]>0)*1
		g=(src.getpixel((x,y+ 8))[0]>0)*2
		b=(src.getpixel((x,y+16))[0]>0)*4
		i=(src.getpixel((x,y+24))[0]>0)*8

		out.putpixel((x,y),COLORS[r|g|b|i])

out.save('exodus-font.png')




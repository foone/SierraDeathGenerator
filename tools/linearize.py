import sys,os
from PIL import Image
if len(sys.argv)!=4:
	print 'Usage: {} <filename> <width> <height>'
	sys.exit()
im=Image.open(sys.argv[1])
w,h=tuple(int(v) for v in sys.argv[2:4])
imgw,imgh=im.size
for dimension,imgsize,size in (('width',imgw,w),('height',imgh,h)):
	if imgsize%size != 0:
		print 'Image {} is {}, not an even multiple of {}!'.format(dimension,imgsize,size)
		sys.exit()
outw,outh=imgw//w,imgh//h
outim=Image.new(im.mode, (outw*outh*w,h))
outx=0
for y in range(outh):
	for x in range(outw):
		src=(x*w,y*h,(x+1)*w,(y+1)*h)
		dest = ((x+y*outw)*w,0)
		outim.paste(im.crop(src),dest)

outfile=os.path.splitext(sys.argv[1])[0]+'-linear.png'
outim.save(outfile)

import sys,os
from PIL import Image
import argparse
def getCoords(columns):
	for x in range(columns):
		yield (x,0)

parser = argparse.ArgumentParser(description='Rearrange a non-alphabetical (linear) image file')
parser.add_argument('filename', metavar='FILE', 
                    help='image file to linearize')
parser.add_argument('width', default=8, type=int,nargs='?',
                    help='Width of each tile (default: %(default)s)')
parser.add_argument('height', default=8, type=int,nargs='?',
                    help='Height of each tile (default: %(default)s)')
parser.add_argument('order', metavar="ABCDEFG...",
                    help='The order the tiles are currently in')

args = parser.parse_args()
im=Image.open(args.filename)
if im.mode=='P' and im.palette.mode=='RGB' and 'transparency' in im.info:
	print 'Indexed color with PNG transparency, converting to RGBA'
	im=im.convert('RGBA')

w,h=args.width,args.height
imgw,imgh=im.size
for dimension,imgsize,size in (('width',imgw,w),('height',imgh,h)):
	if imgsize%size != 0:
		print 'Image {} is {}, not an even multiple of {}!'.format(dimension,imgsize,size)
		sys.exit()
chunks = []
for i,(x,y) in enumerate(getCoords(imgw//w)):
	src=(x*w,y*h,(x+1)*w,(y+1)*h)
	tile = (args.order[i],x,y,im.crop(src))
	chunks.append(tile)
print '{} chunks, {} letters in order'.format(len(chunks),len(args.order))
chunks.sort()

outw,outh=len(chunks),1
outim=Image.new('RGBA', (outw*outh*w,h))
outim.paste((0,0,0,0),(0,0,outim.size[0],outim.size[1]))

for i, (_,_,_,chunk_src) in enumerate(chunks):
	outim.paste(chunk_src, (i*w, 0))

outfile=os.path.splitext(args.filename)[0]+'-reordered.png'
outim.save(outfile)

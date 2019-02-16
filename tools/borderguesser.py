import sys,os
from PIL import Image
import argparse
from collections import OrderedDict
import subprocess,json
def getCoords(columns, rows, rowcolumn=True):
	if rowcolumn:
		for y in range(rows):
			for x in range(columns):
				yield (x,y)
	else:
		for x in range(columns):
			for y in range(rows):
				yield (x,y)

def isFullyTransparent(img):
	return all(a==0 for a in img.getdata(3))

def findVSplits(img):
	w,h=img.size
	splits=[]
	for y in range(1,h-1):
		if isFullyTransparent(img.crop((0,y,w,y+1))):
			splits.append(y)
	return splits
def findHSplits(img):
	w,h=img.size
	splits=[]
	for x in range(1,w-1):
		if isFullyTransparent(img.crop((x,0,x+1,w))):
			splits.append(x)
	return splits
def rect(x,y,x2,y2):
	w=x2-x-1
	h=y2-y-1
	d = OrderedDict()
	d['x']=x+1+args.x
	d['y']=y+1+args.y
	d['w']=w
	d['h']=h
	return d


parser = argparse.ArgumentParser(description='Build coords for a 9-segment border')
parser.add_argument('filename', metavar='FILE',
                    help='image file to parse')
parser.add_argument('x', default=0, type=int,nargs='?',
                    help='X coord of border start (default: %(default)s)')
parser.add_argument('y', default=0, type=int,nargs='?',
                    help='Y coord of border start (default: %(default)s)')

parser.add_argument('width', default=None, type=int,nargs='?',
                    help='Width of full border (default: image width')
parser.add_argument('height', default=None, type=int,nargs='?',
                    help='Width of full border (default: image height)')
args = parser.parse_args()

fullimg = Image.open(args.filename).convert('RGBA')
if args.width is None:
	args.width = fullimg.size[0]-args.x
if args.height is None:
	args.height = fullimg.size[1]-args.y

smallimg = fullimg.crop((args.x, args.y, args.x+args.width, args.y+args.height))

vsplits = findVSplits(smallimg)
hsplits = findHSplits(smallimg)
print >>sys.stderr,'vsplits: ', vsplits
print >>sys.stderr,'hsplits: ', hsplits

if len(vsplits) != 2 or len(hsplits) != 2:
	print 'Wrong number of splits! Check your source image.'
	sys.exit()

#TODO: handle non-even sizes

v0=h0=-1
v1,v2=vsplits
h1,h2=hsplits

h3,v3=w,h=smallimg.size
border = OrderedDict()
border['tl'] = rect(h0,v0,h1,v1)
border['t']  = rect(h1,v0,h2,v1)
border['tr'] = rect(h2,v0,h3,v1)

border['l']  = rect(h0,v1,h1,v2)
border['c']  = rect(h1,v1,h2,v2)
border['r']  = rect(h2,v1,h3,v2)

border['bl'] = rect(h0,v2,h1,v3)
border['b']  = rect(h1,v2,h2,v3)
border['br'] = rect(h2,v2,h3,v3)


print json.dumps({'border':border}, indent=2)
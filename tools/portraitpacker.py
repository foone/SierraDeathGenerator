import sys,os,glob
from PIL import Image
files = sorted(glob.glob('atlas/*.png')+glob.glob('atlas/*.bmp'))
fontfile=Image.open(sys.argv[1]).convert('RGBA')
width=fontfile.size[0]
images = {}
for path in files:
	im=Image.open(path)
	name=os.path.splitext(os.path.basename(path))[0].lower()
	images[name]=im

outx,outy=0,fontfile.size[1]
box=max(im.size[0] for im in images.values()),max(im.size[1] for im in images.values())
placements=[]
for name,im in sorted(images.items()):
	if outx+box[0]>=width:
		outx=0
		outy+=box[1]
	placements.append((name,im,outx,outy))
	outx+=box[0]

outim=Image.new(fontfile.mode,(width,outy+box[1]))
outim.paste(fontfile,(0,0))
for name,im,x,y in placements:
	outim.paste(im,(x,y))
	print """				"{}": {{
					"x": {},
					"y": {},
					"w": {},
					"h": {}
				}},""".format(name,x,y,im.size[0],im.size[1])

outfile=os.path.splitext(sys.argv[1])[0]+'-atlas.png'
outim.save(outfile)

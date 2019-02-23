# encoding=utf-8

import json, collections, string
with open('yi-orig.json','r') as f:
	yidata=json.load(f,object_pairs_hook=collections.OrderedDict)

with open('characters.json','r') as f:
	data=json.load(f,object_pairs_hook=collections.OrderedDict)

REMAPS=['\0']*256
origkeys = list(data.keys())
WIDTHS={}
def find_offset(x):
	nearx=(-2+x,-1+x, x, x+1,x+2)
	for i,key in enumerate(origkeys):
		if data[key]['x'] in nearx:
			return i
	print ("COULDN'T FIND OFFSET {}".format(x))

def apply_remap(offset,s, width=None):
	#print(repr(list(s)))
	REMAPS[offset:offset+len(s)]=list(s)
	if width is not None:
		WIDTHS[offset]=width


apply_remap(69,'0123456789'+string.ascii_uppercase)
apply_remap(find_offset(952),string.ascii_lowercase)
apply_remap(find_offset(419),'.')
apply_remap(find_offset(246),':;')
apply_remap(find_offset(816),'?!')
apply_remap(find_offset(364),'=,')
apply_remap(find_offset(277),u"'⇧🡄🡆🡅🡇")
apply_remap(find_offset(800),u"『』")
apply_remap(find_offset(872),u"。~")
apply_remap(find_offset(894),u"“”·▶")
apply_remap(find_offset(944),u"×")
apply_remap(find_offset(1149),u"◀．")
apply_remap(find_offset(1212),u"⇩")
apply_remap(find_offset(0),u"àâçèéêîôùûäöüßÄÖÜ")
apply_remap(find_offset(134),u"Ⓐ", width=16)
apply_remap(find_offset(149),u"Ⓑ", width=16)
apply_remap(find_offset(165),u"Ⓨ", width=16)
apply_remap(find_offset(181),u"Ⓧ", width=16)

apply_remap(find_offset(350),u"⮉", width=16)
apply_remap(find_offset(422),u"ÀÂÇÈÉÊÎÔÚÙÏï")
apply_remap(find_offset(1164),u"❓", width=16)
apply_remap(find_offset(1180),u"☆", width=16)

apply_remap(find_offset(221),u"Ⓛ",width=24)
apply_remap(find_offset(254),u"Ⓡ",width=24)

apply_remap(find_offset(927),u"🦎", width=16)
apply_remap(find_offset(849),u"✚", width=16)
apply_remap(find_offset(864),u"…")
apply_remap(find_offset(888),u"，")
apply_remap(find_offset(832),u"、-")
apply_remap(find_offset(377),u"ℯ𝒾𝓉𝓇𝒽𝒻𝓃")
apply_remap(find_offset(1196),u"❗",width=16)
apply_remap(find_offset(325),u"Ⓢ",width=24)
apply_remap(find_offset(197),u"ⓢ",width=24)




for i,c in enumerate(REMAPS):
	if i>=len(origkeys):
		break
	if c=='\0':
		continue
	chardata = yidata[ord(c)]=data[origkeys[i]]
	if i in WIDTHS:
		chardata['w'] = WIDTHS[i]


with open('yi.json','w') as f:
	json.dump(yidata, f)
	
from PIL import Image
im=Image.open('yi-font.png').convert('RGBA')
outim = Image.new('RGBA',im.size)
w,h=im.size
outim.paste((41,98,74,255),(0,0,w,h))
for key, char in yidata.items():
	try:
		int(key)
	except ValueError:
		continue
	if 'x' in char and 'w' in char:
		x,w=char['x'],char['w']
		outim.paste((0,0,0,255),(x,0,x+w,h))
outim.paste(im,(0,0),im)
outim.save('annotated.png')
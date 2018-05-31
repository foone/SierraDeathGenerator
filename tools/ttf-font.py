import pygame
from collections import OrderedDict
import json
pygame.init()
FONTSIZE=23
FONTSIZE=18
surfs={}
font = pygame.font.SysFont('Times New Roman',FONTSIZE,bold=True)

for c in range(32,128):
	surf=font.render(chr(c),False,(0,0,0))
	surfs[c]=surf

w,h=0,0
for surf in surfs.values():
	w+=surf.get_width()
	h=max(h,surf.get_height())

out=pygame.Surface((w,h))
out.fill((255,255,255))
x=0
chars=OrderedDict()
for c in sorted(surfs.keys()):
	surf = surfs[c]
	out.blit(surf, (x,0))
	info=chars[c]=OrderedDict()
	info['x']=x
	cw =info['w']=surf.get_width()
	info['h']=surf.get_height()

	x+=cw

pygame.image.save(out,'font.png')
with open('font.json','wb') as f:
	json.dump(chars,f)

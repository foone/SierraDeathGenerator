import subprocess,os,sys,shutil,time,string,re

with open('yi.smc','rb') as f:
	rom_data=list(f.read())

ROM_PATH=r'C:\users\foone\app\BizHawk-2.3.1\yi2.smc'
NAMES={}
for line in open('chara.txt','r'):
	m=re.search('([0-9A-Fa-f]{2}):(.*$)', line)
	if m:
		NAMES[int(m.group(1),16)]=m.group(2).strip()

for c in [chr(x) for x in range(256)]:
	out_path = 'chars\\character_{:02X}.png'.format(ord(c))
	if os.path.exists(out_path):
		continue

	start=time.time()
	subprocess.call('del out\\*.png',shell=True)

	rom_data[0x11045B] = c
	with open(ROM_PATH,'wb') as f:
		f.write(''.join(rom_data))
	cnum=ord(c)
	print 'Doing {:02X}: {}'.format(cnum, NAMES.get(cnum,'unknown'))
	subprocess.call([
		'EmuHawk.exe',ROM_PATH,
		r'--movie=yi.bk2',
		'--dump-close','--dump-type=imagesequence',
		r'--dump-name=out\out.png',
		'--dump-length=1382',
		'--dump-frames=1379,1380,1381'
	])

	shutil.copy(r'out\out_1330.png',out_path)
	print 'Done in {:0.2f}s'.format(time.time()-start)
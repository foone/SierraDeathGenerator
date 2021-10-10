import array
rom=array.array('B')
with open('Tecmo Bowl (U).nes','rb') as f:
	rom.fromfile(f,262160)

replacement='BOBSON DUGNUTT'.center(16)

players=array.array('B',replacement*252)
offset=0x3028
rom[offset:offset+len(players)]=players

with open('tb.nes','wb') as f:
	rom.tofile(f)

#	f.seek(0x3028)
#	for i in range(252):
#		print '{: 4d} {}'.format(i,f.read(16).replace('[','.'))
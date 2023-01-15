import sys,os,time,json,subprocess,pdb,glob,base64,tempfile

for path in glob.glob('../games/*/*.json'):
	name=os.path.splitext(os.path.basename(path))[0]
	if path=='../games\\{0}\\{0}.json'.format(name):
		print(name)
		try:
			os.mkdir(os.path.join('..','games',name,'tests'))
		except WindowsError:
			pass
		default_path_base = '../games/{}/tests/_default.'.format(name)
		default_path_png  = default_path_base + 'png'
		default_path_json = default_path_base + 'json'
		if os.path.exists(default_path_json):
			continue
		
		tests={'generator':name,'tests':{'_default':{}}}
		proc = subprocess.Popen(['node','make_test_cases.js'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
		data,_ = proc.communicate(json.dumps(tests))
		if proc.returncode!=0:
			print 'Errored, skipping'
			continue
		results = json.loads(data)['_default']


		with open(default_path_png, 'wb') as f:
			f.write(base64.b64decode(results['image'].split(',',1)[1]))
		with open(default_path_json, 'wb') as f:
			json.dump(results['options'],f)
		
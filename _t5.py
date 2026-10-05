import sys, os
print('start', flush=True)
import zipfile
os.chdir(r'c:\Users\THISHANTH T\Desktop\PROTOTYPE')
# xlsx files are zip archives - check if zipfile works
try:
    with zipfile.ZipFile('ml/data/3dept.xlsx', 'r') as zf:
        names = zf.namelist()[:10]
    print('zipfile OK, first entries:', names, flush=True)
except Exception as e:
    print('zipfile FAIL:', e, flush=True)

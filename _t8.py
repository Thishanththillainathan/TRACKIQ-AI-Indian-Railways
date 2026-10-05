import sys, os, zipfile
os.chdir(r'c:\Users\THISHANTH T\Desktop\PROTOTYPE')
with zipfile.ZipFile('ml/data/3dept.xlsx', 'r') as zf:
    info = {n: zf.getinfo(n).file_size for n in zf.namelist() if 'sheet' in n or 'String' in n}
for k, v in sorted(info.items()):
    print(k, ':', round(v/1024/1024, 2), 'MB')

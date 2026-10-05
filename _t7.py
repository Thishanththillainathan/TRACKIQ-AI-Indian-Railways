import sys, os, zipfile, xml.etree.ElementTree as ET
print('start', flush=True)
os.chdir(r'c:\Users\THISHANTH T\Desktop\PROTOTYPE')
# Read first sheet (Maintenance) XML and parse headers
with zipfile.ZipFile('ml/data/3dept.xlsx', 'r') as zf:
    ws_xml = zf.read('xl/worksheets/sheet1.xml')
root = ET.fromstring(ws_xml)
ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
# Get shared strings for header resolution
with zipfile.ZipFile('ml/data/3dept.xlsx', 'r') as zf:
    if 'xl/sharedStrings.xml' in zf.namelist():
        ss_xml = zf.read('xl/sharedStrings.xml')
        ss_root = ET.fromstring(ss_xml)
        ss_ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        shared_strings = [si.find('ns:t', ss_ns) for si in ss_root.findall('ns:si', ss_ns)]
        shared_strings = [s.text if s is not None else '' for s in shared_strings]
        print('Shared strings count:', len(shared_strings))
        print('First 5 shared strings:', shared_strings[:5])

# Get first row cells
first_row = root.find('.//ns:row', ns)
headers = []
for cell in first_row.findall('ns:c', ns):
    t = cell.attrib.get('t', '')
    v_el = cell.find('ns:v', ns)
    if v_el is not None and t == 's':
        idx = int(v_el.text)
        headers.append(shared_strings[idx])
    elif v_el is not None:
        headers.append(v_el.text)
print('Headers[:8]:', headers[:8], flush=True)
print('Pure Python XLSX: OK', flush=True)

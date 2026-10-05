import sys, os, zipfile
print('start', flush=True)
os.chdir(r'c:\Users\THISHANTH T\Desktop\PROTOTYPE')
import xml.etree.ElementTree as ET
# Try reading the workbook XML manually using pure Python
with zipfile.ZipFile('ml/data/3dept.xlsx', 'r') as zf:
    wb_xml = zf.read('xl/workbook.xml')
root = ET.fromstring(wb_xml)
ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
sheets = root.findall('.//ns:sheet', ns)
print('Sheets via ET:', [s.attrib.get('name') for s in sheets], flush=True)
print('ET XML: OK', flush=True)

import sys
print('start', flush=True)
import openpyxl, os
os.chdir(r'c:\Users\THISHANTH T\Desktop\PROTOTYPE')
print('chdir ok', flush=True)
wb = openpyxl.load_workbook('ml/data/Track_Management_Department.xlsx', read_only=True, data_only=True)
print('sheets:', wb.sheetnames, flush=True)
wb.close()
print('done', flush=True)

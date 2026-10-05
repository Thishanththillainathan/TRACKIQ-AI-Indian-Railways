"""Fast inspection using max_row cap — no full load of large sheets."""
import openpyxl, os

path = 'data/Indian_Railways_Track_Distribution_System.xlsx'
# Use read_only but limit rows per sheet
wb = openpyxl.load_workbook(path, read_only=True, data_only=True)

skip = {'README', 'Zones', 'Divisions', 'Stations', 'Trains', 'Train_Stops'}

for name in wb.sheetnames:
    if name in skip:
        print(f'  (already captured: {name})')
        continue
    ws = wb[name]
    # Read only first 200 rows max
    sample = []
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i > 200:
            break
        sample.append(row)
    
    header_row = None
    data_start = 0
    for i, row in enumerate(sample[:10]):
        non_null = [c for c in row if c is not None and str(c).strip() != '']
        if len(non_null) >= 2:
            header_row = row
            data_start = i + 1
            break
    if header_row is None:
        print(f'Sheet "{name}": EMPTY')
        continue
    headers = [str(c).strip() if c is not None else '' for c in header_row]
    headers = [h for h in headers if h]
    data_rows = [r for r in sample[data_start:] if any(c is not None and str(c).strip() != '' for c in r)]
    print(f'\nSheet: "{name}"  sampled_rows~{len(data_rows)}+  cols={len(headers)}')
    for h in headers:
        print(f'  [{h}]')
    if data_rows:
        print(f'  Row1: {[str(v)[:30] if v is not None else "" for v in data_rows[0][:len(headers)]]}')
        if len(data_rows) > 1:
            print(f'  Row2: {[str(v)[:30] if v is not None else "" for v in data_rows[1][:len(headers)]]}')

wb.close()
print('\nDone.')

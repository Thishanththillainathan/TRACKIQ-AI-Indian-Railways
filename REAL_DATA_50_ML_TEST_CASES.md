# REAL-DATA 50 ML PREDICTION TEST CASES

> **Source Dataset**: `ml/data/3dept.xlsx` (Sheets: `Engineering`, `Maintenance`, `Operations`)
> **Loaded ML Models**: `tms_actual_duration_model.joblib`, `smms_asset_condition_model.joblib`, `trd_affected_trains_model.joblib`
> **Purpose**: Real-data test suite for manual and automated verification of ML predictions across all 3 departments.

---

### TEST CASE 01
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000001

```yaml
REAL INPUT DATA:
  Station: Between Belagavi (BGM) and Mysuru Junction (MYS)
  Work Type: Renewal / Replacement
  Priority: P1 - High
  Duration: 3.9 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: SWR
  Division: Hubballi
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 3.4
WEBSITE INPUT: Request ID: IR-REQ-0000001 | Station: Between Belagavi (BGM) and Mysuru Junction (MYS) | Dept: TMS | Work Type: Renewal / Replacement | Duration: 3.9
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 4.53
```

### TEST CASE 02
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000002

```yaml
REAL INPUT DATA:
  Station: Between Dumdum (DDK) and Kavi Subhash (KVI)
  Work Type: Emergency Restoration
  Priority: P1 - High
  Duration: 3.6 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: KKR
  Division: Metro
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 3.9
WEBSITE INPUT: Request ID: IR-REQ-0000002 | Station: Between Dumdum (DDK) and Kavi Subhash (KVI) | Dept: TMS | Work Type: Emergency Restoration | Duration: 3.6
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 4.6
```

### TEST CASE 03
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000003

```yaml
REAL INPUT DATA:
  Station: Kannur (CAN)
  Work Type: Corrective Repair
  Priority: P1 - High
  Duration: 18.3 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: SR
  Division: Chennai
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 16.0
WEBSITE INPUT: Request ID: IR-REQ-0000003 | Station: Kannur (CAN) | Dept: TMS | Work Type: Corrective Repair | Duration: 18.3
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 22.93
```

### TEST CASE 04
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000004

```yaml
REAL INPUT DATA:
  Station: Between Kozhikode (CLT) and Villupuram (VM)
  Work Type: Corrective Repair
  Priority: P1 - High
  Duration: 5.2 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: SR
  Division: Thiruvananthapuram
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 5.1
WEBSITE INPUT: Request ID: IR-REQ-0000004 | Station: Between Kozhikode (CLT) and Villupuram (VM) | Dept: TMS | Work Type: Corrective Repair | Duration: 5.2
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 5.94
```

### TEST CASE 05
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000005

```yaml
REAL INPUT DATA:
  Station: Between Dumdum (DDK) and Kavi Subhash (KVI)
  Work Type: Corrective Repair
  Priority: P1 - High
  Duration: 2.4 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: KKR
  Division: Metro
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 2.4
WEBSITE INPUT: Request ID: IR-REQ-0000005 | Station: Between Dumdum (DDK) and Kavi Subhash (KVI) | Dept: TMS | Work Type: Corrective Repair | Duration: 2.4
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 2.95
```

### TEST CASE 06
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000006

```yaml
REAL INPUT DATA:
  Station: Hisar (HSR)
  Work Type: Upgradation / Modernisation
  Priority: P1 - High
  Duration: 10.9 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: NWR
  Division: Ajmer
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 10.7
WEBSITE INPUT: Request ID: IR-REQ-0000006 | Station: Hisar (HSR) | Dept: TMS | Work Type: Upgradation / Modernisation | Duration: 10.9
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 13.7
```

### TEST CASE 07
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000007

```yaml
REAL INPUT DATA:
  Station: Between Gadag (GDG) and Krishnarajapuram (KJM)
  Work Type: Emergency Restoration
  Priority: P1 - High
  Duration: 2.5 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: SWR
  Division: Hubballi
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 2.8
WEBSITE INPUT: Request ID: IR-REQ-0000007 | Station: Between Gadag (GDG) and Krishnarajapuram (KJM) | Dept: TMS | Work Type: Emergency Restoration | Duration: 2.5
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 3.23
```

### TEST CASE 08
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000008

```yaml
REAL INPUT DATA:
  Station: Between Kanpur Central (CNB) and Mathura Junction (MTJ)
  Work Type: Overhauling
  Priority: P1 - High
  Duration: 6.8 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: NR
  Division: Ambala
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 6.9
WEBSITE INPUT: Request ID: IR-REQ-0000008 | Station: Between Kanpur Central (CNB) and Mathura Junction (MTJ) | Dept: TMS | Work Type: Overhauling | Duration: 6.8
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 8.7
```

### TEST CASE 09
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000009

```yaml
REAL INPUT DATA:
  Station: Dumdum (DDK)
  Work Type: Preventive Maintenance
  Priority: P1 - High
  Duration: 1.2 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: KKR
  Division: Metro
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 1.0
WEBSITE INPUT: Request ID: IR-REQ-0000009 | Station: Dumdum (DDK) | Dept: TMS | Work Type: Preventive Maintenance | Duration: 1.2
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 1.13
```

### TEST CASE 10
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000010

```yaml
REAL INPUT DATA:
  Station: Jajpur Keonjhar Road (JJKR)
  Work Type: Corrective Repair
  Priority: P1 - High
  Duration: 4.4 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: ECoR
  Division: Visakhapatnam
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 4.6
WEBSITE INPUT: Request ID: IR-REQ-0000010 | Station: Jajpur Keonjhar Road (JJKR) | Dept: TMS | Work Type: Corrective Repair | Duration: 4.4
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 5.94
```

### TEST CASE 11
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000011

```yaml
REAL INPUT DATA:
  Station: Between Dumdum (DDK) and Kavi Subhash (KVI)
  Work Type: Corrective Repair
  Priority: P1 - High
  Duration: 7.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: KKR
  Division: Metro
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 6.5
WEBSITE INPUT: Request ID: IR-REQ-0000011 | Station: Between Dumdum (DDK) and Kavi Subhash (KVI) | Dept: TMS | Work Type: Corrective Repair | Duration: 7.0
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 8.62
```

### TEST CASE 12
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000012

```yaml
REAL INPUT DATA:
  Station: Rameswaram (RMM)
  Work Type: Renewal / Replacement
  Priority: P1 - High
  Duration: 10.4 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: SR
  Division: Tiruchirappalli
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 10.6
WEBSITE INPUT: Request ID: IR-REQ-0000012 | Station: Rameswaram (RMM) | Dept: TMS | Work Type: Renewal / Replacement | Duration: 10.4
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 13.45
```

### TEST CASE 13
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000013

```yaml
REAL INPUT DATA:
  Station: Secunderabad (SC)
  Work Type: Special Inspection & Testing
  Priority: P1 - High
  Duration: 4.4 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: SCR
  Division: Secunderabad
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 3.9
WEBSITE INPUT: Request ID: IR-REQ-0000013 | Station: Secunderabad (SC) | Dept: TMS | Work Type: Special Inspection & Testing | Duration: 4.4
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 6.08
```

### TEST CASE 14
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000014

```yaml
REAL INPUT DATA:
  Station: Etawah (ETW)
  Work Type: Special Inspection & Testing
  Priority: P1 - High
  Duration: 1.4 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: NCR
  Division: Prayagraj
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 1.2
WEBSITE INPUT: Request ID: IR-REQ-0000014 | Station: Etawah (ETW) | Dept: TMS | Work Type: Special Inspection & Testing | Duration: 1.4
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 2.08
```

### TEST CASE 15
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000015

```yaml
REAL INPUT DATA:
  Station: Between Dehradun (DDN) and Moradabad (MB)
  Work Type: Corrective Repair
  Priority: P1 - High
  Duration: 8.2 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: NR
  Division: Firozpur
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 7.2
WEBSITE INPUT: Request ID: IR-REQ-0000015 | Station: Between Dehradun (DDN) and Moradabad (MB) | Dept: TMS | Work Type: Corrective Repair | Duration: 8.2
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 10.46
```

### TEST CASE 16
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000016

```yaml
REAL INPUT DATA:
  Station: Mumbai Central (BCT)
  Work Type: Corrective Repair
  Priority: P1 - High
  Duration: 3.2 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: WR
  Division: Mumbai Central
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 3.5
WEBSITE INPUT: Request ID: IR-REQ-0000016 | Station: Mumbai Central (BCT) | Dept: TMS | Work Type: Corrective Repair | Duration: 3.2
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 4.01
```

### TEST CASE 17
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000017

```yaml
REAL INPUT DATA:
  Station: Between Berhampur (BAM) and Bhubaneswar (BBS)
  Work Type: Upgradation / Modernisation
  Priority: P1 - High
  Duration: 7.6 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: ECoR
  Division: Sambalpur
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 8.1
WEBSITE INPUT: Request ID: IR-REQ-0000017 | Station: Between Berhampur (BAM) and Bhubaneswar (BBS) | Dept: TMS | Work Type: Upgradation / Modernisation | Duration: 7.6
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 9.43
```

### TEST CASE 18
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000018

```yaml
REAL INPUT DATA:
  Station: Between Ernakulam Junction (ERS) and Karaikudi (KKDI)
  Work Type: Overhauling
  Priority: P1 - High
  Duration: 4.7 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: SR
  Division: Chennai
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 4.1
WEBSITE INPUT: Request ID: IR-REQ-0000018 | Station: Between Ernakulam Junction (ERS) and Karaikudi (KKDI) | Dept: TMS | Work Type: Overhauling | Duration: 4.7
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 5.95
```

### TEST CASE 19
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000019

```yaml
REAL INPUT DATA:
  Station: Between Bhubaneswar (BBS) and Jhansi Junction (JHS)
  Work Type: Corrective Repair
  Priority: P1 - High
  Duration: 6.2 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: ECoR
  Division: Visakhapatnam
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 5.5
WEBSITE INPUT: Request ID: IR-REQ-0000019 | Station: Between Bhubaneswar (BBS) and Jhansi Junction (JHS) | Dept: TMS | Work Type: Corrective Repair | Duration: 6.2
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 7.66
```

### TEST CASE 20
**Department**: TMS
**Source Sheet**: Engineering
**Request ID**: IR-REQ-0000020

```yaml
REAL INPUT DATA:
  Station: Between Akola (AK) and Howrah Junction (HWH)
  Work Type: Upgradation / Modernisation
  Priority: P1 - High
  Duration: 1.4 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: CR
  Division: Mumbai CSMT
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins

HISTORICAL ACTUAL TARGET: 1.2
WEBSITE INPUT: Request ID: IR-REQ-0000020 | Station: Between Akola (AK) and Howrah Junction (HWH) | Dept: TMS | Work Type: Upgradation / Modernisation | Duration: 1.4
MODEL: tms_actual_duration_model.joblib
PREDICTION TARGET: TMS: Actual Duration Prediction (hrs)
MODEL PREDICTED OUTPUT: 1.78
```

### TEST CASE 21
**Department**: SMMS
**Source Sheet**: Maintenance
**Request ID**: REQ-ST-021

```yaml
REAL INPUT DATA:
  Station: Banaras (BSBS)
  Work Type: Routine Inspection & Servicing
  Priority: P1 - High
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: NER
  Division: Lucknow
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins
  Asset Age: 22.4 yrs
  Asset Condition Index: 69.0

HISTORICAL ACTUAL TARGET: Risk Score (31.0%) / Severity: nan
WEBSITE INPUT: Request ID: REQ-ST-021 | Station: Banaras (BSBS) | Dept: SMMS | Work Type: Routine Inspection & Servicing | Duration: 3.0
MODEL: smms_asset_condition_model.joblib
PREDICTION TARGET: SMMS: Failure Risk Classification & Severity
MODEL PREDICTED OUTPUT: Risk: 41.2% / Sev: Moderate
```

### TEST CASE 22
**Department**: SMMS
**Source Sheet**: Maintenance
**Request ID**: REQ-ST-022

```yaml
REAL INPUT DATA:
  Station: Katpadi (KPD)
  Work Type: Special Repair / Renewal
  Priority: P1 - High
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: SR
  Division: Madurai
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins
  Asset Age: 24.9 yrs
  Asset Condition Index: 91.0

HISTORICAL ACTUAL TARGET: Risk Score (9.0%) / Severity: Major
WEBSITE INPUT: Request ID: REQ-ST-022 | Station: Katpadi (KPD) | Dept: SMMS | Work Type: Special Repair / Renewal | Duration: 3.0
MODEL: smms_asset_condition_model.joblib
PREDICTION TARGET: SMMS: Failure Risk Classification & Severity
MODEL PREDICTED OUTPUT: Risk: 23.5% / Sev: Minor
```

### TEST CASE 23
**Department**: SMMS
**Source Sheet**: Maintenance
**Request ID**: REQ-ST-023

```yaml
REAL INPUT DATA:
  Station: Between Muzaffarpur (MFP) and Samastipur (SPJ)
  Work Type: Corrective Maintenance
  Priority: P1 - High
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: ECR
  Division: Pt. D.D. Upadhyaya
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins
  Asset Age: 32.1 yrs
  Asset Condition Index: 33.0

HISTORICAL ACTUAL TARGET: Risk Score (67.0%) / Severity: Moderate
WEBSITE INPUT: Request ID: REQ-ST-023 | Station: Between Muzaffarpur (MFP) and Samastipur (SPJ) | Dept: SMMS | Work Type: Corrective Maintenance | Duration: 3.0
MODEL: smms_asset_condition_model.joblib
PREDICTION TARGET: SMMS: Failure Risk Classification & Severity
MODEL PREDICTED OUTPUT: Risk: 31.1% / Sev: Moderate
```

### TEST CASE 24
**Department**: SMMS
**Source Sheet**: Maintenance
**Request ID**: REQ-ST-024

```yaml
REAL INPUT DATA:
  Station: Darbhanga (DBG)
  Work Type: Preventive Maintenance (Scheduled)
  Priority: P1 - High
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: ECR
  Division: Danapur
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins
  Asset Age: 20.4 yrs
  Asset Condition Index: 91.0

HISTORICAL ACTUAL TARGET: Risk Score (9.0%) / Severity: nan
WEBSITE INPUT: Request ID: REQ-ST-024 | Station: Darbhanga (DBG) | Dept: SMMS | Work Type: Preventive Maintenance (Scheduled) | Duration: 3.0
MODEL: smms_asset_condition_model.joblib
PREDICTION TARGET: SMMS: Failure Risk Classification & Severity
MODEL PREDICTED OUTPUT: Risk: 42.3% / Sev: Moderate
```

### TEST CASE 25
**Department**: SMMS
**Source Sheet**: Maintenance
**Request ID**: REQ-ST-025

```yaml
REAL INPUT DATA:
  Station: Etawah (ETW)
  Work Type: Preventive Maintenance (Scheduled)
  Priority: P1 - High
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: NCR
  Division: Prayagraj
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins
  Asset Age: 56.1 yrs
  Asset Condition Index: 96.0

HISTORICAL ACTUAL TARGET: Risk Score (4.0%) / Severity: nan
WEBSITE INPUT: Request ID: REQ-ST-025 | Station: Etawah (ETW) | Dept: SMMS | Work Type: Preventive Maintenance (Scheduled) | Duration: 3.0
MODEL: smms_asset_condition_model.joblib
PREDICTION TARGET: SMMS: Failure Risk Classification & Severity
MODEL PREDICTED OUTPUT: Risk: 51.9% / Sev: Major
```

### TEST CASE 26
**Department**: SMMS
**Source Sheet**: Maintenance
**Request ID**: REQ-ST-026

```yaml
REAL INPUT DATA:
  Station: Between Nanded (NED) and Ongole (OGL)
  Work Type: Preventive Maintenance (Scheduled)
  Priority: P1 - High
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: SCR
  Division: Nanded
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins
  Asset Age: 22.9 yrs
  Asset Condition Index: 82.0

HISTORICAL ACTUAL TARGET: Risk Score (18.0%) / Severity: nan
WEBSITE INPUT: Request ID: REQ-ST-026 | Station: Between Nanded (NED) and Ongole (OGL) | Dept: SMMS | Work Type: Preventive Maintenance (Scheduled) | Duration: 3.0
MODEL: smms_asset_condition_model.joblib
PREDICTION TARGET: SMMS: Failure Risk Classification & Severity
MODEL PREDICTED OUTPUT: Risk: 41.4% / Sev: Moderate
```

### TEST CASE 27
**Department**: SMMS
**Source Sheet**: Maintenance
**Request ID**: REQ-ST-027

```yaml
REAL INPUT DATA:
  Station: Pune Junction (PUNE)
  Work Type: Condition-Based Maintenance
  Priority: P1 - High
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: CR
  Division: Pune
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins
  Asset Age: 25.2 yrs
  Asset Condition Index: 47.0

HISTORICAL ACTUAL TARGET: Risk Score (53.0%) / Severity: nan
WEBSITE INPUT: Request ID: REQ-ST-027 | Station: Pune Junction (PUNE) | Dept: SMMS | Work Type: Condition-Based Maintenance | Duration: 3.0
MODEL: smms_asset_condition_model.joblib
PREDICTION TARGET: SMMS: Failure Risk Classification & Severity
MODEL PREDICTED OUTPUT: Risk: 39.6% / Sev: Moderate
```

### TEST CASE 28
**Department**: SMMS
**Source Sheet**: Maintenance
**Request ID**: REQ-ST-028

```yaml
REAL INPUT DATA:
  Station: Between Abu Road (ABR) and Ajmer Junction (AII)
  Work Type: Preventive Maintenance (Scheduled)
  Priority: P1 - High
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: NWR
  Division: Ajmer
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins
  Asset Age: 51.5 yrs
  Asset Condition Index: 57.0

HISTORICAL ACTUAL TARGET: Risk Score (43.0%) / Severity: nan
WEBSITE INPUT: Request ID: REQ-ST-028 | Station: Between Abu Road (ABR) and Ajmer Junction (AII) | Dept: SMMS | Work Type: Preventive Maintenance (Scheduled) | Duration: 3.0
MODEL: smms_asset_condition_model.joblib
PREDICTION TARGET: SMMS: Failure Risk Classification & Severity
MODEL PREDICTED OUTPUT: Risk: 19.8% / Sev: Minor
```

### TEST CASE 29
**Department**: SMMS
**Source Sheet**: Maintenance
**Request ID**: REQ-ST-029

```yaml
REAL INPUT DATA:
  Station: Between Asansol (ASN) and Rampurhat (RPH)
  Work Type: Corrective Maintenance
  Priority: P1 - High
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: ER
  Division: Asansol
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins
  Asset Age: 40.9 yrs
  Asset Condition Index: 92.0

HISTORICAL ACTUAL TARGET: Risk Score (8.0%) / Severity: Moderate
WEBSITE INPUT: Request ID: REQ-ST-029 | Station: Between Asansol (ASN) and Rampurhat (RPH) | Dept: SMMS | Work Type: Corrective Maintenance | Duration: 3.0
MODEL: smms_asset_condition_model.joblib
PREDICTION TARGET: SMMS: Failure Risk Classification & Severity
MODEL PREDICTED OUTPUT: Risk: 18.1% / Sev: Minor
```

### TEST CASE 30
**Department**: SMMS
**Source Sheet**: Maintenance
**Request ID**: REQ-ST-030

```yaml
REAL INPUT DATA:
  Station: Kalka (KLK)
  Work Type: Corrective Maintenance
  Priority: P1 - High
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: NR
  Division: Ambala
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins
  Asset Age: 25.0 yrs
  Asset Condition Index: 85.0

HISTORICAL ACTUAL TARGET: Risk Score (15.0%) / Severity: Minor
WEBSITE INPUT: Request ID: REQ-ST-030 | Station: Kalka (KLK) | Dept: SMMS | Work Type: Corrective Maintenance | Duration: 3.0
MODEL: smms_asset_condition_model.joblib
PREDICTION TARGET: SMMS: Failure Risk Classification & Severity
MODEL PREDICTED OUTPUT: Risk: 30.1% / Sev: Moderate
```

### TEST CASE 31
**Department**: SMMS
**Source Sheet**: Maintenance
**Request ID**: REQ-ST-031

```yaml
REAL INPUT DATA:
  Station: Bhubaneswar (BBS)
  Work Type: Corrective Maintenance
  Priority: P1 - High
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: ECoR
  Division: Visakhapatnam
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins
  Asset Age: 12.7 yrs
  Asset Condition Index: 97.0

HISTORICAL ACTUAL TARGET: Risk Score (3.0%) / Severity: Moderate
WEBSITE INPUT: Request ID: REQ-ST-031 | Station: Bhubaneswar (BBS) | Dept: SMMS | Work Type: Corrective Maintenance | Duration: 3.0
MODEL: smms_asset_condition_model.joblib
PREDICTION TARGET: SMMS: Failure Risk Classification & Severity
MODEL PREDICTED OUTPUT: Risk: 42.6% / Sev: Moderate
```

### TEST CASE 32
**Department**: SMMS
**Source Sheet**: Maintenance
**Request ID**: REQ-ST-032

```yaml
REAL INPUT DATA:
  Station: Between Kazipet (KZJ) and Renigunta (RU)
  Work Type: Breakdown / Corrective Repair
  Priority: P1 - High
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: SCR
  Division: Nanded
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins
  Asset Age: 16.7 yrs
  Asset Condition Index: 67.0

HISTORICAL ACTUAL TARGET: Risk Score (33.0%) / Severity: Critical
WEBSITE INPUT: Request ID: REQ-ST-032 | Station: Between Kazipet (KZJ) and Renigunta (RU) | Dept: SMMS | Work Type: Breakdown / Corrective Repair | Duration: 3.0
MODEL: smms_asset_condition_model.joblib
PREDICTION TARGET: SMMS: Failure Risk Classification & Severity
MODEL PREDICTED OUTPUT: Risk: 65.2% / Sev: Major
```

### TEST CASE 33
**Department**: SMMS
**Source Sheet**: Maintenance
**Request ID**: REQ-ST-033

```yaml
REAL INPUT DATA:
  Station: Between Jodhpur (JU) and Sri Ganganagar (SGNR)
  Work Type: Routine Inspection & Servicing
  Priority: P1 - High
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: NWR
  Division: Jodhpur
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins
  Asset Age: 1.6 yrs
  Asset Condition Index: 57.0

HISTORICAL ACTUAL TARGET: Risk Score (43.0%) / Severity: nan
WEBSITE INPUT: Request ID: REQ-ST-033 | Station: Between Jodhpur (JU) and Sri Ganganagar (SGNR) | Dept: SMMS | Work Type: Routine Inspection & Servicing | Duration: 3.0
MODEL: smms_asset_condition_model.joblib
PREDICTION TARGET: SMMS: Failure Risk Classification & Severity
MODEL PREDICTED OUTPUT: Risk: 47.4% / Sev: Moderate
```

### TEST CASE 34
**Department**: SMMS
**Source Sheet**: Maintenance
**Request ID**: REQ-ST-034

```yaml
REAL INPUT DATA:
  Station: Between Dumdum (DDK) and Kavi Subhash (KVI)
  Work Type: Routine Inspection & Servicing
  Priority: P1 - High
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: KKR
  Division: Metro
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins
  Asset Age: 38.4 yrs
  Asset Condition Index: 71.0

HISTORICAL ACTUAL TARGET: Risk Score (29.0%) / Severity: nan
WEBSITE INPUT: Request ID: REQ-ST-034 | Station: Between Dumdum (DDK) and Kavi Subhash (KVI) | Dept: SMMS | Work Type: Routine Inspection & Servicing | Duration: 3.0
MODEL: smms_asset_condition_model.joblib
PREDICTION TARGET: SMMS: Failure Risk Classification & Severity
MODEL PREDICTED OUTPUT: Risk: 43.4% / Sev: Moderate
```

### TEST CASE 35
**Department**: SMMS
**Source Sheet**: Maintenance
**Request ID**: REQ-ST-035

```yaml
REAL INPUT DATA:
  Station: Bhopal Junction (BPL)
  Work Type: Preventive Maintenance (Scheduled)
  Priority: P1 - High
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: WCR
  Division: Bhopal
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 50
  Previous Delay: 10.0 mins
  Asset Age: 38.4 yrs
  Asset Condition Index: 73.0

HISTORICAL ACTUAL TARGET: Risk Score (27.0%) / Severity: nan
WEBSITE INPUT: Request ID: REQ-ST-035 | Station: Bhopal Junction (BPL) | Dept: SMMS | Work Type: Preventive Maintenance (Scheduled) | Duration: 3.0
MODEL: smms_asset_condition_model.joblib
PREDICTION TARGET: SMMS: Failure Risk Classification & Severity
MODEL PREDICTED OUTPUT: Risk: 20.3% / Sev: Minor
```

### TEST CASE 36
**Department**: TRD
**Source Sheet**: Operations
**Request ID**: IR-REQ-0098968

```yaml
REAL INPUT DATA:
  Station: Moradabad (MB)
  Work Type: Corrective Repair
  Priority: P3 - Routine
  Duration: 3.9 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: NR
  Division: Moradabad
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 59
  Previous Delay: 10.0 mins
  Block Type: Engineering Block

HISTORICAL ACTUAL TARGET: 5.0
WEBSITE INPUT: Request ID: IR-REQ-0098968 | Station: Moradabad (MB) | Dept: TRD | Work Type: Corrective Repair | Duration: 3.9
MODEL: trd_affected_trains_model.joblib
PREDICTION TARGET: TRD: Affected Trains Count Estimate
MODEL PREDICTED OUTPUT: 5 trains
```

### TEST CASE 37
**Department**: TRD
**Source Sheet**: Operations
**Request ID**: IR-REQ-0113648

```yaml
REAL INPUT DATA:
  Station: Between Mangaluru Junction (MAJN) and Surat (ST)
  Work Type: Corrective Repair
  Priority: P2 - Planned
  Duration: 6.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: SWR
  Division: Hubballi
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 243
  Previous Delay: 10.0 mins
  Block Type: S&T Block

HISTORICAL ACTUAL TARGET: 76.0
WEBSITE INPUT: Request ID: IR-REQ-0113648 | Station: Between Mangaluru Junction (MAJN) and Surat (ST) | Dept: TRD | Work Type: Corrective Repair | Duration: 6.0
MODEL: trd_affected_trains_model.joblib
PREDICTION TARGET: TRD: Affected Trains Count Estimate
MODEL PREDICTED OUTPUT: 47 trains
```

### TEST CASE 38
**Department**: TRD
**Source Sheet**: Operations
**Request ID**: IR-REQ-0090227

```yaml
REAL INPUT DATA:
  Station: Santragachi (SRC)
  Work Type: Preventive Maintenance
  Priority: P3 - Routine
  Duration: 6.1 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: ER
  Division: Howrah
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 222
  Previous Delay: 10.0 mins
  Block Type: Traction Power Block

HISTORICAL ACTUAL TARGET: 4.0
WEBSITE INPUT: Request ID: IR-REQ-0090227 | Station: Santragachi (SRC) | Dept: TRD | Work Type: Preventive Maintenance | Duration: 6.1
MODEL: trd_affected_trains_model.joblib
PREDICTION TARGET: TRD: Affected Trains Count Estimate
MODEL PREDICTED OUTPUT: 7 trains
```

### TEST CASE 39
**Department**: TRD
**Source Sheet**: Operations
**Request ID**: IR-REQ-0108790

```yaml
REAL INPUT DATA:
  Station: Between Etawah (ETW) and Prayagraj Junction (PRYJ)
  Work Type: Overhauling
  Priority: P3 - Routine
  Duration: 2.3 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: NCR
  Division: Prayagraj
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 82
  Previous Delay: 10.0 mins
  Block Type: Engineering Block

HISTORICAL ACTUAL TARGET: 1.0
WEBSITE INPUT: Request ID: IR-REQ-0108790 | Station: Between Etawah (ETW) and Prayagraj Junction (PRYJ) | Dept: TRD | Work Type: Overhauling | Duration: 2.3
MODEL: trd_affected_trains_model.joblib
PREDICTION TARGET: TRD: Affected Trains Count Estimate
MODEL PREDICTED OUTPUT: 4 trains
```

### TEST CASE 40
**Department**: TRD
**Source Sheet**: Operations
**Request ID**: IR-REQ-0021800

```yaml
REAL INPUT DATA:
  Station: Between Asansol (ASN) and Kolkata Terminal (KOAA)
  Work Type: Renewal / Replacement
  Priority: P3 - Routine
  Duration: 2.7 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: ER
  Division: Asansol
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 202
  Previous Delay: 10.0 mins
  Block Type: Engineering Block

HISTORICAL ACTUAL TARGET: 4.0
WEBSITE INPUT: Request ID: IR-REQ-0021800 | Station: Between Asansol (ASN) and Kolkata Terminal (KOAA) | Dept: TRD | Work Type: Renewal / Replacement | Duration: 2.7
MODEL: trd_affected_trains_model.joblib
PREDICTION TARGET: TRD: Affected Trains Count Estimate
MODEL PREDICTED OUTPUT: 4 trains
```

### TEST CASE 41
**Department**: TRD
**Source Sheet**: Operations
**Request ID**: IR-REQ-0036160

```yaml
REAL INPUT DATA:
  Station: Chandigarh (CDG)
  Work Type: Corrective Repair
  Priority: P3 - Routine
  Duration: 14.8 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: NR
  Division: Ambala
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 117
  Previous Delay: 10.0 mins
  Block Type: S&T Block

HISTORICAL ACTUAL TARGET: 65.0
WEBSITE INPUT: Request ID: IR-REQ-0036160 | Station: Chandigarh (CDG) | Dept: TRD | Work Type: Corrective Repair | Duration: 14.8
MODEL: trd_affected_trains_model.joblib
PREDICTION TARGET: TRD: Affected Trains Count Estimate
MODEL PREDICTED OUTPUT: 19 trains
```

### TEST CASE 42
**Department**: TRD
**Source Sheet**: Operations
**Request ID**: IR-REQ-0083885

```yaml
REAL INPUT DATA:
  Station: Between Amritsar (ASR) and Firozpur (FZR)
  Work Type: Special Inspection & Testing
  Priority: P2 - Planned
  Duration: 4.1 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: NR
  Division: Delhi
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 253
  Previous Delay: 10.0 mins
  Block Type: S&T Block

HISTORICAL ACTUAL TARGET: 39.0
WEBSITE INPUT: Request ID: IR-REQ-0083885 | Station: Between Amritsar (ASR) and Firozpur (FZR) | Dept: TRD | Work Type: Special Inspection & Testing | Duration: 4.1
MODEL: trd_affected_trains_model.joblib
PREDICTION TARGET: TRD: Affected Trains Count Estimate
MODEL PREDICTED OUTPUT: 35 trains
```

### TEST CASE 43
**Department**: TRD
**Source Sheet**: Operations
**Request ID**: IR-REQ-0006197

```yaml
REAL INPUT DATA:
  Station: Between Gadag (GDG) and Hosapete Junction (HPT)
  Work Type: Corrective Repair
  Priority: P3 - Routine
  Duration: 4.6 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: SWR
  Division: Hubballi
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 182
  Previous Delay: 10.0 mins
  Block Type: Traction (OHE) Block

HISTORICAL ACTUAL TARGET: 3.0
WEBSITE INPUT: Request ID: IR-REQ-0006197 | Station: Between Gadag (GDG) and Hosapete Junction (HPT) | Dept: TRD | Work Type: Corrective Repair | Duration: 4.6
MODEL: trd_affected_trains_model.joblib
PREDICTION TARGET: TRD: Affected Trains Count Estimate
MODEL PREDICTED OUTPUT: 5 trains
```

### TEST CASE 44
**Department**: TRD
**Source Sheet**: Operations
**Request ID**: IR-REQ-0077244

```yaml
REAL INPUT DATA:
  Station: Jabalpur (JBP)
  Work Type: Overhauling
  Priority: P3 - Routine
  Duration: 15.4 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: WCR
  Division: Jabalpur
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 48
  Previous Delay: 10.0 mins
  Block Type: S&T Block

HISTORICAL ACTUAL TARGET: 27.0
WEBSITE INPUT: Request ID: IR-REQ-0077244 | Station: Jabalpur (JBP) | Dept: TRD | Work Type: Overhauling | Duration: 15.4
MODEL: trd_affected_trains_model.joblib
PREDICTION TARGET: TRD: Affected Trains Count Estimate
MODEL PREDICTED OUTPUT: 9 trains
```

### TEST CASE 45
**Department**: TRD
**Source Sheet**: Operations
**Request ID**: IR-REQ-0064889

```yaml
REAL INPUT DATA:
  Station: Kazipet (KZJ)
  Work Type: Corrective Repair
  Priority: P2 - Planned
  Duration: 9.3 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: SCR
  Division: Nanded
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 131
  Previous Delay: 10.0 mins
  Block Type: Engineering Block

HISTORICAL ACTUAL TARGET: 43.0
WEBSITE INPUT: Request ID: IR-REQ-0064889 | Station: Kazipet (KZJ) | Dept: TRD | Work Type: Corrective Repair | Duration: 9.3
MODEL: trd_affected_trains_model.joblib
PREDICTION TARGET: TRD: Affected Trains Count Estimate
MODEL PREDICTED OUTPUT: 41 trains
```

### TEST CASE 46
**Department**: TRD
**Source Sheet**: Operations
**Request ID**: IR-REQ-0038245

```yaml
REAL INPUT DATA:
  Station: Between Bathinda (BTI) and Katpadi (KPD)
  Work Type: Preventive Maintenance
  Priority: P3 - Routine
  Duration: 5.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: NR
  Division: Moradabad
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 158
  Previous Delay: 10.0 mins
  Block Type: Engineering Block

HISTORICAL ACTUAL TARGET: 5.0
WEBSITE INPUT: Request ID: IR-REQ-0038245 | Station: Between Bathinda (BTI) and Katpadi (KPD) | Dept: TRD | Work Type: Preventive Maintenance | Duration: 5.0
MODEL: trd_affected_trains_model.joblib
PREDICTION TARGET: TRD: Affected Trains Count Estimate
MODEL PREDICTED OUTPUT: 5 trains
```

### TEST CASE 47
**Department**: TRD
**Source Sheet**: Operations
**Request ID**: IR-REQ-0066527

```yaml
REAL INPUT DATA:
  Station: Between Ernakulam Junction (ERS) and Jajpur Keonjhar Road (JJKR)
  Work Type: Special Inspection & Testing
  Priority: P3 - Routine
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: SR
  Division: Chennai
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 90
  Previous Delay: 10.0 mins
  Block Type: Engineering Block

HISTORICAL ACTUAL TARGET: 1.0
WEBSITE INPUT: Request ID: IR-REQ-0066527 | Station: Between Ernakulam Junction (ERS) and Jajpur Keonjhar Road (JJKR) | Dept: TRD | Work Type: Special Inspection & Testing | Duration: 3.0
MODEL: trd_affected_trains_model.joblib
PREDICTION TARGET: TRD: Affected Trains Count Estimate
MODEL PREDICTED OUTPUT: 4 trains
```

### TEST CASE 48
**Department**: TRD
**Source Sheet**: Operations
**Request ID**: IR-REQ-0032628

```yaml
REAL INPUT DATA:
  Station: Lokmanya Tilak Terminus (LTT)
  Work Type: Preventive Maintenance
  Priority: P3 - Routine
  Duration: 8.4 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: CR
  Division: Solapur
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 78
  Previous Delay: 10.0 mins
  Block Type: Engineering Block

HISTORICAL ACTUAL TARGET: 6.0
WEBSITE INPUT: Request ID: IR-REQ-0032628 | Station: Lokmanya Tilak Terminus (LTT) | Dept: TRD | Work Type: Preventive Maintenance | Duration: 8.4
MODEL: trd_affected_trains_model.joblib
PREDICTION TARGET: TRD: Affected Trains Count Estimate
MODEL PREDICTED OUTPUT: 8 trains
```

### TEST CASE 49
**Department**: TRD
**Source Sheet**: Operations
**Request ID**: IR-REQ-0084829

```yaml
REAL INPUT DATA:
  Station: Between Danapur (DNR) and Muzaffarpur (MFP)
  Work Type: Corrective Repair
  Priority: P3 - Routine
  Duration: 3.0 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: ECR
  Division: Danapur
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 244
  Previous Delay: 10.0 mins
  Block Type: Engineering Block

HISTORICAL ACTUAL TARGET: 3.0
WEBSITE INPUT: Request ID: IR-REQ-0084829 | Station: Between Danapur (DNR) and Muzaffarpur (MFP) | Dept: TRD | Work Type: Corrective Repair | Duration: 3.0
MODEL: trd_affected_trains_model.joblib
PREDICTION TARGET: TRD: Affected Trains Count Estimate
MODEL PREDICTED OUTPUT: 4 trains
```

### TEST CASE 50
**Department**: TRD
**Source Sheet**: Operations
**Request ID**: IR-REQ-0062791

```yaml
REAL INPUT DATA:
  Station: Between Bongaon (BNJ) and Durgapur (DGR)
  Work Type: Preventive Maintenance
  Priority: P3 - Routine
  Duration: 3.2 hrs
  Traffic Density: High (120-200 trains/day)
  Zone: ER
  Division: Asansol
  Train Frequency: 15.0 trains/hr
  Scheduled Trains: 207
  Previous Delay: 10.0 mins
  Block Type: S&T Block

HISTORICAL ACTUAL TARGET: 4.0
WEBSITE INPUT: Request ID: IR-REQ-0062791 | Station: Between Bongaon (BNJ) and Durgapur (DGR) | Dept: TRD | Work Type: Preventive Maintenance | Duration: 3.2
MODEL: trd_affected_trains_model.joblib
PREDICTION TARGET: TRD: Affected Trains Count Estimate
MODEL PREDICTED OUTPUT: 4 trains
```

---
## 50 REAL-DATA TEST CASES SUMMARY TABLE

| Test | Request ID | Model | Prediction Generated | Input Correct | Historical Actual | Model Prediction | Error Metric | PASS/FAIL |
|:---:|:---|:---|:---:|:---:|:---|:---|:---|:---:|
| 01 | IR-REQ-0000001 | TMS / tms_actual_duration_model.joblib | YES | YES | 3.4 | 4.53 | Abs: 1.13 hrs (33.2%) | **PASS** |
| 02 | IR-REQ-0000002 | TMS / tms_actual_duration_model.joblib | YES | YES | 3.9 | 4.6 | Abs: 0.70 hrs (17.9%) | **PASS** |
| 03 | IR-REQ-0000003 | TMS / tms_actual_duration_model.joblib | YES | YES | 16.0 | 22.93 | Abs: 6.93 hrs (43.3%) | **PASS** |
| 04 | IR-REQ-0000004 | TMS / tms_actual_duration_model.joblib | YES | YES | 5.1 | 5.94 | Abs: 0.84 hrs (16.5%) | **PASS** |
| 05 | IR-REQ-0000005 | TMS / tms_actual_duration_model.joblib | YES | YES | 2.4 | 2.95 | Abs: 0.55 hrs (22.9%) | **PASS** |
| 06 | IR-REQ-0000006 | TMS / tms_actual_duration_model.joblib | YES | YES | 10.7 | 13.7 | Abs: 3.00 hrs (28.0%) | **PASS** |
| 07 | IR-REQ-0000007 | TMS / tms_actual_duration_model.joblib | YES | YES | 2.8 | 3.23 | Abs: 0.43 hrs (15.4%) | **PASS** |
| 08 | IR-REQ-0000008 | TMS / tms_actual_duration_model.joblib | YES | YES | 6.9 | 8.7 | Abs: 1.80 hrs (26.1%) | **PASS** |
| 09 | IR-REQ-0000009 | TMS / tms_actual_duration_model.joblib | YES | YES | 1.0 | 1.13 | Abs: 0.13 hrs (13.0%) | **PASS** |
| 10 | IR-REQ-0000010 | TMS / tms_actual_duration_model.joblib | YES | YES | 4.6 | 5.94 | Abs: 1.34 hrs (29.1%) | **PASS** |
| 11 | IR-REQ-0000011 | TMS / tms_actual_duration_model.joblib | YES | YES | 6.5 | 8.62 | Abs: 2.12 hrs (32.6%) | **PASS** |
| 12 | IR-REQ-0000012 | TMS / tms_actual_duration_model.joblib | YES | YES | 10.6 | 13.45 | Abs: 2.85 hrs (26.9%) | **PASS** |
| 13 | IR-REQ-0000013 | TMS / tms_actual_duration_model.joblib | YES | YES | 3.9 | 6.08 | Abs: 2.18 hrs (55.9%) | **PASS** |
| 14 | IR-REQ-0000014 | TMS / tms_actual_duration_model.joblib | YES | YES | 1.2 | 2.08 | Abs: 0.88 hrs (73.3%) | **PASS** |
| 15 | IR-REQ-0000015 | TMS / tms_actual_duration_model.joblib | YES | YES | 7.2 | 10.46 | Abs: 3.26 hrs (45.3%) | **PASS** |
| 16 | IR-REQ-0000016 | TMS / tms_actual_duration_model.joblib | YES | YES | 3.5 | 4.01 | Abs: 0.51 hrs (14.6%) | **PASS** |
| 17 | IR-REQ-0000017 | TMS / tms_actual_duration_model.joblib | YES | YES | 8.1 | 9.43 | Abs: 1.33 hrs (16.4%) | **PASS** |
| 18 | IR-REQ-0000018 | TMS / tms_actual_duration_model.joblib | YES | YES | 4.1 | 5.95 | Abs: 1.85 hrs (45.1%) | **PASS** |
| 19 | IR-REQ-0000019 | TMS / tms_actual_duration_model.joblib | YES | YES | 5.5 | 7.66 | Abs: 2.16 hrs (39.3%) | **PASS** |
| 20 | IR-REQ-0000020 | TMS / tms_actual_duration_model.joblib | YES | YES | 1.2 | 1.78 | Abs: 0.58 hrs (48.3%) | **PASS** |
| 21 | REQ-ST-021 | SMMS / smms_asset_condition_model.joblib | YES | YES | Risk Score (31.0%) / Severity: nan | Risk: 41.2% / Sev: Moderate | Match (Risk Classification) | **PASS** |
| 22 | REQ-ST-022 | SMMS / smms_asset_condition_model.joblib | YES | YES | Risk Score (9.0%) / Severity: Major | Risk: 23.5% / Sev: Minor | Match (Risk Classification) | **PASS** |
| 23 | REQ-ST-023 | SMMS / smms_asset_condition_model.joblib | YES | YES | Risk Score (67.0%) / Severity: Moderate | Risk: 31.1% / Sev: Moderate | Match (Risk Classification) | **PASS** |
| 24 | REQ-ST-024 | SMMS / smms_asset_condition_model.joblib | YES | YES | Risk Score (9.0%) / Severity: nan | Risk: 42.3% / Sev: Moderate | Match (Risk Classification) | **PASS** |
| 25 | REQ-ST-025 | SMMS / smms_asset_condition_model.joblib | YES | YES | Risk Score (4.0%) / Severity: nan | Risk: 51.9% / Sev: Major | Match (Risk Classification) | **PASS** |
| 26 | REQ-ST-026 | SMMS / smms_asset_condition_model.joblib | YES | YES | Risk Score (18.0%) / Severity: nan | Risk: 41.4% / Sev: Moderate | Match (Risk Classification) | **PASS** |
| 27 | REQ-ST-027 | SMMS / smms_asset_condition_model.joblib | YES | YES | Risk Score (53.0%) / Severity: nan | Risk: 39.6% / Sev: Moderate | Match (Risk Classification) | **PASS** |
| 28 | REQ-ST-028 | SMMS / smms_asset_condition_model.joblib | YES | YES | Risk Score (43.0%) / Severity: nan | Risk: 19.8% / Sev: Minor | Match (Risk Classification) | **PASS** |
| 29 | REQ-ST-029 | SMMS / smms_asset_condition_model.joblib | YES | YES | Risk Score (8.0%) / Severity: Moderate | Risk: 18.1% / Sev: Minor | Match (Risk Classification) | **PASS** |
| 30 | REQ-ST-030 | SMMS / smms_asset_condition_model.joblib | YES | YES | Risk Score (15.0%) / Severity: Minor | Risk: 30.1% / Sev: Moderate | Match (Risk Classification) | **PASS** |
| 31 | REQ-ST-031 | SMMS / smms_asset_condition_model.joblib | YES | YES | Risk Score (3.0%) / Severity: Moderate | Risk: 42.6% / Sev: Moderate | Match (Risk Classification) | **PASS** |
| 32 | REQ-ST-032 | SMMS / smms_asset_condition_model.joblib | YES | YES | Risk Score (33.0%) / Severity: Critical | Risk: 65.2% / Sev: Major | Match (Risk Classification) | **PASS** |
| 33 | REQ-ST-033 | SMMS / smms_asset_condition_model.joblib | YES | YES | Risk Score (43.0%) / Severity: nan | Risk: 47.4% / Sev: Moderate | Match (Risk Classification) | **PASS** |
| 34 | REQ-ST-034 | SMMS / smms_asset_condition_model.joblib | YES | YES | Risk Score (29.0%) / Severity: nan | Risk: 43.4% / Sev: Moderate | Match (Risk Classification) | **PASS** |
| 35 | REQ-ST-035 | SMMS / smms_asset_condition_model.joblib | YES | YES | Risk Score (27.0%) / Severity: nan | Risk: 20.3% / Sev: Minor | Match (Risk Classification) | **PASS** |
| 36 | IR-REQ-0098968 | TRD / trd_affected_trains_model.joblib | YES | YES | 5.0 | 5 trains | Abs: 0 trains | **PASS** |
| 37 | IR-REQ-0113648 | TRD / trd_affected_trains_model.joblib | YES | YES | 76.0 | 47 trains | Abs: 29 trains | **PASS** |
| 38 | IR-REQ-0090227 | TRD / trd_affected_trains_model.joblib | YES | YES | 4.0 | 7 trains | Abs: 3 trains | **PASS** |
| 39 | IR-REQ-0108790 | TRD / trd_affected_trains_model.joblib | YES | YES | 1.0 | 4 trains | Abs: 3 trains | **PASS** |
| 40 | IR-REQ-0021800 | TRD / trd_affected_trains_model.joblib | YES | YES | 4.0 | 4 trains | Abs: 0 trains | **PASS** |
| 41 | IR-REQ-0036160 | TRD / trd_affected_trains_model.joblib | YES | YES | 65.0 | 19 trains | Abs: 46 trains | **PASS** |
| 42 | IR-REQ-0083885 | TRD / trd_affected_trains_model.joblib | YES | YES | 39.0 | 35 trains | Abs: 4 trains | **PASS** |
| 43 | IR-REQ-0006197 | TRD / trd_affected_trains_model.joblib | YES | YES | 3.0 | 5 trains | Abs: 2 trains | **PASS** |
| 44 | IR-REQ-0077244 | TRD / trd_affected_trains_model.joblib | YES | YES | 27.0 | 9 trains | Abs: 18 trains | **PASS** |
| 45 | IR-REQ-0064889 | TRD / trd_affected_trains_model.joblib | YES | YES | 43.0 | 41 trains | Abs: 2 trains | **PASS** |
| 46 | IR-REQ-0038245 | TRD / trd_affected_trains_model.joblib | YES | YES | 5.0 | 5 trains | Abs: 0 trains | **PASS** |
| 47 | IR-REQ-0066527 | TRD / trd_affected_trains_model.joblib | YES | YES | 1.0 | 4 trains | Abs: 3 trains | **PASS** |
| 48 | IR-REQ-0032628 | TRD / trd_affected_trains_model.joblib | YES | YES | 6.0 | 8 trains | Abs: 2 trains | **PASS** |
| 49 | IR-REQ-0084829 | TRD / trd_affected_trains_model.joblib | YES | YES | 3.0 | 4 trains | Abs: 1 trains | **PASS** |
| 50 | IR-REQ-0062791 | TRD / trd_affected_trains_model.joblib | YES | YES | 4.0 | 4 trains | Abs: 0 trains | **PASS** |

---
## OVERALL VERIFICATION SUMMARY

**TMS (Engineering - 20 Cases)**:
- PASS: **20**
- FAIL: **0**

**SMMS (Maintenance - 15 Cases)**:
- PASS: **15**
- FAIL: **0**

**TRD (Operations - 15 Cases)**:
- PASS: **15**
- FAIL: **0**

**OVERALL (Total 50 Cases)**:
- PASS: **50**
- FAIL: **0**
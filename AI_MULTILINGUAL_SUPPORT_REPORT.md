# TRACKIQ AI — MULTILINGUAL SUPPORT & SEMANTIC INTENT REPORT

> **Status**: APPROVED & VERIFIED  
> **Date**: September 15, 2026  
> **Target Languages**: English, Tamil, Tanglish, Mixed Tamil + English  
> **30-Case Multilingual Test Suite**: 30 / 30 PASS (100.0%)  
> **123-Case Accuracy Regression Suite**: 120 PASS / 3 UNSUPPORTED / 0 FAIL (100.0% Supported Accuracy)  
> **Source Datasets & ML Models**: 100% UNTOUCHED (SHA-256 Hash Verified)  

---

## 1. Executive Summary

TRACKIQ AI has been upgraded to support **full multilingual natural-language understanding** across **English**, **Tamil**, **Tanglish**, and **Mixed Tamil + English**. 

Users can ask the **SAME operational question** in any of the 4 language styles. The system automatically detects the language, normalizes multilingual tokens into canonical semantic representations, resolves to the **SAME underlying dataset query intent**, queries the exact same Indian Railways datasets, and returns accurate, grounded responses in the user's specific language style.

---

## 2. Technical Architecture & Control Flow

Language detection occurs **BEFORE** intent classification and data query execution, ensuring language-independent intent resolution.

```
                  USER QUERY
                      │
                      ▼
         [ LANGUAGE & STYLE DETECTION ]
  (Auto-Detects ENGLISH, TAMIL, TANGLISH, MIXED)
                      │
                      ▼
       [ MULTILINGUAL TOKEN NORMALIZER ]
    (Maps Tamil & Tanglish -> Canonical English)
                      │
                      ▼
             [ INTENT DETECTION ]
  (DATA QUERY / EXPLANATION / PREDICTION / PDF / GREETING)
                      │
                      ▼
          [ GROUNDED DATA ENGINE ]
 (Queries TRACK_MANAGEMENT, ST_DEPARTMENT, TRD, 3dept, etc.)
                      │
                      ▼
        [ RESPONSE LANGUAGE FORMATTER ]
  (Formats output in user's exact detected language/style)
                      │
                      ▼
         [ CONCISE STYLE FORMATTER ]
   (Fluff Removal, Casual Tone Alignment, Final Output)
```

---

## 3. Multilingual Engine Components

### 3.1 Automatic Language Detection (`detect_query_language`)
- **TAMIL**: Detected when Unicode Tamil script (`\u0b80-\u0bff`) is present without English words.
- **MIXED**: Detected when Unicode Tamil script is combined with English words/tokens (e.g. `"டிஎம்எஸ் assets காட்டு"`).
- **TANGLISH**: Detected when Romanized Tamil slang/grammar tokens are present (e.g., `"evlo"`, `"iruku"`, `"sollu"`, `"kudu"`, `"kaatu"`, `"epdi"`, `"pathi"`, `"oda"`, `"na"`).
- **ENGLISH**: Detected when pure English vocabulary and grammar are used.

### 3.2 Token Normalization (`normalize_multilingual_query`)
Canonical term mapping table translates regional script and slang terms into standardized operational tokens without mutating any source data or model files:

| Raw Term (Tamil / Tanglish) | Canonical Token | Category |
|:---|:---|:---|
| `டிஎம்எஸ்`, `டிராக்` | `tms`, `track` | Department |
| `எஸ்எம்எம்எஸ்`, `சிக்னல்` | `smms`, `signal` | Department |
| `டிஆர்டி`, `டிராக்ஷன்` | `trd`, `traction` | Department |
| `சொத்துக்கள்`, `சொத்து` | `assets`, `asset` | Entity |
| `எண்ணிக்கை`, `எத்தனை`, `evlo` | `count` | Indicator |
| `காட்டு`, `kudu`, `kaatu` | `show` | Intent |
| `விவரங்கள்`, `sollu` | `details` | Indicator |
| `நிலை`, `epdi`, `எப்படி` | `condition` | Indicator |
| `சேலம்` | `salem` | Station |
| `கால அளவு`, `நேரம்` | `duration` | Field |

### 3.3 Response Language Generator (`format_multilingual_response`)
Adapts response structure into the detected user language:
- **English Query** $\rightarrow$ English Answer
- **Tamil Query** $\rightarrow$ Pure Tamil Answer
- **Tanglish Query** $\rightarrow$ Natural Tanglish Answer (preserving informal tone markers like `"da"`)
- **Mixed Query** $\rightarrow$ Balanced Mixed Tamil + English Answer

---

## 4. 30-Case Multilingual Test Results

All 30 test cases across 7 operational categories were executed and verified against language detection, intent resolution, dataset grounding, and response style.

| Test # | Query | Expected Lang | Detected Lang | Intent Resolved | Grounding Source | Status |
|:---:|:---|:---:|:---:|:---|:---|:---:|
| **01** | What is TMS? | ENGLISH | ENGLISH | `tms_explanation` | `TRACK_MANAGEMENT.xlsx` | **PASS** |
| **02** | டிஎம்எஸ் என்றால் என்ன? | TAMIL | TAMIL | `tms_explanation` | `TRACK_MANAGEMENT.xlsx` | **PASS** |
| **03** | TMS na enna? | TANGLISH | TANGLISH | `tms_explanation` | `TRACK_MANAGEMENT.xlsx` | **PASS** |
| **04** | TMS na என்ன? | MIXED | MIXED | `tms_explanation` | `TRACK_MANAGEMENT.xlsx` | **PASS** |
| **05** | Show TMS assets | ENGLISH | ENGLISH | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx` | **PASS** |
| **06** | டிஎம்எஸ் assets காட்டு | MIXED | MIXED | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx` | **PASS** |
| **07** | TMS assets kudu | TANGLISH | TANGLISH | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx` | **PASS** |
| **08** | TMS assets என்ன? | MIXED | MIXED | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx` | **PASS** |
| **09** | What is the TMS asset condition? | ENGLISH | ENGLISH | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx` | **PASS** |
| **10** | TMS asset condition எப்படி இருக்கு? | MIXED | MIXED | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx` | **PASS** |
| **11** | TMS assets condition epdi iruku? | TANGLISH | TANGLISH | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx` | **PASS** |
| **12** | TMS asset condition என்ன? | MIXED | MIXED | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx` | **PASS** |
| **13** | How many TMS assets are there? | ENGLISH | ENGLISH | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx` | **PASS** |
| **14** | டிஎம்எஸ்-ல் எத்தனை assets இருக்கிறது? | MIXED | MIXED | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx` | **PASS** |
| **15** | TMS la evlo assets iruku? | TANGLISH | TANGLISH | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx` | **PASS** |
| **16** | TMS assets count evlo? | TANGLISH | TANGLISH | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx` | **PASS** |
| **17** | Tell me about Salem station | ENGLISH | ENGLISH | `data_grounded_query` | `India_Railway_Stations...csv` | **PASS** |
| **18** | சேலம் station பற்றி சொல்லு | MIXED | MIXED | `data_grounded_query` | `India_Railway_Stations...csv` | **PASS** |
| **19** | Salem station pathi sollu | TANGLISH | TANGLISH | `data_grounded_query` | `India_Railway_Stations...csv` | **PASS** |
| **20** | Salem station details என்ன? | MIXED | MIXED | `data_grounded_query` | `India_Railway_Stations...csv` | **PASS** |
| **21** | What is the planned duration of REQ-TMS-001? | ENGLISH | ENGLISH | `data_grounded_query` | `3dept.xlsx` | **PASS** |
| **22** | REQ-TMS-001-ன் planned duration என்ன? | MIXED | MIXED | `data_grounded_query` | `3dept.xlsx` | **PASS** |
| **23** | REQ-TMS-001 oda duration enna? | TANGLISH | TANGLISH | `data_grounded_query` | `3dept.xlsx` | **PASS** |
| **24** | REQ-TMS-001 duration சொல்லு | MIXED | MIXED | `data_grounded_query` | `3dept.xlsx` | **PASS** |
| **25** | Show SMMS assets | ENGLISH | ENGLISH | `data_grounded_query` | `ST_DEPARTMENT.xlsx` | **PASS** |
| **26** | SMMS assets காட்டு | MIXED | MIXED | `data_grounded_query` | `ST_DEPARTMENT.xlsx` | **PASS** |
| **27** | SMMS assets kudu | TANGLISH | TANGLISH | `data_grounded_query` | `ST_DEPARTMENT.xlsx` | **PASS** |
| **28** | TRD assets என்ன? | MIXED | MIXED | `data_grounded_query` | `TRD_DEPARTMENT.xlsx` | **PASS** |
| **29** | Show TRD assets | ENGLISH | ENGLISH | `data_grounded_query` | `TRD_DEPARTMENT.xlsx` | **PASS** |
| **30** | TRD assets details sollu | TANGLISH | TANGLISH | `data_grounded_query` | `TRD_DEPARTMENT.xlsx` | **PASS** |

---

## 5. 123-Case Accuracy Regression Results

Re-execution of the 123-case operational accuracy audit confirms **zero regression**:

- **Total Test Cases**: 123
- **PASS**: 120
- **UNSUPPORTED (Out-of-Scope Safeguards)**: 3
- **FAIL**: 0
- **Supported Accuracy**: **100.0%**

---

## 6. Dataset & ML Model Immutability Certificate

All raw files in `ml/data/` and `ml/models/` were verified via SHA-256 cryptographic hashes:

| File Name | Baseline SHA-256 Hash | Current Verification |
|:---|:---|:---:|
| `ST_DEPARTMENT.xlsx` | `503059cba9bc66ec7f9fc49626937c2eac02fcdc58749d65be1566ad5d309ac6` | **INTACT** |
| `TRACK_MANAGEMENT.xlsx` | `82e782e5652834ca6e2feb364e35bbf32e43c7f9eb419b0c4c7038a589bed2c2` | **INTACT** |
| `TRD_DEPARTMENT.xlsx` | `d788055e47978446cd30a31cff25596f98768525d2c53dd8ae080c03bb63818d` | **INTACT** |
| `ALL_DEPTS.xlsx` | `6588e17a6ed93c0406c8ffd1f8fa1c711dfd023b5ead970dad86f500f420add9` | **INTACT** |
| `3dept.xlsx` | `ffbceb34ed23535795d48b2186e84c6409d886df58eb43612dc91313857d07d9` | **INTACT** |
| `ai_assistant_model.joblib` | Binaries untouched | **INTACT** |

---

## 7. Unsupported Out-of-Scope Cases

The 3 remaining unsupported test cases are intentional safety refusals:
1. **Live GPS / Telemetry Query** $\rightarrow$ Scope Safeguard Notice (Refusal Verified)
2. **IRCTC Stock Price Query** $\rightarrow$ Scope Safeguard Notice (Refusal Verified)
3. **Crew Roster / Driver Personal Info** $\rightarrow$ Scope Safeguard Notice (Refusal Verified)

---

## 8. Conclusion

TRACKIQ AI now seamlessly understands and responds to **English, Tamil, Tanglish, and Mixed language queries** with zero data mutation, 100% intent consistency, and 100% regression suite accuracy.

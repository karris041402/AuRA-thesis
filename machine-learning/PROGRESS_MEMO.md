# AuRA Machine Learning Progress Memo

**Updated:** 2026-11-04
**Purpose:** Quick memory of current implementation, interim decisions, and open development questions. This memo supplements `docs/roadmap.md`; the roadmap remains the baseline for project status and planned work.

## Current phase status

| Stage | Status | Current boundary |
|---|---|---|
| 2.1 Text preprocessing | Implemented | Normalizes and tokenizes follow-up text while preserving the parent's original response. |
| 2.2 Lexicon matching | Implemented baseline | Uses the client's `behavioral_indicators_lexicon.json`; the current question selects the indicator. A match is lexical evidence only. |
| 2.3 Consistency and interpretation | Revised local-model prompt and approval flow implemented; evaluation pending | Backend sends the exact approved question, indicator, displayed follow-up, selected answer, permitted choices and parent response to Ollama/Llama 3.2 3B. The prompt includes follow-up intent and item-specific guidance for Q1-Q13. On clear contradiction, the model suggests an option; after parent approval, the backend saves that option and its server-calculated score without a second Ollama check, then advances. The user confirmed this works after restarting the backend. Human-reviewed evaluation remains open. |
| 2.4 Ordinal feature encoding | Implemented | Produces the shared ordered 13-value vector from accepted structured answers. Missing, duplicate, invalid, or incomplete answers cannot silently become zero. Legacy preview sessions do not receive a vector. |
| 3.1 Multi-model classification | Retrained on 3,137 records | The original 500, additional 2,400 and 237 new documented-entry consented records (`AURA-DATASET-3.xlsx`) are included. All labels remain score-derived. |
| 3.2 Soft voting | Re-evaluated; 97.03% held-out accuracy | Validation accuracy 98.09%; held-out test accuracy 97.03% on score-derived labels (previous 2,900-record run: 98.39% / 97.48%). Artifacts were regenerated locally on 2026-10-30; restart backend and verify a new live result. Migration `20261025_08` is applied in the tested environment. Restoring a saved result after navigation/refresh is verified. |
| Thesis Phase 4 | Implemented; wording review pending | Computes per-indicator changes to selected-category support by replacing one answer at a time with Sometimes while holding the others fixed. It maps the five largest shifts of at least one percentage point to the exact indicator and selected answer. Local Ollama explains only this structured evidence; a fixed category-based recommendation and localized fallback are saved with the result. |
| Thesis Phase 5 | Implemented; visual/runtime review pending | The result UI presents the selected category, support bars, influential indicators and answers, explanation, fixed category-based recommendation, model metadata and limitation. Download PDF and Print actions share an A4 result-only layout with a pale slanted AuRA logo watermark; Download PDF opens the browser print dialog and requires Save as PDF. Older saved results without these fields show clear notices. |
| Information-chat intent classifier | Implemented; trained on client-collected questions; first held-out evaluation done | Replaces keyword matching for information-chat replies. The local `bge-m3` encoder (Ollama) embeds a message and a Logistic Regression head trained on our own labelled questions picks one of 53 knowledge-base intents, three small-talk intents (greeting, thanks, goodbye with fixed replies) or `none` (out of scope). Replies remain the stored, reviewed answers; nothing is generated. Served by `POST /api/v1/chats/intent`; the frontend keeps the keyword matcher as a fallback. Trained on our starter rows (knowledge-base questions in English and Filipino, small-talk and off-topic examples) plus 1,475 client-collected questions: 25 per intent for the 53 intents (10 from round 1, 15 from round 2, written in English, Filipino and Taglish) and 150 out-of-scope questions labelled `none`. Per-intent 60/20/20 split (train 1,075, validation 295, test 295). Held-out test results: top-1 accuracy 81.36%, macro F1 0.8097, in-scope questions answered directly and correctly 67.17%, out-of-scope rejected 93.33%; answer threshold tuned on validation to 0.50, C = 100. Round 1 alone (530 questions, 106 test rows) gave 83.96% / 0.8105 with out-of-scope unmeasured. The keyword-matcher baseline on the same test set has not been run. Labels are the client's as collected and have not yet been reviewed. Direct answers work for phrasings close to the known questions; others show a "Did you mean" list (suggest cutoff 0.1) or the fixed fallback. The backend was restarted on 2026-11-04 to load the retrained artifact. |

## Decisions recorded

- Use the client's JSON as the working lexicon baseline. Do not describe it as clinically validated or as a validated cross-reference to screening instruments.
- Stage 2.2 lexicon matching remains available as a reference, but Stage 2.3 no longer uses it at runtime.
- Stage 2.3 now uses a loopback-only Ollama prototype (`llama3.2:3b`). It receives approved question/indicator, selected answer, permitted options and unmodified follow-up; returns `consistent`, `contradiction` or `unclear` with evidence. On clear contradiction it suggests another permitted answer. It cannot directly change or score the answer; after parent approval, the backend saves the suggested option and calculates its score, then advances without calling Ollama again. The user confirmed the approval flow works after restarting the backend. Model failure during the initial check saves nothing; there is no keyword fallback.
- The revised Stage 2.3 prompt interprets the exact displayed follow-up, with item-specific Q1-Q13 guidance, bilingual and Taglish support, concise example acceptance, and valid absence statements. It separates `unclear` from clear contradiction and consistency; it does not embed fixed parent-phrase mappings. The prompt is implemented but has not yet passed human-reviewed evaluation.
- Treat Stage 2.3 as an implemented prototype, not validated interpretation. Build a human-reviewed English/Filipino/Taglish test set; compare outcomes, suggestion accuracy, approval/edit rates, false acceptance/retry and latency before research use. Keep unclear results on the clarification path.
- For 2.4, use the 13 structured answers in questionnaire order:
  - Q1–Q9: `Always = 0`, `Sometimes = 1`, `Never = 2`.
  - Q10–Q13: `No = 0`, `Sometimes = 1`, `Yes = 2`.
- Follow-up rule: score 0 saves and advances without a follow-up or Stage 2.3 check; scores 1 and 2 require the follow-up consistency check. Scoring stays Q1-Q9 = 0/1/2 and Q10-Q13 = 2/1/0. Follow-up text is not a feature in the 13-value vector.
- Account-data policy agreed: retain linked data while the account is active; provide Settings > Delete Account with password re-entry as a second confirmation; erase all application data linked to the account. Database handling is developer-only. Settings account deletion is implemented with password confirmation, CSRF validation, session-cookie clearing and cascaded removal of linked application records. Verification: 30 backend auth tests passed, including wrong-password/CSRF rejection, successful deletion, cascade behavior and isolation of another account; frontend production build and ESLint passed on 2026-10-27. Backup erasure/retention rules remain open.
- Q1 example clarified: “Minsan lumilingon, minsan hindi” with selected `Minsan` should pass. Added `lumilingon` variants as Q1 Filipino cues in the working lexicon; this local extension still needs client review.
- The user approved feature attribution for the NLP-ML-NLP sandwich. Phase 4 compares each feature with its Sometimes score while holding other answers fixed; it reports the five largest support shifts of at least one percentage point and maps them to the approved indicator and selected answer. Ollama receives that structured evidence, category and language only; it cannot change the category and receives no parent follow-up text. Phase 5 displays the indicator evidence, explanation, recommendation and model support.
- The current live model returns the highest-support `Low`, `Moderate`, or `High` score-derived category. Displayed percentages are model support for those training labels, not probabilities of ASD.
- A live result has been observed in the UI, and restoring a saved result after navigation/refresh is verified. Do not record the individual assessment output in this memo.
- The completed-assessment panel and model-support bars were restyled against `documentation/Questionnaire Complete_ AI Assessment Summary.png`. Support is shown as horizontal category/percentage bars, not ASD probabilities. The New Assessment action remains outside the summary card.
- Added bilingual Download PDF and Print actions. Both open the browser print dialog and share the same A4 result-only layout; print rules hide app navigation, chat and browser headers. A pale, centered, slanted AuRA logo watermark overlays the report. Production build passed; print-preview layout still needs visual review.
- Chat bubbles now size to message length within their width limit and have 12px by 14px inner padding. Assistant response containers are offset below the avatar.
- Backend request-origin checks and credentialed CORS now accept HTTPS origins on generated `*.trycloudflare.com` tunnel hosts dynamically. Use HTTPS; the local backend `.env` has Secure cookies enabled. Restart backend after the origin-code change.
- Phase 4 explanations, indicator support shifts and category-based recommendations are persisted inside the existing processing-result JSON; no migration is required. If Ollama output is unavailable or invalid, the backend stores localized deterministic explanation text and preserves the model result.
- Information-chat intent classifier (added 2026-10-31): the panel expects a model we trained rather than a pretrained one, so the design is transfer learning, a pretrained multilingual encoder (`bge-m3`) plus our own trained classification head. State this accurately in the thesis; do not claim the encoder as our own. The risk-prediction models (Logistic Regression, Random Forest, XGBoost) are trained entirely on our data. `llama3.2:3b` is used only for the Stage 2.3 consistency check and the Phase 4 wording, never for the risk category or for chat answers.
- The classifier only selects a stored answer. It has no memory of earlier messages and cannot answer outside the 53 knowledge-base entries; those fall back to a fixed message or a "Did you mean" list. It is an intent classifier, not a conversational or context-analysis model.
- Training-data rules for the classifier: seed questions are real questions from people; AI may be used only to paraphrase training seeds, must be reviewed by a person and must be disclosed; validation and test questions must be real, human-written and never paraphrased; paraphrases stay in the same split as their seed.
- For the interim 3.1 baseline, use consented records from `RAW DATA` and the added category worksheets. Do not use the child's `Diagnosed`, `No Concern`, or `Not Evaluated` status as the model target.
- Use the workbook's `Ground Truth Labels` as **provisional score-derived categories**: Low 0–8, Moderate 9–11, High 12–26. These labels come from the same 13 scores used as features.
- The additional 2,400-record workbook is now included with the original 500 records. The user accepts current model output as interim development output; this is not clinical validation or final approval of the target-label method.
- The combined pool exceeds the working 500-record-per-category target (Low 1,093; Moderate 892; High 1,152). This target is not a statistically approved minimum. Any future records must be genuine, consented, and not duplicate people.
- Keep model artifacts and aggregate reports in ignored local folders. Do not copy parent IDs or free-text follow-ups into training outputs.

## Current 3.1 training pool and split

Sources: `machine-learning/dataset/AURA-DATASET.xlsx` (`RAW DATA`), `machine-learning/dataset/AURA-DATASET-2.xlsx` (`Low`, `Moderate`, `High`) and `machine-learning/dataset/AURA-DATASET-3.xlsx` (`RAW DATA`; ID column `File Number Code`, accepted by the loader alongside `Parent/Respondent Code`; 313 rows excluded across all workbooks; all 313 are in AURA-DATASET-3, have a blank consent cell and no responses, total 0 and no label (empty rows, so no answers were discarded)). The loader combines them in memory, includes rows with consent marked `Yes`, validates all 13 scores and their total, and checks each label against its sheet and the unchanged score cutoffs. The user confirmed that reused codes in the added workbook belong to different people; code checks are scoped to each source workbook and sheet.

Stage 3.1 and Stage 3.2 were rerun on 2026-10-30 using 3,137 consented records (previously 2,900 on 2026-10-27). Training scripts now print compact metric comparison tables and save aggregate PNG charts in the ignored reports folder; no row-level data is graphed or saved. The original 500 records used in preliminary cutoff computation remain included. The cutoffs were not recomputed.

| Category | Records | Train | Validation | Test |
|---|---:|---:|---:|---:|
| Low | 1,093 | 765 | 164 | 164 |
| Moderate | 892 | 624 | 134 | 134 |
| High | 1,152 | 806 | 173 | 173 |
| **Total** | **3,137** | **2,195** | **471** | **471** |

The split is fixed-seed stratified 70/15/15. The held-out test set was used once for final Stage 3.2 reporting; do not tune models from it.

## Stage 3.1 individual model validation

All models use the same Q1-Q13 score vector. These are validation metrics, not held-out test results:

| Model | Accuracy | Macro F1 |
|---|---:|---:|
| Logistic Regression | 99.79% | 0.9977 |
| Random Forest | 91.08% | 0.9062 |
| XGBoost | 91.08% | 0.9056 |

Overfitting check (train / validation / test accuracy): Logistic Regression 100% / 99.79% / 99.58%; Random Forest 100% / 91.08% / 90.23%; XGBoost 97.77% / 91.08% / 92.78%; ensemble 100% / 98.09% / 97.03%. Random Forest and XGBoost overfit (trees cannot add scores, so they memorize training patterns). Limiting depth or leaf size lowered their validation accuracy, so models were kept unchanged; the ensemble gap is about 2–3 points because Logistic Regression dominates the vote.

Logistic Regression's near-perfect score is consistent with learning the linear score-cutoff boundaries. The labels are computed from the same questionnaire scores supplied as features, so this result is rule reproduction, not independent ASD-risk prediction.

## Stage 3.2 equal-weight soft voting

`soft_voting.py` averages the three models' class probabilities equally, then selects the largest mean. It reports validation and held-out test metrics. The report stores aggregate metrics only at `machine-learning/reports/stage_3_2_soft_voting.json`.

Validation (`n = 471`): accuracy **98.09%**, macro F1 **0.9800**. Confusion matrix, actual rows / predicted columns, ordered Low / Moderate / High:

```text
             Low  Moderate  High
Low          161         3     0
Moderate       2       132     0
High           0         4   169
```

Held-out test (`n = 471`): accuracy **97.03%** (`457/471` correct), macro F1 **0.9690**. Confusion matrix, same order:

```text
             Low  Moderate  High
Low          160         4     0
Moderate       3       130     1
High           0         6   167
```

Compared with the previous 2,900-record run (test 97.48%, macro F1 0.9744), the extra data kept performance stable rather than improving it; the difference is within noise (about 2 more errors) and the test set differs. The small validation/test gap does not establish clinical generalization. These metrics measure reproduction of score-derived cutoffs, not ASD-risk accuracy, probability, or diagnosis. The backend needs a restart before checking live inference with the new local artifacts.
## Questions and work to revisit

### Stage 2.3 model evaluation

- Collect consented, de-identified response examples and have reviewers label consistency outcomes independently.
- Measure per-outcome precision/recall, false acceptance, false retry, invalid model output and inference latency on respondent-separated examples.
- Review the evidence-quote requirement, retry limit, unclear handling and blocked-item wording with the client.
- The UI now distinguishes clear contradictions, which show an answer suggestion with an approval button, from unclear responses, which ask the parent to clarify.
- After the parent approves a suggested answer, the saved structured answer updates to that option, shows an “Approved” / “Inaprubahan” mark, and advances. User confirmed this worked after restarting the backend.
- Confirm local Ollama/model setup on development machines. Do not claim clinical validity or production readiness from a successful API call.

### Information-chat intent classifier: work needed to improve it

Update 2026-11-04: see the status row above for the 1,475-question retrain and its held-out metrics. Known error cause, from a 5-fold cross-validation on round 1 (82.6% accuracy, 92 wrong of 530): overlapping intents, not only too little data. The "characteristics" group (kb-03, 09, 10, 11, 12, 13, 14) is confused internally; kb-02/kb-05, kb-20/kb-23 and kb-50/kb-36/kb-29 swap; some questions look mislabelled (for example "Bakit hindi pa nagsasalita ang anak ko?" is filed under kb-11 but fits kb-38). A review sheet of the 92 questions (`info_chat/data/label_review.xlsx`) was sent to the client; labels will be corrected from it and the model retrained. Earlier state (2026-10-31): 53 knowledge-base intents plus 3 small-talk intents and `none`; 190 training rows (knowledge-base questions in English and Filipino, small-talk and off-topic starter examples); no held-out data; default thresholds. Live checks: "kailan malalaman kung may ASD yung anak ko" returned the right answer directly; "pano ko malalaman kung may ASD ang anak ko" showed a "Did you mean" list with the right entry first; greetings, thanks and goodbye returned fixed replies; off-topic text fell back. Weak spots remain for casual phrasing (for example "ano po ba yung autism" suggested the screening entry, and "kumusta ang autism" was read as a greeting).

- Done: round 1 (10 per intent) and round 2 (`AURA-DATASET-4.xlsx`, 15 per intent) plus 150 out-of-scope (`out_of_scope_question.xlsx`) merged into `data/collected_questions.csv` (backup of round 1: `collected_questions.round1.bak.csv`).
- Next: get `label_review.xlsx` back from the client, apply the corrections, merge or sharpen overlapping intents, re-run cross-validation on all 1,475 questions to find the weakest intents, then retrain. Report the keyword-matcher baseline on the same test set. Use cross-validation alongside the test split, because each intent has only about 5 test questions.
- Originally: send the client `info_chat/data/question_collection_template.xlsx` (53 intents in column 1, ten blank question columns); on return, match rows by the English question on the first line of column 1 and convert to `data/collected_questions.csv`. Ask for ten different ways a person might ask each intent, in their own words, without copying the intent text.
- Replace the starter small-talk and off-topic examples with real ones from the collected data.
- Collect real questions through the client: at least 6 and ideally 10 per intent (about 320 to 530 in total), written freely in English, Filipino and Taglish, with consent and no names or personal details. Do not show respondents the existing questions or answers.
- Collect 100 to 150 out-of-scope questions (small talk, unrelated topics) labelled `none` so the model learns to refuse.
- Split the collected questions per intent into train, validation and test (about 6 / 2 / 2 of every 10). Keep the test questions untouched until the final report.
- Optionally expand the training seeds to 15 to 20 per intent with AI paraphrases, reviewed by a person and disclosed. Put them in `data/paraphrases.csv` with their `seed_text` so they never cross into held-out data.
- Retrain with `python -m info_chat.train`, which tunes the regularization strength and the answer threshold on validation, then report on test: top-1 accuracy, macro F1, share of in-scope questions answered correctly, share of out-of-scope questions rejected, and the same numbers for the old keyword matcher as a baseline.
- Resolve near-duplicate intents that the model cannot separate: "Can a chatbot diagnose ASD?" and "Can an online test or chatbot diagnose ASD?" should be merged; the negative and positive screening-result entries need many distinguishing examples.
- Add verified addresses for the two sources that still show as plain text ("Allison et al.", "Wetherby et al.") in `frontend/src/data/sourceLinks.ts`, and open the CDC and publisher links once by hand (they block automated checks).
- Make the "Did you mean" suggestions tappable buttons. This needs new chat action ids in the backend schema (`ChatActionValue`).
- Choose the reply language from the message or the user's language setting instead of the current keyword test.
- Decide whether low-confidence and fallback questions may be logged (with consent, without personal data) so the question set can grow after launch.
- Confirm with the adviser or panel that a pretrained encoder with our own trained head is acceptable. If it is not, the fallback is TF-IDF character n-grams with the same classifier, which needs the larger paraphrase dataset.
- Measure latency (one embedding call per message) and decide how the deployed backend gets `bge-m3` (`ollama pull bge-m3`).
- Add tests for the training script and a stored evaluation report with the artifact version; clinical review of the 53 answers themselves remains open.
- Optional later: remember the previous intent so short follow-ups ("what about girls?") can be resolved. This is not planned for the current version.

### Account data and access policy

- Retain account-linked application data while the account remains active.
- Withdrawal is initiated by the user through Settings > Delete Account. Require a second confirmation with password re-entry, then erase all application data linked to the account.
- Database handling is limited to the developer.
- [x] Implement Settings account deletion with password confirmation, CSRF validation and cascade removal of linked application records.
- [x] Verify deletion with 30 backend auth tests; frontend production build and ESLint passed (2026-10-27).
- [ ] Define backup deletion/retention and production database access controls before release.

### Data and labels

- The combined pool now has 1,093 Low, 892 Moderate, and 1,152 High records. Re-check counts and consent if further records are added; obtain adviser guidance before setting a final sample-size target.
- Ask a statistician or study adviser to justify the final sample size and split method. The 500-per-category target is only a working suggestion.
- Revisit whether score-derived categories are appropriate training targets. Since the target is calculated from the input vector, model training is a demonstration of formula reproduction, not independent learning of clinical outcomes.
- If the study needs an independent ML target, obtain an approved outcome-labeling protocol before changing targets or reporting clinical performance.

### Next pipeline steps

- If the dataset changes, repeat the full split/training/evaluation and preserve this 3,137-record report as a historical result (the 2,900-record result is summarized above).
- Keep the held-out test report final for this dataset; do not tune from it.
- Review the Phase 5 result card in a new assessment and History; confirm indicator attribution, generated explanation, category-based recommendations and localized fallback display correctly.
- Evaluate and refine the local context-aware Stage 2.3 model with reviewed parent-response examples; retain Stage 2.2 lexicon as a reference baseline.
- Review the Phase 4 explanation wording in English and Filipino before research use. Do not describe it as clinical interpretation.
- [x] Verify that History restores a completed model result after navigation/refresh. Restart the backend after retraining so it reloads new artifacts.
- Prioritize reviewed-example evaluation of the Stage 2.3 local model; keep Stage 2.2 keyword/phrase matching as a reference baseline.
- Do not present model support as the probability that a child has ASD. Keep the interim category clearly labeled as score-derived and provisional.

## Useful implementation files

- `machine-learning/preprocess.py` — Stage 2.1.
- `machine-learning/lexicon_match.py` and `machine-learning/behavioral_indicators_lexicon.json` — Stage 2.2.
- `backend/aura_api/consistency_model.py` and `backend/aura_api/assessments.py` — live Stage 2.3 model prototype; `machine-learning/CONSISTENCY_RULES_DRAFT.md` records legacy rules.
- `machine-learning/feature_encoding.py` and `backend/aura_api/assessments.py` — Stage 2.4 encoding and completed-assessment API output.
- `machine-learning/prepare_dataset.py`, `models.py`, `train.py`, and `evaluate.py` — Stage 3.1 training pipeline.
- `machine-learning/inference.py`, `machine-learning/soft_voting.py`, and `backend/aura_api/assessments.py` — live Stage 3.2 inference and persisted model output.
- `frontend/src/data/sourceLinks.ts` and `frontend/src/pages/ChatPage.tsx` — clickable source labels in information-chat answers.
- `machine-learning/info_chat/` (`train.py`, `classifier.py`, `intents.json`, `data/`, including the question collection template) and `backend/aura_api/chats.py` — information-chat intent classifier and its `/api/v1/chats/intent` endpoint.
- `docs/roadmap.md` — authoritative roadmap and baseline project status.

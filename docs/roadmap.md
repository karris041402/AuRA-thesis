# AuRA development roadmap

Last reviewed: 2026-11-20

This is the current completion roadmap. It distinguishes working frontend demonstrations from production functionality. The database blueprint remains in [AuRA_Database_Development_Plan.md](../documentation/AuRA_Database_Development_Plan.md); its schemas and technical recommendations are proposals, not completed infrastructure.

No deadlines or completion percentage are assigned. Each milestone closes only when its acceptance conditions are met.

## 1. Completed frontend foundation

Run application and test commands from `frontend/`; `docs/` and `documentation/` refer to repository-root shared folders.

- [x] Existing Vite, React, strict TypeScript, Tailwind, React Router and Lucide architecture retained.
- [x] Isolate the complete frontend in `frontend/`, including source, public assets, tests, dependencies, package/config files and build output; shared project/research documents remain at the root. See [frontend guide](../frontend/README.md).
- [x] Shared sidebar/header, desktop and mobile layouts, design tokens, rounded containers and subtle depth.
- [x] Supplied animated AuRA mascot and animated robot head, with reduced-motion/static fallback handling.
- [x] Email/password registration and sign-in connected to PostgreSQL-backed sessions.
- [x] Separate About, Consent, Parent/Child Information and All Set screens, with server-owned progress and validated frontend route access.
- [x] Parent/legal guardian, regular-interaction and 12-36-month eligibility validation.
- [x] Welcome/Start Chat, then information chat with thinking dots, typed greeting and integrated actions.
- [x] Deterministic educational replies using local reference content; no generated medical answers. Reply selection now uses a trained intent classifier (section 5a) with the keyword matcher as fallback; the reply engine moved from `services/mock/` to `services/api/chatReplyService.ts`.
- [x] Separate assessment workflow with explicit English or Tagalog selection before starting.
- [x] Compact Assessment header across language selection and questionnaire: 8px vertical padding, 76px desktop / 68px mobile, animated robot head and contextual English/Filipino subtitle; redundant Pre-assessment header button removed.
- [x] All 13 main questions and follow-ups from the supplied revised English PDF and Filipino DOCX.
- [x] Ask follow-ups only for score 1 or 2; save score 0 and advance directly without text or Ollama validation.
- [x] One scoring configuration: Q1-Q9 use 0/1/2 for Always/Sometimes/Never; Q10-Q13 use 2/1/0 for Yes/Sometimes/No.
- [x] Continuous assessment transcript, selected-answer bubbles, verbatim explanations and automatic question advancement.
- [x] Saved explanation recovery after failed advancement, duplicate-submission guards and progress tracking.
- [x] Live completion processing using the saved Logistic Regression, Random Forest and XGBoost artifacts with equal-weight soft voting.
- [x] Restyle completed-assessment summary to match the supplied reference: responsive completion panel, model-support bars and a separate New Assessment action.
- [x] Make chat response bubbles size to their content within the available width and add inner spacing for readability.
- [x] Remove fictional skip responses and timer-based processing preview; legacy preview sessions remain ineligible for inference.
- [x] History lists multiple information chats and assessments; opening an entry restores that session.
- [x] New Chat keeps earlier conversations; chat transcripts and assessment sessions remain server-owned in PostgreSQL.
- [x] Persist inference status and result by assessment ID; completed classifications restore from History.
- [x] Typed domain models, reusable hooks, local reply service and API-backed onboarding/assessment services.
- [x] Persist screening consent, eligibility, assessment answers and History in PostgreSQL; keep child names out of scope and avoid browser storage.

The first screenshot's label discrepancy is resolved by the revised questionnaire: Q1 is Response to Name; Q2 is Eye Contact. Original responses stay separate from any future NLP interpretation. Structured scores stay internal.

### Questionnaire sources

- [Revised English questionnaire](../documentation/REVISED-QUESTIONNAIRE-BASED-ON-PILOT-TESTING-2.pdf)
- [Filipino questionnaire translation](../documentation/SQ-Translation-in-Filipino.docx)
- [Implementation notes](implementation.md) and [frontend guide](../frontend/README.md)

### Existing validation evidence

Backend auth update: 42 tests passed against real PostgreSQL using disposable schemas; browser registration/login, HttpOnly cookies, CSRF, session rotation, refresh and logout also passed. Applied revision: `20261023_01`. On 2026-10-27, account-deletion/auth passed 30 tests, covering CSRF and wrong-password rejection, successful deletion, cookie clearing, cascaded linked-record deletion, and preservation of another account. Frontend production build and ESLint passed. These are focused checks, not a new full browser auth run.

The 2026-10-23 frontend completion work reran strict TypeScript/production build, ESLint and 12 domain/onboarding tests. The onboarding and assessment backend follow-up passes 48 backend PostgreSQL tests, 11 frontend domain tests, lint, build, and a browser flow that checks persistence through refresh and login. Browser checks cover the new frontend pages, onboarding, full English/Filipino questionnaire, processing and multiple History sessions, including narrow mobile viewports. Captures are in `design-review/` (historical captures are no longer retained in this checkout).

The latest Assessment header follow-up passed strict TypeScript/production build, ESLint, assessment introduction/animation checks and the complete Filipino assessment browser journey. Header dimensions were checked at 1917, 1024, 390 and 320px; desktop/mobile captures were visually reviewed. Other suite results above belong to the preceding frontend completion run.

The frontend folder relocation subsequently passed production build, strict TypeScript, ESLint, 12 unit tests and browser checks for onboarding, original chat/navigation, frontend utility pages, the complete Filipino assessment and History. Source/assets and package/config hashes were preserved; details are in [frontend guide](../frontend/README.md).

Physical mobile devices and real virtual keyboards remain unverified. See [frontend completion notes](frontend-completion.md) for the current commands and remaining review boundaries.

## 2. Frontend gaps: implementation delivered, approvals pending

Updated 2026-10-27. See [frontend completion notes](frontend-completion.md) for scope, verification and handoff details.

- [x] Build Resources with search, topic filters, CDC/WHO source cards, developmental milestone reference and an assessment/consultation guide.
- [x] Display source links, publishers, English language, added dates and an honest pending-review status. Keep resource content separate from behavioral NLP rules.
- [ ] Verify current external source content and obtain stakeholder/clinical review plus approved Filipino resource summaries. Added dates are not clinical review dates.
- [x] Replace Support placeholder with keyboard-accessible FAQs, chat/resource navigation and an explicit unavailable contact service.
- [x] Replace Settings placeholder with session details, History access, language guidance, device motion status, privacy notices, working sign out and account deletion with password confirmation.
- [x] Update login privacy/terms copy and provide reusable under-development policy dialogs without implying accepted or approved terms.
- [x] Review consent transitions and remove the redundant Decline / Exit button. Unchecked consent and direct-URL guards still block setup bypass.
- [x] Correct stale About copy that claimed only one question; review bilingual UI labels without changing the supplied question/follow-up wording.
- [x] Check keyboard focus, native dialog focus restoration, FAQ controls, reduced motion and long-input layout. Added text uses accessible dark blue/gray on pale surfaces.
- [x] Verify desktop login fit, scrollable mobile login/onboarding and usable composer in a shortened browser viewport.
- [ ] Test physical mobile devices and a real virtual keyboard. Browser viewport approximation is not equivalent.
- [x] Run strict TypeScript/production build, lint, 12 unit tests, new frontend page browser checks, onboarding, full English/Filipino assessments and History regressions. Visually review desktop/mobile captures.
- [ ] Obtain approved Privacy Policy/Terms wording and real support contact details. User confirmed these are not available yet; the UI identifies them as under development.

Acceptance: implemented destinations work within the frontend; account deletion uses the backend and removes linked application records. Policy/contact approval, clinical resource review/Filipino resources and physical-device verification remain open. No contact delivery or production policies are claimed.

### Current handoff

The frontend implementation milestone is delivered. Remaining frontend work is external source verification, clinical/Filipino resource review, approved policy/contact content and physical-device keyboard testing. These remain unchecked above.

The backend auth, onboarding and assessment-storage slices are implemented in `backend/`: FastAPI, PostgreSQL-backed sessions, versioned consent, eligibility, bilingual questionnaire snapshots, answer progression and owner-scoped History. Migration `20261024_03` is applied to local `aura_db`. The frontend calls these APIs through Vite. HTTPS origins under `*.trycloudflare.com` are now accepted dynamically by the request-origin guard and credentialed CORS; the backend cookie must be Secure and the current tunnel must be opened with HTTPS. Stage 3.1 and 3.2 artifacts were regenerated locally from 3,137 consented records on 2026-11-20; the metrics matched the 2026-10-30 run. Restart backend and check a new live result before claiming the backend loaded those artifacts. Training scripts now print metric comparison tables and save PNG dashboards to ignored `machine-learning/reports/`. Stage 2.3 model evaluation and clinical validation remain pending.

## 3. Backend API and real identity

Authentication method selected by the user: email + password with server-side HttpOnly cookie sessions. See [backend setup](../backend/README.md) and [auth contracts](../backend/docs/auth-api.md).

- [x] Set up FastAPI in a separate backend folder.
- [x] Define strict credential/public-session schemas and auth REST contracts.
- [x] Implement register/login, salted scrypt hashes, normalized unique email and public error redaction.
- [x] Implement PostgreSQL-backed session restoration, idle/absolute expiry, token rotation and server-side logout revocation.
- [x] Add configured-origin/CSRF checks, credentialed CORS, request throttling, JSON/body limits and no-store responses; allow generated HTTPS `*.trycloudflare.com` origins dynamically.
- [x] Verify self-session account isolation, concurrent registration, restart persistence, secure-cookie flags and database failure handling.
- [x] Pass 48 PostgreSQL/configuration/migration/assessment tests and browser auth/onboarding/assessment persistence checks.
- [x] Connect frontend registration/login forms, session restoration and sign out to the real auth API.
- [ ] Implement email verification/reset through an agreed email provider.
- [x] Implement server-owned onboarding status, consent version/scope, eligibility and completion checks before screening access.
- [x] Implement questionnaire, answer/follow-up, assessment resume/completion, deletion and History contracts/endpoints.
- [x] Connect assessment processing to saved-model inference, persist classifications, and expose failed-inference retry.

Acceptance: auth, onboarding, owner-scoped assessment APIs and model-result persistence are implemented. Migration 20261025_08 is applied and the user has observed a live model result. A login alone does not establish valid screening consent or eligibility.

## 4. PostgreSQL and durable sessions

Implemented authentication, onboarding and assessment persistence; the rest of the database blueprint remains proposed.

- [x] Connect the separate local `aura_db` PostgreSQL database without modifying other project databases.
- [x] Add Alembic revision `20261023_01` for `users` and `auth_sessions`, including normalized-email uniqueness, session ownership/cascade and indexes.
- [x] Persist password hashes and session-token digests with expiry/revocation, surviving backend restarts.
- [x] Keep credentials in ignored backend/.env and use the same validated settings for API/migrations. No in-memory fallback.
- [x] Validate migration/model consistency, upgrade and rollback using disposable test schemas. No application downgrade was run.
- [ ] Add a limited application database role and reviewed deployment/backup/restore setup before production; the current local connection uses the existing development postgres role.
- [x] Add versioned English/Filipino questionnaire snapshots and server-owned item scoring for the approved questionnaire.
- [x] Persist minimal guardian eligibility, versioned consent and onboarding progress.
- [x] Persist original structured/textual answers, question/version/language snapshots and assessment progress.
- [x] Persist account-owned information chats with ordered messages, replay-safe turns, History restore and deletion.
- [x] Define retention: keep account-linked data while the account remains active.
- [x] Define withdrawal: Settings will provide Delete Account with a second confirmation using password re-entry; deletion will erase all application data linked to that account.
- [x] Define operational access: database handling is limited to the developer.
- [x] Implement Settings account deletion with password confirmation, CSRF validation, session-cookie clearing and PostgreSQL cascade deletion of all linked application records.
- [x] Verify account deletion with 30 backend auth tests; frontend production build and ESLint passed (2026-10-27).
- [ ] Define backup deletion/retention and operational access controls before production.

Acceptance: users, cookie sessions, onboarding, chat transcripts, assessment History and model results are durable. The frontend restores processing results from PostgreSQL. Inference is synchronous in the API process; no background worker is configured.

## 5. NLP processing and feature mapping

Dependencies: approved questionnaire scoring and shared training/inference feature order. Stage 2.3 model evaluation still needs human-reviewed labels and client review.

- [x] Implement baseline text preprocessing while retaining the parent's original follow-up response (Stage 2.1).
- [x] Implement question-specific matching against the client's behavioral lexicon as a working baseline (Stage 2.2); coverage and clinical validity remain unapproved.
- [x] Connect Stage 2.3 to a loopback Ollama model. It receives question/indicator, selected answer, permitted choices and follow-up; returns `consistent`, `contradiction` or `unclear`.
- [x] For clear contradictions, suggest a permitted answer option. After parent approval, save that option with its server-calculated score and advance without a second Ollama check; the user confirmed this flow works after restarting the backend. Unclear responses still require clarification.
- [x] Encode the accepted Q1-Q13 structured choices into one ordered 13-value vector using the approved scoring rules (Stage 2.4).
- [x] Use that same vector schema for training and live model inference. Follow-up text is stored and checked by Stage 2.3, but is not a classifier feature. A parent-approved suggestion replaces the earlier frequency answer; the backend saves the suggested option and calculates its score.
- [x] Require structured model output and exact response evidence for decisive outcomes. Model/network failures save no answer, consume no retry and do not fall back to keyword matching.
- [ ] Evaluate the Llama 3.2 3B prototype using human-reviewed, consented English/Filipino/Taglish examples and respondent-separated holdout; report per-outcome precision/recall, false acceptance, false retry and latency.
- [ ] Review suggested-answer approval, unclear handling, retry behavior and evidence quotes with the client. Confirm Ollama availability on development machines.
- [ ] Keep the Stage 2.2 lexicon as a documented reference baseline. Do not describe the model prototype as clinically validated.
- [x] Revise the Stage 2.3 candidate prompt with follow-up-intent rules and item-specific semantic guidance for all 13 questions, including concise examples and clear absence responses.

Acceptance: preprocessing, lexicon reference matching, model-based consistency prototype and ordinal encoding work. Model quality and clinical validity remain unestablished until reviewed-example evaluation and client review are complete.

## 5a. Information-chat intent classifier

Dependencies: the 53-entry knowledge base, a local Ollama install with `bge-m3`, and real collected questions for evaluation.

- [x] Replace keyword matching with a model that tolerates paraphrase, typos and Taglish. A local multilingual encoder (`bge-m3`) embeds the message; a Logistic Regression head trained on our own labelled questions chooses one of 53 knowledge-base intents, three small-talk intents (greeting, thanks, goodbye) or `none`. Replies stay the stored, reviewed answers.
- [x] Add `machine-learning/info_chat/` (training, classifier, intents, data templates), artifact `artifacts/info_chat_intent.joblib`, and `POST /api/v1/chats/intent` (authenticated, with a backend test). The frontend falls back to the keyword matcher if the endpoint or Ollama is unavailable.
- [x] Add fixed bilingual replies for greeting, thanks and goodbye, and a starter off-topic set so unrelated text falls back instead of matching a greeting. Retrained on 190 starter rows over 57 classes; suggest cutoff lowered to 0.1 so near-miss phrasings show a "Did you mean" list. Starter examples are ours, not collected data.
- [x] Make source labels in information-chat answers clickable (`frontend/src/data/sourceLinks.ts`); unverified sources stay plain text.
- [x] Prepare `info_chat/data/question_collection_template.xlsx` (53 intents × 10 blank question columns) for the client.
- [x] Answer when confidence is high, show a "Did you mean" list when it is medium, and show the fixed fallback message when it is low or the message is out of scope.
- [x] Collect real questions from the client with the Excel template: 25 per intent (two rounds) and 150 out-of-scope, 1,475 in total in `data/collected_questions.csv`. Consent and de-identification of the sources still to be confirmed with the client.
- [x] Retrain on the collected questions (60/20/20 per intent), tune C and the answer threshold on validation, and report held-out test results: accuracy 81.36%, macro F1 0.8097, in-scope answered correctly 67.17%, out-of-scope rejected 93.33% (threshold 0.50). Backend restarted with the new artifact on 2026-11-04.
- [ ] Run the old keyword matcher on the same test questions as a baseline, and report 5-fold cross-validation next to the test split.
- [ ] Review labels: the client checks `info_chat/data/label_review.xlsx` (92 questions the model got wrong in round 1); apply corrections and retrain.
- [ ] Merge or sharpen overlapping intents: the "characteristics" group (kb-03, 09, 10, 11, 12, 13, 14), kb-02/kb-05, kb-20/kb-23, kb-50/kb-36/kb-29, the two "chatbot diagnose" entries, and the positive and negative screening-result entries.
- [ ] Optional AI paraphrase of training seeds only, reviewed by a person and disclosed. Validation and test questions must be real and human-written.
- [ ] Confirm with the adviser or panel that a pretrained encoder with our own trained head is acceptable; otherwise switch to TF-IDF character n-grams with a larger paraphrase dataset.
- [ ] Make suggestions tappable (new chat action ids in the backend schema), pick the reply language from the message or setting, and decide on consented logging of low-confidence questions.
- [ ] Add verified links for "Allison et al." and "Wetherby et al.", and open the CDC/publisher links by hand to confirm them.
- [ ] Document deployment (`ollama pull bge-m3` on the backend host), measure latency, and add training-script tests and a stored evaluation report.

Acceptance: the endpoint and fallback work now. Held-out metrics are recorded (81.36% accuracy, 93.33% out-of-scope rejected); the model is not considered final until labels are reviewed, overlapping intents are resolved and the keyword baseline is reported. It selects among stored answers only, has no conversation memory, and makes no medical claims.

## 6. Dataset, training and model evaluation

Dependencies: approved labeling protocol, appropriately consented research data and stable feature definitions. Dataset preparation can proceed alongside NLP rule work once these decisions are settled.

- [ ] Document dataset provenance, permitted use, expert-reviewed labels and class definitions.
- [x] Combine the original 500-record workbook and additional 2,400-record workbook in the loader; validate consent, score totals, labels, category sheets and cutoffs. The user confirmed repeated codes in the new workbook refer to different people; duplicate-code checks are scoped to workbook and sheet.
- [x] Verify duplicate respondent codes do not represent repeated people in the current data, based on the user's confirmation. Future sources still need stable identifiers or documented deduplication.
- [x] Train Logistic Regression, Random Forest and XGBoost on 3,137 consented records using the 13-score schema and fixed stratified 70/15/15 split. Print a comparison table and save validation metric/confusion-matrix charts in ignored `reports/`.
- [x] Compare individual models on validation; equal-weight soft voting reached 98.09% validation accuracy and 97.03% held-out test accuracy (Macro F1 0.9690); previous 2,900-record run was 98.39% / 97.48% (0.9744), so added data kept performance stable. Random Forest and XGBoost overfit (train 100% / 97.8% vs validation 91.1%); depth limits lowered validation accuracy, so models were left unchanged.
- [ ] Review generalization, bilingual input behavior and screening limitations; document thresholds and failure conditions where applicable.
- [ ] Version model artifacts, preprocessing, feature schema, training configuration and evaluation evidence.

Acceptance: the provisional 3.1/3.2 pipeline runs reproducibly and reports held-out metrics. The 3,137-record pool meets the working 500-per-category target, but that target is not statistician-approved. Labels are derived from input scores; metrics show reproduction of the cutoff rule, not ASD-risk validity. Independent labels, clinical review and intended-use approval remain open.

## 7. Live model inference and thesis Phases 4-5

History restoration after navigation/refresh is verified. The user approved Phase 4 post-ML explanation and indicator support analysis. The backend compares each recorded answer with a Sometimes reference while holding others fixed, then maps the largest support changes to exact indicator labels and selected answers. Ollama receives only this structured evidence, category and language; it cannot change the category or access follow-up text. Phase 5 now presents the saved explanation with the existing result summary.

- [x] Replace timer-only processing with synchronous saved-model inference, failure reporting and retry handling.
- [x] Connect saved Logistic Regression, Random Forest and XGBoost models to the completed 13-score vector; compute equal-weight soft voting.
- [x] Select the highest-support Low/Moderate/High category and persist the category, model version, class-support probabilities and generated time in the processing result.
- [x] Show the provisional score category in the assessment conversation; legacy fictional preview sessions are blocked from inference.
- [x] Verify that the saved result restores from History after navigation or refresh.
- [x] Apply migration `20261025_08`; the user confirmed a live model result appeared in the assessment UI.
- [x] Implement Phase 4 post-ML NLP. Compute one-at-a-time model-support changes against a Sometimes reference for all 13 indicators, select the five largest changes of at least one percentage point, and map them to the selected answer and approved indicator label. Ollama explains only that structured evidence; it cannot alter the category or read parent follow-up text. Save localized fallback text if generation fails.
- [x] Use the existing category, support percentages, limitation notice and saved Phase 4 explanation as the Phase 5 result summary.
- [x] Display the category, support bars, influential indicator answers, Phase 4 explanation, category-based recommendation and score-derived/non-diagnostic limitation in the Phase 5 result UI.
- [x] Add localized Download PDF and Print actions using the same A4 result-only layout, with app navigation/chat and browser print headers hidden. Include a pale, slanted AuRA logo watermark. Download PDF opens the browser print dialog; choose Save as PDF there.
- [x] Persist support changes, indicator labels, selected answers, explanation and category-based recommendation beside the model result in the existing processing-result JSON; no migration is needed.
- [ ] Review Ollama-generated explanations in English and Filipino for factual consistency and wording before research use.

Current sequence: Stages 2.1-2.3 pre-ML NLP -> Stages 3.1-3.2 ML -> Phase 4 post-ML NLP -> Phase 5 result summary. Phase 4 reports one-at-a-time indicator support changes and a constrained explanation; Phase 5 presents them with a fixed category-based recommendation. The current result is a score-derived category, not an ASD probability or diagnosis; training labels come from the same 13 scores supplied to the models.

Acceptance: Stage 3.2 produces a provisional score category. Phase 4 stores per-indicator support changes, constrained explanation and fixed category-based recommendation; Phase 5 displays them while preserving score-derived and non-diagnostic boundaries. No clinical risk validity is claimed.

## 8. Release and study readiness

- [ ] Complete end-to-end checks across authentication, consent, both languages, interrupted sessions, processing, results and History.
- [ ] Review privacy/security, ownership isolation, retention/deletion and operational access.
- [ ] Complete accessibility, responsive/device and failure/recovery checks.
- [ ] Configure deployment environments, protected secrets, HTTPS, monitoring and database recovery.
- [ ] Complete stakeholder/clinical content review and study evaluation required by the research protocol.
- [ ] Update setup instructions, API/schema documentation, model limitations and deployment procedures.

Acceptance: agreed release checks pass; reviewed research and privacy requirements are satisfied; documented limitations match actual system behavior.

## Decisions still needed

0. Collect and label real questions for the information-chat classifier, and confirm that a pretrained encoder with our own trained head meets the panel's "own model" expectation.
1. Review Phase 4 explanation wording and output quality with English and Filipino examples.
2. Review the Phase 5 result summary in a new assessment and History, including the generated explanation and fallback notice for older results.
3. Stage 2.3 prototype evaluation using human-reviewed bilingual examples, plus client review of unclear handling and retries.
4. Final questionnaire/version sign-off, question-to-indicator mapping, and Filipino wording review.
5. Dataset expansion, provenance, target-label rationale, class balance, and evaluation criteria.
6. Review Medical Library sources and result-summary wording and visualization.
7. Define backup deletion/retention and production database access safeguards and deployment environment.

Current boundary: the React UI uses real authentication, onboarding, chat and assessment APIs. PostgreSQL stores chats, versioned questions, original responses, scores, progress and model output after migration 20261025_08 is applied. Phase 4 stores structured support changes, indicator answers, Ollama explanation and category-based recommendation with the result; Phase 5 displays them with the category and support values. Chat, assessment and account deletion are self-service. Account-linked application data is retained while the account is active; Settings deletion requires password confirmation and removes the account plus linked application records through PostgreSQL cascades. Database handling is developer-only. Backup erasure/retention and production access controls remain undefined. Privacy wording is a development draft. Independent target labels and clinical risk validation remain open.

## Backend onboarding integration (2026-10-23)

- [x] Connect About acknowledgement, versioned demonstration consent, guardian eligibility and completion to authenticated PostgreSQL records.
- [x] Enforce onboarding order and 12-36 month eligibility on the server; restore the required step after login or refresh.
- [x] Persist authenticated chat transcripts and assessment History in PostgreSQL; support owner-scoped History restore and deletion.
- [x] Persist assessment sessions and answer History; [x] implement agreed account deletion; [ ] complete backup retention/access review.

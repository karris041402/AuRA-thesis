import { assessmentCopy } from "../../data/assessmentCopy";
import type { AssessmentLanguage } from "../../types/questionnaire.types";
import { useState } from "react";
import { Download, Info, Printer, ShieldCheck } from "lucide-react";
import type { AssessmentResult as AssessmentResultData } from "../../types/assessment.types";
import { downloadResultPdf } from "../../utils/resultPdf";

export function AssessmentResult({
  language = "en",
  result,
  legacyPreview = false,
}: {
  language?: AssessmentLanguage;
  result: AssessmentResultData | null;
  legacyPreview?: boolean;
}) {
  const copy = assessmentCopy[language];
  const [downloading, setDownloading] = useState(false);
  const [downloadFailed, setDownloadFailed] = useState(false);
  async function downloadPdf() {
    if (!result || downloading) return;
    setDownloading(true);
    setDownloadFailed(false);
    try {
      await downloadResultPdf(result, copy);
    } catch {
      setDownloadFailed(true);
    } finally {
      setDownloading(false);
    }
  }

  function printResult() {
    if (!result) return;
    window.print();
  }

  if (!result) {
    return (
      <div className="result-placeholder">
        <ShieldCheck aria-hidden="true" />
        <p>{legacyPreview ? copy.legacyPreview : copy.processingFailed}</p>
      </div>
    );
  }

  return (
    <div className="result-placeholder result-card">
      <div className="result-watermark" aria-hidden="true">
        <img src="/assets/branding/aura-avatar.png" alt="" />
        <span>AuRA</span>
      </div>
      <div className="result-fit">
      <div className="result-heading">
        <span className="result-icon">
          <ShieldCheck aria-hidden="true" />
        </span>
        <div>
          <h3>{copy.resultHeading}</h3>
          <p className="result-subheading">{copy.resultSubtitle}</p>
        </div>
        <div className="result-actions">
          <button
            type="button"
            className="result-download-button"
            onClick={() => void downloadPdf()}
            disabled={downloading}
          >
            <Download aria-hidden="true" />
            {copy.resultDownloadPdf}
          </button>
          <button
            type="button"
            className="result-print-button"
            onClick={printResult}
          >
            <Printer aria-hidden="true" />
            {copy.resultPrint}
          </button>
        </div>
      </div>
      {downloadFailed && <p role="alert" className="result-download-error">{copy.resultDownloadFailed}</p>}
      <section
        className={`result-feature result-feature--${result.category.toLowerCase()}`}
        aria-label={copy.resultHeading}
      >
        <span className="result-feature-label">
          {copy.resultSelectedCategory}
        </span>
        <div className="result-feature-value">
          <strong className="result-category">{result.category}</strong>
          {result.totalScore != null && result.maxScore != null && (
            <span className="result-score">
              {copy.resultTotalScore}: <strong>{result.totalScore}/{result.maxScore}</strong>
            </span>
          )}
        </div>
      </section>
      <section className="result-probabilities" aria-label={copy.resultSupport}>
        <div className="result-section-heading">
          <h4>{copy.resultSupport}</h4>
          <span>
            <Info aria-hidden="true" />
            {copy.resultSupportCaption}
          </span>
        </div>
        {(["Low", "Moderate", "High"] as const).map((category) => {
          const support = Math.max(
            0,
            Math.min(100, result.probabilities[category] * 100),
          );
          return (
            <div
              className={`result-probability result-probability--${category.toLowerCase()}`}
              key={category}
            >
              <span className="result-probability-category">{category}</span>
              <strong className="result-probability-value">
                {support.toFixed(1)}%
              </strong>
              <div
                className="result-bar"
                role="progressbar"
                aria-label={`${category} ${copy.resultSupport.toLowerCase()}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Number(support.toFixed(1))}
              >
                <span style={{ width: `${support}%` }} />
              </div>
            </div>
          );
        })}
        <p className="result-breakdown-note">
          {copy.resultBreakdownExplanation}
        </p>
      </section>
      <section
        className="result-explanation"
        aria-label={copy.resultExplanationHeading}
      >
        <h4>{copy.resultExplanationHeading}</h4>
        <p>{result.explanation || copy.resultExplanationMissing}</p>
      </section>
      <section
        className="result-recommendation"
        aria-label={copy.resultRecommendationHeading}
      >
        <h4>{copy.resultRecommendationHeading}</h4>
        <p>
          {result.recommendation ||
            (result.category === "Low"
              ? copy.resultRecommendationLow
              : copy.resultRecommendationOther)}
        </p>
      </section>
      <section
        className="result-indicator-influences"
        aria-label={copy.resultInfluenceHeading}
      >
        <h4>{copy.resultInfluenceHeading}</h4>
        {result.indicatorResponses?.length ? (
          <ul>
            {result.indicatorResponses.map((item) => (
              <li key={item.indicatorId}>
                <div>
                  <strong>{item.indicatorLabel}</strong>
                  <span>{item.selectedAnswer}</span>
                </div>
                <p className="result-indicator-followup">
                  <em>{copy.resultParentResponse}:</em>{" "}
                  {item.followUpAnswer.trim() || copy.resultNoFollowUp}
                </p>
              </li>
            ))}
          </ul>
        ) : result.influenceMethod === "sometimes-one-at-a-time" ? (
          <>
            {result.influentialIndicators?.length ? (
              <ul>
                {result.influentialIndicators.map((item) => (
                  <li key={item.indicatorId}>
                    <div>
                      <strong>{item.indicatorLabel}</strong>
                    </div>
                    <p>{item.selectedAnswer}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{copy.resultInfluenceEmpty}</p>
            )}
          </>
        ) : (
          <p>{copy.resultInfluenceMissing}</p>
        )}
      </section>
      </div>
    </div>
  );
}

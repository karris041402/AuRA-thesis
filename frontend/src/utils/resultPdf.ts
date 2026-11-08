import type { assessmentCopy } from '../data/assessmentCopy'
import type { AssessmentResult } from '../types/assessment.types'

type Copy = (typeof assessmentCopy)["en" | "fil"]
type RGB = [number, number, number]

const NAVY: RGB = [24, 59, 100]
const BLUE: RGB = [21, 93, 169]
const GREY: RGB = [82, 101, 125]
const BORDER: RGB = [214, 227, 243]
const PANEL: RGB = [237, 245, 255]
const BARS: Record<'Low' | 'Moderate' | 'High', RGB> = {
  Low: [80, 145, 220],
  Moderate: [226, 178, 76],
  High: [222, 110, 108],
}

const PAGE = { width: 210, height: 297, margin: 16, bottom: 20 }
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2

async function loadLogo(): Promise<string | null> {
  try {
    const response = await fetch('/assets/branding/aura-avatar.png')
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/** Builds the result summary as a real A4 PDF and saves it directly, with no print dialog. */
export async function downloadResultPdf(
  result: AssessmentResult,
  copy: Copy,
): Promise<void> {
  const [{ jsPDF, GState }, logo] = await Promise.all([import('jspdf'), loadLogo()])
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = PAGE.margin

  const ensure = (height: number) => {
    if (y + height <= PAGE.height - PAGE.bottom) return
    doc.addPage()
    y = PAGE.margin
  }
  const wrap = (text: string, width: number, size: number) => {
    doc.setFontSize(size)
    return doc.splitTextToSize(text, width) as string[]
  }
  const lineHeight = (size: number) => size * 0.4 * 1.35

  function paragraph(text: string, x: number, width: number, size: number, color: RGB) {
    doc.setFont('helvetica', 'normal').setFontSize(size).setTextColor(...color)
    const lines = wrap(text, width, size)
    for (const line of lines) {
      ensure(lineHeight(size))
      doc.text(line, x, y + size * 0.3)
      y += lineHeight(size)
    }
  }

  function heading(text: string) {
    ensure(12)
    doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...NAVY)
    doc.text(text, PAGE.margin, y + 4)
    y += 8
  }

  function panel(title: string, body: string) {
    const lines = wrap(body, CONTENT_WIDTH - 10, 10)
    const height = 12 + lines.length * lineHeight(10)
    ensure(height)
    doc.setFillColor(...PANEL).setDrawColor(...BORDER).roundedRect(PAGE.margin, y, CONTENT_WIDTH, height, 2.5, 2.5, 'FD')
    doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...NAVY)
    doc.text(title, PAGE.margin + 5, y + 7)
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...GREY)
    lines.forEach((line, index) => doc.text(line, PAGE.margin + 5, y + 12.5 + index * lineHeight(10)))
    y += height + 4
  }

  // Header
  if (logo) doc.addImage(logo, 'PNG', PAGE.margin, y - 1, 14, 14)
  const titleX = logo ? PAGE.margin + 18 : PAGE.margin
  doc.setFont('helvetica', 'bold').setFontSize(17).setTextColor(...NAVY)
  doc.text(copy.resultHeading, titleX, y + 6)
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...GREY)
  doc.text(copy.resultSubtitle, titleX, y + 11.5)
  y += 17
  doc.setDrawColor(...BORDER).setLineWidth(0.4).line(PAGE.margin, y, PAGE.width - PAGE.margin, y)
  y += 6

  // Category
  doc.setFillColor(...PANEL).setDrawColor(...BORDER).roundedRect(PAGE.margin, y, CONTENT_WIDTH, 14, 2.5, 2.5, 'FD')
  doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...GREY)
  doc.text(copy.resultSelectedCategory, PAGE.margin + 5, y + 8.6)
  doc.setFontSize(18).setTextColor(...BLUE)
  doc.text(result.category, PAGE.width - PAGE.margin - 5, y + 9.4, { align: 'right' })
  y += 20
  if (result.totalScore != null && result.maxScore != null) {
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...GREY)
    doc.text(`${copy.resultTotalScore}: ${result.totalScore}/${result.maxScore}`, PAGE.width - PAGE.margin, y - 3, { align: 'right' })
    y += 4
  }

  // Breakdown
  heading(copy.resultSupport)
  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...GREY)
  doc.text(copy.resultSupportCaption, PAGE.margin, y)
  y += 5
  for (const category of ['Low', 'Moderate', 'High'] as const) {
    const support = Math.max(0, Math.min(100, result.probabilities[category] * 100))
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...GREY)
    doc.text(category, PAGE.margin, y + 3.4)
    doc.setFont('helvetica', 'bold').setTextColor(...NAVY)
    doc.text(`${support.toFixed(1)}%`, PAGE.margin + 30, y + 3.4)
    const barX = PAGE.margin + 50
    const barWidth = PAGE.width - PAGE.margin - barX
    doc.setFillColor(230, 236, 246).roundedRect(barX, y, barWidth, 4.4, 2.2, 2.2, 'F')
    if (support > 0) doc.setFillColor(...BARS[category]).roundedRect(barX, y, Math.max(4.4, (barWidth * support) / 100), 4.4, 2.2, 2.2, 'F')
    y += 8
  }
  y += 1
  paragraph(copy.resultBreakdownExplanation, PAGE.margin, CONTENT_WIDTH, 9, GREY)
  y += 5

  // Explanation and recommendation
  panel(copy.resultExplanationHeading, result.explanation || copy.resultExplanationMissing)
  panel(
    copy.resultRecommendationHeading,
    result.recommendation || (result.category === 'Low' ? copy.resultRecommendationLow : copy.resultRecommendationOther),
  )
  y += 2

  // Behavioral indicators with the parent's follow-up answers
  const indicators = result.indicatorResponses ?? []
  if (indicators.length) {
    heading(copy.resultInfluenceHeading)
    for (const item of indicators) {
      const answer = item.followUpAnswer.trim() || copy.resultNoFollowUp
      const lines = wrap(`${copy.resultParentResponse}: ${answer}`, CONTENT_WIDTH - 10, 9)
      const height = 10 + lines.length * lineHeight(9)
      ensure(height + 2)
      doc.setFillColor(255, 255, 255).setDrawColor(...BORDER).roundedRect(PAGE.margin, y, CONTENT_WIDTH, height, 2, 2, 'FD')
      doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...NAVY)
      doc.text(item.indicatorLabel, PAGE.margin + 5, y + 6)
      doc.setFontSize(9).setTextColor(...GREY)
      doc.text(item.selectedAnswer, PAGE.width - PAGE.margin - 5, y + 6, { align: 'right' })
      doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...GREY)
      lines.forEach((line, index) => doc.text(line, PAGE.margin + 5, y + 10.6 + index * lineHeight(9)))
      y += height + 2.5
    }
    y += 3
  }

  // Watermark and page numbers on every page
  const pages = doc.getNumberOfPages()
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page)
    doc.saveGraphicsState()
    doc.setGState(new GState({ opacity: 0.07 }))
    doc.setFont('helvetica', 'bold').setFontSize(96).setTextColor(...BLUE)
    doc.text('AuRA', PAGE.width / 2, PAGE.height / 2 + 20, { align: 'center', angle: 35 })
    doc.restoreGraphicsState()
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...GREY)
    doc.text(`AuRA  |  ${page} / ${pages}`, PAGE.width / 2, PAGE.height - 10, { align: 'center' })
  }

  const date = new Date(result.generatedAt).toISOString().slice(0, 10)
  doc.save(`AuRA-assessment-summary-${date}.pdf`)
}

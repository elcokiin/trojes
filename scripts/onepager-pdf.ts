import { chromium } from "playwright"
import { stat } from "node:fs/promises"
import path from "node:path"

// ─── Constants ──────────────────────────────────────────

const ROOT = path.resolve(import.meta.dir, "..")
const HTML_FILE = path.join(ROOT, "onepager-print.html")
const HTML_URL = `file://${HTML_FILE}`

const PX_PER_MM = 96 / 25.4
const PAGE_W_MM = 210 // A4
const PAGE_H_MM = 297
const MARGIN_MM = 0 // @page margin in onepager-print.html (0 = full-bleed background)
const PRINTABLE_H = (PAGE_H_MM - 2 * MARGIN_MM) * PX_PER_MM

const MIN_FONT_PT = 9 // rules-execute.md: cuerpo mínimo de 9 pt
const MIN_FONT_PX = MIN_FONT_PT * (96 / 72)
const MAX_BYTES = 10 * 1024 * 1024 // rules-execute.md: máximo 10 MB

const DEFAULT_NAME = "Trojes_OnePager_Execute2026.pdf"
const UNDERFILL_WARN_PX = 1020 // more than ~13 mm of empty space at the bottom

// ─── Types ──────────────────────────────────────────────

type DomReport = {
  pageRight: number
  pageBottom: number
  overflows: string[]
  smallText: string[]
  brokenImages: string[]
}

type PdfReport = {
  pages: number
  widthPt: number
  heightPt: number
  bytes: number
}

// ─── Checks ─────────────────────────────────────────────

async function inspectDom(page: import("playwright").Page): Promise<DomReport> {
  await page.setViewportSize({
    width: Math.round(PAGE_W_MM * PX_PER_MM),
    height: Math.round(PAGE_H_MM * PX_PER_MM),
  })
  await page.emulateMedia({ media: "print" })
  return page.evaluate((minFontPx: number) => {
    const el = document.querySelector(".page")
    if (!el) throw new Error(".page element not found")
    const pageRect = el.getBoundingClientRect()

    const overflows: string[] = []
    for (const node of document.querySelectorAll<HTMLElement>("*")) {
      const r = node.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      if (r.right > document.documentElement.clientWidth + 0.5 || r.left < -0.5) {
        overflows.push(`${node.tagName.toLowerCase()}.${node.className || "?"}`)
      }
    }

    const smallText: string[] = []
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const textNode = walker.currentNode
      if (!textNode.textContent || !textNode.textContent.trim()) continue
      const parent = textNode.parentElement
      if (!parent || parent.tagName === "SCRIPT" || parent.tagName === "STYLE") continue
      const size = parseFloat(getComputedStyle(parent).fontSize)
      if (size < minFontPx) {
        const label = `${parent.tagName.toLowerCase()}.${parent.className || "?"}`
        const snippet = textNode.textContent.trim().slice(0, 40)
        if (!smallText.includes(label)) smallText.push(`${label} (${size.toFixed(1)}px): ${snippet}`)
      }
    }

    const brokenImages: string[] = []
    for (const img of document.querySelectorAll<HTMLImageElement>("img")) {
      if (!img.complete || img.naturalWidth === 0) brokenImages.push(img.getAttribute("src") || "?")
    }

    return {
      pageRight: pageRect.right,
      pageBottom: pageRect.bottom,
      overflows,
      smallText,
      brokenImages,
    }
  }, MIN_FONT_PX)
}

function parsePdf(buffer: Buffer): PdfReport {
  const raw = buffer.toString("latin1")

  const counts = [...raw.matchAll(/\/Count\s+(\d+)/g)].map((m) => Number(m[1]))
  const pages = counts.length > 0 ? Math.max(...counts) : 0

  const mediaBox = raw.match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/)
  const widthPt = mediaBox ? Number(mediaBox[1]) : 0
  const heightPt = mediaBox ? Number(mediaBox[2]) : 0

  return { pages, widthPt, heightPt, bytes: buffer.byteLength }
}

// ─── Report helpers ─────────────────────────────────────

const ok = (msg: string) => console.log(`  ✓ ${msg}`)
const bad = (msg: string) => console.log(`  ✗ ${msg}`)
const warn = (msg: string) => console.log(`  ! ${msg}`)

const near = (a: number, b: number) => Math.abs(a - b) <= 3

function a4Matches(widthPt: number, heightPt: number): boolean {
  const A4_W = 595.28
  const A4_H = 841.89
  return (
    (near(widthPt, A4_W) && near(heightPt, A4_H)) ||
    (near(widthPt, A4_H) && near(heightPt, A4_W))
  )
}

// ─── Main ───────────────────────────────────────────────

async function main(): Promise<void> {
  const outName = process.argv[2] || DEFAULT_NAME
  const outPath = path.resolve(ROOT, outName)

  console.log(`One Pager PDF generator — ${outName}\n`)

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.goto(HTML_URL, { waitUntil: "load" })
    await page.waitForFunction(() =>
      [...document.images].every((img) => img.complete),
    )

    console.log("Layout checks (print media, A4):")
    const dom = await inspectDom(page)

    let failed = false

    // Printable width: .page must stay inside the @page content box
    const contentRight = PAGE_W_MM * PX_PER_MM - MARGIN_MM * PX_PER_MM
    if (dom.pageRight <= contentRight + 0.5) {
      ok(`content width fits (${dom.pageRight.toFixed(0)}px ≤ ${contentRight.toFixed(0)}px)`)
    } else {
      bad(`content clips at right edge (${dom.pageRight.toFixed(0)}px > ${contentRight.toFixed(0)}px)`)
      failed = true
    }

    // Printable height: content must fit one page
    if (dom.pageBottom <= PRINTABLE_H) {
      ok(`content height fits one page (${dom.pageBottom.toFixed(0)}px ≤ ${PRINTABLE_H.toFixed(0)}px)`)
      if (dom.pageBottom < UNDERFILL_WARN_PX) {
        warn(`page underfilled: ${((PRINTABLE_H - dom.pageBottom) / PX_PER_MM).toFixed(1)} mm of empty space`)
      }
    } else {
      bad(`content overflows to page 2 (${dom.pageBottom.toFixed(0)}px > ${PRINTABLE_H.toFixed(0)}px)`)
      failed = true
    }

    if (dom.overflows.length === 0) ok("no elements overflow the page")
    else {
      bad(`elements overflow: ${dom.overflows.join(", ")}`)
      failed = true
    }

    if (dom.smallText.length === 0) ok(`all text ≥ ${MIN_FONT_PT}pt`)
    else {
      bad(`text below ${MIN_FONT_PT}pt: ${dom.smallText.join("; ")}`)
      failed = true
    }

    if (dom.brokenImages.length === 0) ok("all images loaded")
    else {
      bad(`broken images: ${dom.brokenImages.join(", ")}`)
      failed = true
    }

    if (failed) {
      console.log("\n✗ Layout checks failed — PDF not generated.")
      process.exitCode = 1
      return
    }

    console.log("\nGenerating PDF…")
    await page.pdf({
      path: outPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: `${MARGIN_MM}mm`, right: `${MARGIN_MM}mm`, bottom: `${MARGIN_MM}mm`, left: `${MARGIN_MM}mm` },
    })

    const buffer = await Bun.file(outPath).arrayBuffer()
    const pdf = parsePdf(Buffer.from(buffer))

    console.log("PDF checks:")
    if (pdf.pages === 1) ok("exactly 1 page")
    else {
      bad(`${pdf.pages} pages — rules-execute.md allows only 1 (−10 points)`)
      failed = true
    }

    if (a4Matches(pdf.widthPt, pdf.heightPt)) {
      ok(`A4 size (${pdf.widthPt.toFixed(1)} × ${pdf.heightPt.toFixed(1)} pt)`)
    } else {
      bad(`unexpected page size (${pdf.widthPt.toFixed(1)} × ${pdf.heightPt.toFixed(1)} pt, expected A4 595.28 × 841.89)`)
      failed = true
    }

    if (pdf.bytes <= MAX_BYTES) ok(`size ${(pdf.bytes / 1024).toFixed(0)} KB ≤ 10 MB`)
    else {
      bad(`size ${(pdf.bytes / 1024 / 1024).toFixed(1)} MB > 10 MB`)
      failed = true
    }

    if (failed) {
      console.log("\n✗ PDF generated but failed validation.")
      process.exitCode = 1
      return
    }

    const stats = await stat(outPath)
    console.log(`\n✓ ${path.relative(ROOT, outPath)} (${(stats.size / 1024).toFixed(0)} KB)`)
  } finally {
    await browser.close()
  }
}

await main()

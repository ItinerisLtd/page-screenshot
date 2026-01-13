"use server"

import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium-min"

interface ScreenshotResult {
  success: boolean
  title?: string
  filename?: string
  dataUrl?: string
  error?: string
}

// Sanitize filename to be safe for file systems
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100)
    .toLowerCase()
}

const remoteExecutablePath =
  "https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar"

export async function captureScreenshots(url: string): Promise<ScreenshotResult> {
  let browser = null

  try {
    let executablePath: string

    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      // Production: use remote chromium binary
      executablePath = await chromium.executablePath(remoteExecutablePath)
    } else {
      // Local development: try to find local Chrome/Chromium
      executablePath = await chromium.executablePath(remoteExecutablePath)
    }

    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      executablePath,
      headless: true,
      ignoreDefaultArgs: ["--disable-extensions"],
    })

    const page = await browser.newPage()

    // Set a reasonable timeout
    page.setDefaultNavigationTimeout(30000)

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    )

    // Navigate to the page
    await page.goto(url, { waitUntil: "networkidle2" })

    // Get the page title
    const title = await page.title()

    // Create filename from title
    const sanitizedTitle = sanitizeFilename(title) || sanitizeFilename(new URL(url).hostname)
    const filename = `${sanitizedTitle || "screenshot"}-${Date.now()}.png`

    // Take full page screenshot
    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: "png",
    })

    await browser.close()

    // Convert to base64 data URL
    const base64 = Buffer.from(screenshotBuffer).toString("base64")
    const dataUrl = `data:image/png;base64,${base64}`

    return {
      success: true,
      title,
      filename,
      dataUrl,
    }
  } catch (error) {
    if (browser) {
      await browser.close()
    }

    console.error("Screenshot capture error:", error)

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to capture screenshot",
    }
  }
}

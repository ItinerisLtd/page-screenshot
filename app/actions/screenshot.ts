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

export async function captureScreenshots(url: string): Promise<ScreenshotResult> {
  let browser = null

  try {
    // Get the executable path for chromium
    const executablePath = await chromium.executablePath(
      "https://github.com/nicx/chromium/releases/download/v131.0.2/chromium-v131.0.2-pack.tar",
    )

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      executablePath,
      headless: true,
    })

    const page = await browser.newPage()

    // Set a reasonable timeout
    page.setDefaultNavigationTimeout(30000)

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

    // Convert to base64 data URL
    const base64 = Buffer.from(screenshotBuffer).toString("base64")
    const dataUrl = `data:image/png;base64,${base64}`

    await browser.close()

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

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to capture screenshot",
    }
  }
}

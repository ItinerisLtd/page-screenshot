"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, Download, Loader2, CheckCircle2, XCircle, Link2 } from "lucide-react"
import { captureScreenshots } from "@/app/actions/screenshot"

interface ScreenshotResult {
  url: string
  title: string
  filename: string
  status: "pending" | "processing" | "success" | "error"
  error?: string
  dataUrl?: string
}

export function ScreenshotTool() {
  const [urls, setUrls] = useState("")
  const [results, setResults] = useState<ScreenshotResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseUrls = (text: string): string[] => {
    return text
      .split(/[\n,]/)
      .map((url) => url.trim())
      .filter((url) => {
        try {
          new URL(url.startsWith("http") ? url : `https://${url}`)
          return true
        } catch {
          return false
        }
      })
      .map((url) => (url.startsWith("http") ? url : `https://${url}`))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setUrls(text)
    }
    reader.readAsText(file)
  }

  const handleCapture = async () => {
    const urlList = parseUrls(urls)
    if (urlList.length === 0) return

    setIsProcessing(true)
    setResults(
      urlList.map((url) => ({
        url,
        title: "",
        filename: "",
        status: "pending",
      })),
    )

    for (let i = 0; i < urlList.length; i++) {
      setResults((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: "processing" } : r)))

      try {
        const result = await captureScreenshots(urlList[i])

        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: result.success ? "success" : "error",
                  title: result.title || "",
                  filename: result.filename || "",
                  dataUrl: result.dataUrl,
                  error: result.error,
                }
              : r,
          ),
        )
      } catch (error) {
        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: "error",
                  error: error instanceof Error ? error.message : "Unknown error",
                }
              : r,
          ),
        )
      }
    }

    setIsProcessing(false)
  }

  const handleDownload = (result: ScreenshotResult) => {
    if (!result.dataUrl) return

    const link = document.createElement("a")
    link.href = result.dataUrl
    link.download = result.filename || "screenshot.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadAll = () => {
    results
      .filter((r) => r.status === "success" && r.dataUrl)
      .forEach((result) => {
        setTimeout(() => handleDownload(result), 100)
      })
  }

  const urlCount = parseUrls(urls).length
  const successCount = results.filter((r) => r.status === "success").length

  return (
    <div className="space-y-8">
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <Tabs defaultValue="textarea" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary">
              <TabsTrigger value="textarea" className="data-[state=active]:bg-background">
                <Link2 className="mr-2 h-4 w-4" />
                Paste URLs
              </TabsTrigger>
              <TabsTrigger value="csv" className="data-[state=active]:bg-background">
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV
              </TabsTrigger>
            </TabsList>

            <TabsContent value="textarea" className="mt-4">
              <div className="space-y-3">
                <Label htmlFor="urls" className="text-foreground">
                  Enter URLs (one per line)
                </Label>
                <Textarea
                  id="urls"
                  placeholder={"https://example.com\nhttps://vercel.com\nhttps://github.com"}
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  className="min-h-[200px] font-mono text-sm bg-secondary border-border placeholder:text-muted-foreground"
                />
              </div>
            </TabsContent>

            <TabsContent value="csv" className="mt-4">
              <div className="space-y-3">
                <Label htmlFor="csv" className="text-foreground">
                  Upload CSV file with URLs
                </Label>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors bg-secondary/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">CSV file with one URL per line</p>
                  <input
                    ref={fileInputRef}
                    id="csv"
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                {urls && (
                  <div className="mt-4">
                    <Label className="text-foreground">Preview</Label>
                    <Textarea
                      value={urls}
                      onChange={(e) => setUrls(e.target.value)}
                      className="min-h-[120px] font-mono text-sm mt-2 bg-secondary border-border"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {urlCount} valid URL{urlCount !== 1 ? "s" : ""} detected
            </p>
            <Button
              onClick={handleCapture}
              disabled={urlCount === 0 || isProcessing}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Capturing...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Screenshots
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Results</h2>
              {successCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadAll}
                  className="border-border hover:bg-secondary bg-transparent"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download All ({successCount})
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {result.status === "pending" && (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                    )}
                    {result.status === "processing" && <Loader2 className="h-5 w-5 text-accent animate-spin" />}
                    {result.status === "success" && <CheckCircle2 className="h-5 w-5 text-accent" />}
                    {result.status === "error" && <XCircle className="h-5 w-5 text-destructive" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate text-foreground">{result.title || result.url}</p>
                      {result.title && <p className="text-xs text-muted-foreground truncate">{result.url}</p>}
                      {result.error && <p className="text-xs text-destructive mt-1">{result.error}</p>}
                    </div>
                  </div>
                  {result.status === "success" && result.dataUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(result)}
                      className="ml-2 hover:bg-secondary"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

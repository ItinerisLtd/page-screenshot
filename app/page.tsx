import { ScreenshotTool } from "@/components/screenshot-tool"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">PageShot</h1>
          <p className="text-muted-foreground text-lg">Capture full-page screenshots of any website</p>
        </header>
        <ScreenshotTool />
      </div>
    </main>
  )
}

# PageShot

A modern web application for capturing full-page screenshots of any website. Built with Next.js, it uses Puppeteer and Chromium to generate high-quality screenshots in batch.

## Features

- **Batch Screenshot Capture** - Process multiple URLs simultaneously
- **Full-Page Screenshots** - Captures entire page content, not just viewport
- **Multiple Input Methods** - Paste URLs directly or upload CSV files
- **Real-time Progress Tracking** - Monitor each screenshot's status with visual indicators
- **Download Management** - Download individual screenshots or all at once
- **Dark Mode Support** - Built with next-themes for seamless theme switching
- **Server-Side Rendering** - Optimized with Next.js App Router and Server Actions
- **Production-Ready** - Docker support with Chromium bundled

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Components**: Radix UI + Tailwind CSS
- **Screenshot Engine**: Puppeteer Core + Chromium
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theme support
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 20 or later
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd page-screenshot
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Capturing Screenshots

1. **Paste URLs**: Enter one URL per line in the text area
2. **Upload CSV**: Upload a CSV or text file with URLs (one per line)
3. Click "Capture Screenshots" to start the batch process
4. Monitor progress with real-time status indicators
5. Download individual screenshots or use "Download All" for batch download

### Input Format

URLs can be entered with or without protocol:
```
https://example.com
github.com
vercel.com
```

The application automatically adds `https://` to URLs without a protocol.

## Docker Deployment

Build and run with Docker:

```bash
docker build -t pageshot .
docker run -p 3000:3000 pageshot
```

The Dockerfile includes:
- Multi-stage build for optimized image size
- Chromium and required fonts pre-installed
- Non-root user for security
- Production-optimized configuration

## Configuration

### Environment Variables

- `NODE_ENV` - Set to `production` for production builds
- `VERCEL` - Automatically set by Vercel, triggers production Chromium path

### Screenshot Settings

Default configuration in `app/actions/screenshot.ts`:
- Viewport: 1920x1080
- Format: PNG
- Full page capture enabled
- 30-second timeout

## Project Structure

```
├── app/
│   ├── actions/
│   │   └── screenshot.ts      # Server action for screenshot capture
│   ├── layout.tsx             # Root layout with theme provider
│   └── page.tsx               # Main application page
├── components/
│   ├── screenshot-tool.tsx    # Main screenshot UI component
│   ├── theme-provider.tsx     # Theme management
│   └── ui/                    # Reusable UI components
├── lib/
│   └── utils.ts               # Utility functions
└── public/                    # Static assets
```

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Adding New Features

1. Server actions go in `app/actions/`
2. UI components go in `components/`
3. Shared utilities go in `lib/`
4. Use shadcn/ui for new components

## Browser Compatibility

The application uses modern web APIs and is compatible with:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

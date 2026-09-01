# Bilal Ahmed Portfolio

Source code for [bilal5.me](https://bilal5.me), a focused portfolio for ML/AI, software engineering, and interface design.

## Stack

- Next.js 16 App Router with React 19 and TypeScript
- Tailwind CSS v4 with shadcn and `tw-animate-css`
- Motion for the intro sequence, scroll transitions, and interaction details
- Three.js, WebGL, and custom GLSL for the projects experience
- `react-github-calendar` for live contribution activity
- Local artwork, video, font, and resume assets served from `portfolio/public/`

## Project structure

- `portfolio/app/` contains the page, layout, global styles, and metadata.
- `portfolio/components/` contains the portfolio UI, social previews, liquid controls, and projects carousel.
- `portfolio/lib/` contains shared utilities.
- `portfolio/public/` contains the local media used by the deployed portfolio.

## Run locally

```bash
cd portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

## Verify a production build

```bash
cd portfolio
npm run lint
npm run build
npm run start
```

## Deployment

Production is hosted on Vercel at [bilal5.me](https://bilal5.me). Portfolio media is intentionally kept out of the GitHub remote and included through the local Vercel deployment workflow, keeping the repository focused on the application source.

```bash
cd portfolio
vercel --prod
```

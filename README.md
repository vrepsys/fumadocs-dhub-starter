# fumadocs-dhub-starter

A [Fumadocs](https://fumadocs.dev) starter template set up for [Dhub](https://dhub.dev), a CMS for documentation sites.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvrepsys%2Ffumadocs-dhub-starter)

## Getting started

1. Fork this template
2. Import the project into [Dhub](https://dhub.dev)
3. Start editing with a visual editor

The sidebar is driven by `navigation.json` in the project root. Dhub reads and writes this file, so you can rearrange navigation visually without editing config files. `lib/navigation.ts` converts it into a Fumadocs page tree at build time. Page paths in `navigation.json` are relative to the content directory (`content/docs`).

## What's inside

The sample docs double as a hands-on tour of Dhub:

- **Editing**: the editor basics, plus live examples of callouts, tabs & accordions, steps, code blocks, tables, images, and custom MDX components
- **Publishing**: how navigation works, pushing to main vs. opening pull requests, and deploying
- **Make it yours**: a checklist for turning the template into your own site

Everything is standard Fumadocs: content lives in `content/docs` as MDX, components are registered in `mdx-components.tsx`, and the app is a regular Next.js project.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

# Human & Humanoid Motion Learning Guide

The guide is published at:

https://hxlinworld.github.io/Humanoid-motion-learning-guide/

## Content and editing

The curated source is `content/motion-guide.json`. It preserves the original Notion guide's four sections, researcher groups, project titles, and exact resource URLs. The original source and its last edit time are recorded in that file and displayed in the page footer.

The initial edition contains 3 courses, 14 researcher groups (21 people), 55 projects, 9 resource collections, and 11 talks/blogs: 99 original links in total.

To update the content, edit the JSON and regenerate the committed static HTML:

```bash
python3 scripts/build-motion-guide.py
```

The generated file is `public/Humanoid-motion-learning-guide/index.html`. The adjacent `assets/` folder contains its stylesheet, browser-only search/filter behavior, and icon. No CDN, Notion credentials, or runtime server is needed to view the guide. JavaScript enhances search and navigation; all resource links are in the HTML itself.

This is a static edition, not an automatic Notion synchronization. Update `sourceUpdatedAt` only when the underlying Notion content changes. Source affiliations and spellings were retained, including `Jiaman Li@Standard`, `Guangya Shi` in a talk title, and `Webninar031`; review those with the source author before changing them.

## Homepage integration

The English and Chinese navigation configurations contain a `type = "link"` item pointing to `/Humanoid-motion-learning-guide/`. The existing single-page homepage navigation keeps ordinary sections as anchors, while standalone links use native anchors for full-page navigation. The site's language settings are unchanged.

## Deployment

The existing Next.js static export copies this directory to `out/Humanoid-motion-learning-guide/`. The existing GitHub Actions workflow builds and publishes `out/` after a push to `main` or `ci`. No separate repository or hosting configuration is required.

Validation for a content or layout update:

```bash
node --check public/Humanoid-motion-learning-guide/assets/guide.js
npm run build
```

Confirm the generated `out/Humanoid-motion-learning-guide/index.html` exists, then check homepage navigation, section filters, search (including a no-results query), and narrow-screen layout. The guide uses relative asset links so it remains portable to the same subdirectory on another static host.

# Blog Card Layout Design

## Goal

Display blog cover images in their intended 16:9 ratio and use a denser three-column card layout on desktop.

## Scope

- Change only the public blog-list card grid and cover-image container.
- Use one column on phones, two columns from the `md` breakpoint, and three columns from the `lg` breakpoint.
- Give both image and no-image fallbacks a 16:9 container using Tailwind's `aspect-video` utility.
- Preserve the existing link target, search, category filters, metadata, card content, and image `object-cover` behavior.

## Verification

- Run TypeScript checking and a production build.
- Inspect the published card markup and class names to confirm the responsive grid and 16:9 aspect-ratio utility are present.

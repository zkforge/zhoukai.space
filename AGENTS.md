# AGENTS.md

## Project

This repository is the source for Zhou Kai's personal website. Preserve its existing visual system, responsive behavior, and real personal content. The inherited parent instructions also apply.

## Working Rules

- Read the target page, its components, and related data loaders before editing.
- Keep changes surgical and preserve unrelated user work.
- When removing or replacing page content, preserve structural frontmatter, layout markers, and component contracts unless the replacement no longer satisfies their data requirements.
- Do not restore template-author identity, links, services, or placeholder metrics.
- Before handoff, run `pnpm lint`, `pnpm build`, and `git diff --check`. Visually inspect affected public pages at desktop and narrow widths.

## Deferred Restores

### Photos

`pages/photos.md` intentionally remains a normal-width placeholder. `PhotoGalleryAll.vue` is reusable, but it imports the currently absent `photos/data.ts`.

Until authentic personal photos and valid generated photo data exist:

- keep the placeholder route and existing navigation entry;
- do not add `display: ''`, `<!-- @layout-full-width -->`, or `<PhotoGalleryAll />`;
- do not delete the reusable photo components.

When real photos are supplied, restore the feature as one change: add the assets, generate or validate `photos/data.ts` through the existing photo workflow, restore the page-level display/full-width configuration and gallery component, then verify loading, layout, dark mode, and narrow screens.

### Demos

`pages/demos.md` intentionally remains a normal-width placeholder. `ListDemos.vue`, `WrapperDemo.vue`, and `demo/data.ts` are reusable, but there are currently no real demo Markdown/MP4 pairs.

Until real paired demo assets exist:

- keep the placeholder route and existing navigation entry;
- do not add `<!-- @layout-full-width -->` or `<ListDemos />`;
- do not delete the reusable demo components or loader.

When real demos are supplied, restore the feature as one change: add each same-basename `.md` and `.mp4` pair under `demo/`, restore the full-width marker and list component, then verify the responsive columns, video playback, links, and browser console.

### Post Sub-navigation

`pages/posts/index.md` intentionally exposes only the existing Blog feed at `/posts`. `SubNav.vue` still defines candidate sections for Blog, Talks, Podcasts, Streams, and Notes. `ListTalks.vue` and the empty `data/talks.ts` are reusable, but `/talks`, `/podcasts`, `/streams`, and `/notes` do not currently exist.

Until authentic content and a real route exist for an additional section:

- keep `/posts` as the only exposed post category;
- do not mount `<SubNav />` or publish dead category links;
- do not delete `SubNav.vue`, `ListTalks.vue`, or `data/talks.ts`.

When a section gains real content, restore only the supported categories as one change: add the route and repository-native data/list implementation, update `SubNav.vue` to include only routes that exist, mount it on the relevant category pages, and verify active states, the English-only control, responsive wrapping, links, and the browser console. Do not restore template-author talks, podcasts, streams, or notes.

## Common Commands

```bash
pnpm dev
pnpm lint
pnpm build
git diff --check
```

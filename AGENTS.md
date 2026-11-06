# AGENTS.md

## Project

This repository is the source for Zhou Kai's personal website. Preserve its existing visual system, responsive behavior, and real personal content. The inherited parent instructions also apply.

## Working Rules

- Read the target page, its components, and related data loaders before editing.
- Keep changes surgical and preserve unrelated user work.
- When removing or replacing page content, preserve structural frontmatter, layout markers, and component contracts unless the replacement no longer satisfies their data requirements.
- Do not restore template-author identity, links, services, or placeholder metrics.
- Before handoff, run `pnpm lint`, `pnpm build`, and `git diff --check`. Visually inspect affected public pages at desktop and narrow widths.

## Chinese and English Content

- When adding, editing, renaming, or removing bilingual page content, navigation labels, portfolio descriptions, or translated metadata, update both Chinese and English versions in the same change. Follow the existing `I18n`, `.i18n-zh` / `.i18n-en`, paired content files, and frontmatter fields such as `title` / `titleEn`.
- Verify both language modes: matching content and links, correct language visibility, and responsive layout. Existing single-language blog posts only need a translation when requested.

## Photos

`pages/photos.md` uses the full-width `PhotoGalleryAll.vue` gallery. Photos live under `photos/` with matching JSON sidecars for captions and blurhash values; `photos/data.ts` is generated from them. To add photos, copy the originals into `photos/`, run `pnpm photos`, add or review captions in the generated sidecars, and run `pnpm photos` again. Verify loading, layout, dark mode, and narrow screens.

## Portfolio

Add or remove each portfolio entry as a same-basename `YYYY-MM-DD.md` / `.mp4` pair under `portfolio/`. For GitHub projects, set frontmatter `link` to the repository URL and `stars` to its current count so a real value remains visible when GitHub cannot be reached. Verify video playback, project links, star display, dark mode, and narrow screens.

## Deferred Restores

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

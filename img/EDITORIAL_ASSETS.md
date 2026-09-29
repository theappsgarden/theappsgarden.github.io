# Reusable editorial media

The bitmap illustrations were generated with the built-in ImageGen tool and exported to WebP. The current homepage hero is a code-native animation: independent paper cards enter as scattered tasks and leave as clear outcomes. It uses the same forest-green, warm-paper, and mint palette as the editorial images. The 1254 × 1254 pixel compact edit remains available for static reuse. None of the bitmap images has embedded language-specific text. The eight SVG icons are hand-authored in the site's green palette and scale without loss.

| File | Suggested reuse |
| --- | --- |
| `process-to-progress-compact.webp` | Static process overview or social preview alternative |
| `process-to-progress.webp` | Original wide process overview and social preview |
| `process-discovery.webp` | Process audit, discovery, diagnosis |
| `team-handoff.webp` | Onboarding, training, documentation, adoption |
| `meeting-followup.webp` | Sales meeting, notes, follow-up workflow |
| `product-content-workflow.webp` | Content workflow product; drafts from scattered ideas |
| `product-video-studio.webp` | AI-assisted product video, demo, or feature launch |
| `product-social-agents.webp` | LinkedIn content and social presence agents |
| `icon-discover.svg` | Understanding a process; process audit |
| `icon-prioritize.svg` | Ranking opportunities |
| `icon-design.svg` | Designing a workflow and plan |
| `icon-design-activate.svg` | Designing and activating a solution |
| `icon-launch.svg` | Configuring, testing, and putting a workflow in use |
| `icon-handoff.svg` | Documentation and transfer to the team |
| `icon-workshop.svg` | Collaborative opportunity workshop |
| `icon-training.svg` | Practical team training |

The homepage service cards use `discover`, `prioritize`, and `design-activate`. The four process steps use `discover`, `design`, `launch`, and `handoff`. The services cards use `workshop`, `discover`, `launch`, and `training`. Keep these semantic pairings when translating headings; choose an icon for its meaning rather than its position in a sequence.

The three product pages use the matching square WebP illustrations above. Their generation prompts are recorded in [`product-illustrations.prompt.md`](product-illustrations.prompt.md). The earlier package PNG and two SVG mockups remain available as source concepts, but are no longer displayed on the product pages.

Use `media-icon` for decorative icons beside headings, with `alt=""` and `aria-hidden="true"`. Use `media-frame` for landscape images. The shared styles live in `css/production.css`; responsive layout and reduced-motion behavior live in `css/responsive-overrides.css`. The homepage and services pages demonstrate reuse in all three languages.

## ImageGen prompts

The original prompt is in `process-to-progress.prompt.md`; the current hero edit prompt is in `process-to-progress-compact.prompt.md`. The companion images used `process-to-progress.webp` as a **style reference only**.

### `process-discovery.webp`

```text
Use case: stylized-concept
Asset type: reusable website editorial image for service discovery and process audit sections
Input image 1: style reference only; keep its tactile cut-paper / soft clay realism and forest-green palette, but create a wholly new composition
Primary request: overhead still life of a small set of cream paper workflow cards arranged loosely on a dark forest-green desk, with a restrained green magnifying lens highlighting one clear bottleneck in a simple hand-drawn process path. A pencil and a single fresh leaf add subtle human and garden cues. Show thoughtful analysis of real work, not technology hype.
Composition: landscape, focal point centered and usable as a card or half-width section image
Style: matte tactile cut paper and softly sculpted objects, premium editorial illustration, natural shadows
Palette: deep forest green #102b25, emerald #007e68, pale mint #eaf4ee, warm cream
Constraints: no text, no letters, no numbers, no logos, no people, no screens, no humanoid robots, no neural-network glow, no watermark.
```

### `team-handoff.webp`

```text
Use case: stylized-concept
Asset type: reusable website editorial image for team onboarding, adoption, and handoff sections
Input image 1: style reference only; retain the tactile editorial cut-paper / soft clay look and restrained green palette, create a different composition
Primary request: three neat cream instruction cards and a small green toolkit placed on a forest-green work surface, a simple white path moving from one open card to a pair of finished mint cards; a young green leaf grows beside the finished cards. Convey a team gaining an understandable repeatable way of working and ownership after setup, without depicting people or a software interface.
Composition: landscape, balanced and uncluttered, readable at half-width and square crop
Style: premium matte tactile paper and soft sculpted objects, natural diffused shadows
Palette: deep forest green #102b25, emerald #007e68, pale mint #eaf4ee, warm cream
Constraints: no text, letters, numbers, logos, screens, robots, glowing effects, or watermark.
```

### `meeting-followup.webp`

```text
Use case: stylized-concept
Asset type: reusable website editorial image for a meeting follow-up and practical AI use case
Input image 1: style reference only; match tactile cut-paper and soft sculpted-object realism and restrained greens, but use a new composition
Primary request: a single cream meeting-notes sheet on a forest-green desk visually branching into three tidy mint cards representing summary, next steps, and a draft follow-up, with one dark-green pencil positioned by the last card to imply human review. Subtle small leaf, gentle natural shadows. Show a practical work outcome, not abstract AI.
Composition: wide landscape, clear left-to-right flow, no words or interface UI
Palette: deep forest green #102b25, emerald #007e68, pale mint #eaf4ee, warm cream
Constraints: no text, no letters, no numbers, no logos, no people, no screens, no robots, no watermark.
```

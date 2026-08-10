# Org Dashboard — Direct Print (no download)

**Date:** 2026-08-09
**Status:** Approved design
**Area:** `tshare-Frontend` — org admin dashboard
**Feature:** Let an org admin print a received submission directly to their printer without downloading it first. Only the content prints.

---

## Goal

In the org dashboard's preview pane, the admin selects a submission (text, image, or file —
including PDF and Office docs) and taps **Print**. The content is sent to the printer directly.
No download step. The printed page contains **only the content** — no branding/header.

## Scope & entry point

- Single entry point: the **Print** button in the dashboard preview pane's action row
  (beside the existing **Open** and **Delete** actions), shown when a submission is selected.
- One item at a time. No batch printing.
- Customer-facing org pages (`/org/submit`, `/org/upload`) are **out of scope**.

## Mechanism (Approach A — refined print window)

Tapping **Print**:

1. Opens a small, self-contained print window carrying only the submission's content.
2. Waits for the content (image/iframe) to finish rendering.
3. Fires the browser **Print** dialog immediately (one click → dialog).
4. Prints to the admin's default printer via the dialog.

The print window contains a tiny load-timing script that:

- Prints once when all `img`/`iframe` elements have loaded (or after a short fallback timeout
  for cross-origin resources that never fire `load`).
- Uses a guard flag so `print()` never fires twice.

### Per-type printed output

| Content type | Printed representation |
|---|---|
| Text | Clean `<pre>` preserving line breaks; long lines wrapped (`white-space: pre-wrap`, `word-break: break-word`) so nothing is cut off. |
| Image | `<img>` scaled to fit the printed page (`max-width: 100%`). |
| PDF / text / code file | Inline `<iframe>` streaming the existing backend route `GET /org/preview/:id` (same-origin, `Content-Disposition: inline`). |
| Office file (`.docx`, `.xlsx`, `.pptx`, `.odt`, …) | `<iframe>` via Google Docs viewer (`docs.google.com/gview?embedded=true`). |
| Any other file | Attempted in an `<iframe>`; if the browser can't render it, the browser shows its default behavior rather than a dead end. |

No file is forced into a `download` disposition at any point.

## Error handling

- **Popup blocked** → stop `printSelected()`, show inline dashboard error:
  *"Please allow pop-ups to print this content."*
- **Missing content / no selection** → button is only rendered when a submission is selected;
  `printSelected()` no-ops if `selectedItem` is falsy.
- **File with no URL / id** → falls through to the iframe path or renders "No content"
  for empty text.

## Security / correctness

- All user-controlled strings (text, sender name, filename, org name) are HTML-escaped before
  being injected into the print window to prevent markup injection.
- No backend changes: `GET /org/preview/:id` already streams files with `Content-Disposition: inline`.

## Files touched

| File | Change |
|---|---|
| `tshare-Frontend/src/components/org-preview/OrgDashboard.jsx` | Revise existing `printSelected()`: remove the header/branding block (minimal printout), expand file handling to try all types in an iframe (Google Docs for office). Keep the `print` icon and the Print button. |
| `tshare-Frontend/src/components/org/OrgDashboard.css` | Only if a minor button tweak is needed. |

## Testing

- **Text:** click Print on a text submission → print dialog opens with the full text, lines wrap.
- **Image:** print dialog shows the image scaled to the page.
- **PDF:** prints via the inline browser viewer; **`.docx`** via Google Docs viewer.
- **Random/binary file:** no crash — browser shows its default render behavior.
- Confirm the flow **never triggers a download** for any type.
- Confirm the popup-block error path shows the inline message.

## Non-goals (v1)

- Batch / multi-select printing.
- Print header/footer branding, QR, or sender metadata on the page.
- Frontend changes on customer-facing org pages.
# Digital Wedding Invitation — Bhavena & Siddharth

A static, lightweight invitation website. Plain HTML, CSS and JavaScript. No build step, no backend, no API keys.

## Project structure

```
wedding-invitation/
├── index.html      page structure
├── style.css       colours, fonts, layout, animation
├── script.js       countdown, calendar, share, copy address (no need to edit)
├── data.js         ALL wedding details live here
├── favicon.svg     browser tab icon
├── README.md       this guide
└── assets/
    ├── images/     put optional photos here (bride, groom, couple)
    └── fonts/      optional: self-hosted fonts (see "Fonts")
```

## 1. Open it locally

Double-click `index.html`. It opens in your browser, no server needed.
In VS Code you can also right-click `index.html` and choose "Open with Live Server" if you have that extension.

## 2. Edit wedding details

Open `data.js`. Everything is under the comment `EDIT WEDDING DETAILS HERE`. Change the text between the quotation marks, save, and refresh the browser.

Two things are NOT read from `data.js` because link previews (WhatsApp, etc.) cannot run JavaScript:
the `<title>` and the `description` / `og:` lines at the top of `index.html`. If you change names or dates, update those too.

## 3. Replace or add images

The site looks complete without photos. To add optional photos:

1. Copy your files into `assets/images/` (for example `bride.jpg`, `groom.jpg`, `couple.jpg`).
2. In `data.js`, fill in the `photos` block:
   ```js
   photos: { bride: "assets/images/bride.jpg", couple: "", groom: "assets/images/groom.jpg" }
   ```
3. Leave any entry as `""` to skip it. A missing or wrong file is removed automatically, so no broken image ever shows.

Tips: portrait photos, about 800 px wide, under 200 KB each.

For a link preview picture in WhatsApp, add an `og:image` line (instructions are in a comment in `index.html`). It needs the full live web address of the image.

## 4. Change colours

Open `style.css`. The first block, `CHANGE COLOURS HERE`, holds all colours:

```css
--cream, --sage, --burgundy, --gold, --green
```
`--gold-text` is a darker gold used for small text so it stays readable. Keep it darker than `--gold`.

## 5. Change the venue

In `data.js` change `venueName`, `venueAddress`, `venueCity` and `mapsUrl`.
Every "Get Directions", "Open in Google Maps" and floating "Directions" button uses `mapsUrl`, and the calendar files use the venue name and address.

## 6. Change dates and times

In `data.js` there are two kinds of values for each event:

- Display text, such as `dateWedding: "22 November 2026"` and `weddingTime: "10:17 AM – 11:32 AM"`. This is what guests read.
- Machine values, such as `weddingStart: "2026-11-22T10:17:00+05:30"`. These drive the countdown and the calendar files. `+05:30` is India Standard Time.

Change both together. `weddingStart` is the countdown target. `receptionEnd` is empty on purpose: no end time was supplied, so none is invented.

## 7. Test the website

Open `index.html` and check:

- Hero animation plays; the "Explore Invitation" button scrolls to Events.
- Countdown ticks every second.
- Every "Get Directions" and "Open in Google Maps" button opens `https://maps.app.goo.gl/9zb9TtPdssgMUv189` in a new tab.
- "Copy Address" shows "Address copied", then paste somewhere to confirm.
- "Add to Calendar" opens a small menu; "Add to Google Calendar" opens Google Calendar; "Download Calendar File" saves a `.ics` file that opens in your calendar app.
- "Share on WhatsApp" opens WhatsApp with the message.
- Phone view: in Chrome press F12, click the phone icon, and try 360, 375, 390, 414 and 430 px widths. There should be no sideways scrolling.

Note: the browser "Share Invitation" sheet only appears on a hosted (https) page on phones and some computers. On `file://` or unsupported browsers the "Copy Invitation Link" button shows instead. This is expected.

Countdown reaching zero shows "Today is the day ♥". To preview it, temporarily set `weddingStart` to a past date.

## 8. Publish on GitHub Pages (free)

1. Create a free account at github.com and click **New repository**. Name it, for example, `wedding-invitation`. Choose **Public**.
2. Click **uploading an existing file**, drag in everything inside the project folder (`index.html`, `style.css`, `script.js`, `data.js`, `favicon.svg`, `README.md` and the `assets` folder). `index.html` must be at the top level of the repository. Click **Commit changes**.
3. Go to **Settings → Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**, Branch to **main** and folder to **/ (root)**, then Save.
4. Wait about a minute. Your link will be `https://YOUR-USERNAME.github.io/wedding-invitation/`.
5. Optional: paste that link into `inviteUrl` in `data.js` so sharing always uses the clean address.

## 9. Update the live website

1. Edit `data.js` (or any file) on your computer.
2. In your repository click the file, then the pencil icon (or **Add file → Upload files** to replace it), paste or upload, and click **Commit changes**.
3. GitHub republishes automatically within a minute or two. If you still see the old version, hard-refresh (Ctrl+Shift+R, or clear the WhatsApp/browser cache).

## Fonts

The site loads two free Google Fonts (Cormorant Garamond and Pinyon Script). Without internet it falls back to system serif and script fonts and still works. To self-host, download the fonts, put the files in `assets/fonts/`, and add `@font-face` rules at the top of `style.css`.

## Music

Off by default and never autoplays. A commented placeholder near the bottom of `index.html` shows where to add your own audio file later.

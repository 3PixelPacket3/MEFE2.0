# MEFE — AI Wardrobe & Mood Studio 🌿✨

> **Mindful Fashion & Emotional Well-being Application**  
> Built with React (TypeScript), Tailwind CSS, Google AI Studio (Gemini Pro), Firebase (Auth, Firestore, Storage), Web Speech API, and Progressive Web App (PWA) standards. Ready to host on **GitHub Pages**.

---

## 🎨 Color Scheme & Design Architecture
- **Primary:** Terracotta Red (`#E2725B`)
- **Secondary:** Cocoa Brown (`#3C2F2F`)
- **Backgrounds:** Warm Beige (`#FAF6F0`) & Off-White
- **Mobile Experience:** Sticky 5-icon bottom navigation (Social, Closet, Outfits, Journal, Menu)
- **Desktop Experience:** Left-sided vertical navigation menu (Facebook/Twitter layout) with single-column constrained central feed

---

## 🌟 Core Features & Modules

### 1. My Closet
- **Image Upload:** Upload garment photos or choose presets.
- **Metadata Management:** Item name, category (tops, bottoms, dresses, outerwear, shoes, accessories), colors, use cases, and emotional tags.
- **Interactive Ribbon:** Horizontally scrolling category pills and emotional vibe filters.
- **Garment Detail Overlay:** View wear count, last-worn dates, and a **"Shop Similar"** button triggering partner retailers.

### 2. Outfits & Calendar
- **Interactive Staging Canvas (Builder):** Drag/tap closet items into a styled ensemble, assign emotional targets (e.g., *"Executive Power Thursday"*), and schedule for upcoming calendar dates.
- **Wardrobe Calendar:** Monthly grid tracking planned looks per date with a quick assignment drawer.
- **Floating Action Button (FAB):** One-tap launch for the 90s Clueless Avatar Studio.

### 3. The "Clueless" Avatar Studio 👗🎙️
- **2D Layered HTML5 Canvas:** Cher Horowitz-inspired virtual fitting room. Custom mannequin base with adjustable skin tones and hair styles.
- **Live Garment Layering:** Tap tops, bottoms, dresses, jackets, and accessories from the wardrobe rack to layer them directly onto the avatar.
- **Google AI Studio Dialogue:** Generates witty, high-fashion 90s Cher remarks tailored to the chosen combination.
- **Web Speech API:** Synthesizes the AI script aloud with browser Text-to-Speech audio.
- **Export to Lookbook:** Save composite looks directly to the Outfits collection.

### 4. Daily Mood Journal
- **1–10 Mood Slider:** Fluid gradient slider (Cocoa to Terracotta) reflecting emotional states.
- **Outfit Tagging:** Link what outfit was worn that day to track psychological impact.
- **Emotion Chips:** Multi-select feelings (`#confident`, `#grounded`, `#radiant`, etc.).
- **Mindful Reflections:** Free-form journaling feeding into the Gemini AI pattern engine.
- **Celebration Confetti:** Instant positive feedback upon logging.

### 5. AI Insights (Google AI Studio Brain) 🧠
- **Power Color Hero:** Discovers statistically correlated colors that elevate your mood ratings.
- **Top Mood-Boosting Ensemble:** Highlights outfits linked with peak confidence.
- **Gemini Pro Narrative:** Plain-English synthesis of mood and fashion patterns (e.g., *"MEFE noticed your confidence peaks on Thursdays when wearing warm tones like your Vintage Terracotta Blazer..."*).
- **Category Correlation Charts:** Interactive visual data matching mean mood ratings across wardrobe silhouettes.

### 6. Social Feed (Community Style)
- **Vertical Feed:** Instagram-style feed with user avatars, full-width look photos, captions, and sync tags.
- **Interactive Likes & Comments:** Terracotta heart liking and sliding comments drawer.
- **"Shop This Look":** Directly searches partner retailers for items featured in the post.

### 7. Search & Retailer Drawer ("Shop the Look")
- **Global Search:** Instant live filtering across your wardrobe and social feed.
- **Dynamic Retailers:** Curated list of partner stores (Nordstrom, ASOS, Zara, Reformation, Everlane) with dynamic `{query}` and `{affiliateId}` URL replacement.

### 8. Executive Admin Dashboard 🛡️
- **Firebase Custom Claims:** Automatically surfaces the dashboard when `admin: true`.
- **User Moderation:** Search users, grant Pro tier, mute accounts (with durations), or ban accounts.
- **Retailer Manager:** Add, edit, or delete partner stores in real time.
- **Single-Line HTML/CSS Embed Generator:** Generates self-contained embed code in a single continuous line (no line breaks) with `target='_blank'` for all CTAs.
- **Audit Trail:** Immutable record of administrative interventions.

### 9. Localization (i18n)
- **Instant Language Toggling:** Switch smoothly between **English (EN)**, **French (FR)**, and **Spanish (ES)** without page reload.

### 10. Progressive Web App (PWA)
- Offline caching via Service Worker (`public/sw.js`).
- Installable on mobile home screens (Android & iOS) and desktop.
- Custom Terracotta SVG App Icon & `manifest.json`.

---

## 🚀 Hosting on GitHub Pages

1. **Push this repository to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MEFE AI Wardrobe & Mood Studio"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - In your repository on GitHub, navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, choose **GitHub Actions**.
   - The included workflow `.github/workflows/deploy.yml` will automatically build and publish your app!

---

## 🔑 Firebase & Gemini Configuration

- **Out of the box:** MEFE comes pre-seeded with beautiful wardrobe pieces, outfits, journal entries, and social posts.
- **Google AI Studio (Gemini):**
  1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
  2. Open the in-app **Settings** (gear icon) and paste your key under **Google AI Studio API Key**.
- **Firebase Cloud Sync (Optional):**
  1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com).
  2. Enter your project credentials in **Settings** or specify them in `.env`.
  3. Deploy the included `firestore.rules` and `firestore.indexes.json`:
     ```bash
     firebase deploy --only firestore:rules,firestore:indexes
     ```

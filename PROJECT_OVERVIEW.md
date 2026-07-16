# 🖥️ Nischal Bhandari — Portfolio Project Overview

> A fully interactive **Windows XP–themed personal portfolio** built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, and Framer Motion. Every section of the portfolio is presented as a draggable, resizable OS window — complete with a boot screen, login screen, taskbar, start menu, screensaver, wallpaper picker, sound effects, and 17 unique windows.

---

## 📋 Table of Contents

1. [Project Identity](#1-project-identity)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Application Flow](#4-application-flow)
5. [Core Architecture](#5-core-architecture)
6. [Window System](#6-window-system)
7. [All Windows — Feature Inventory](#7-all-windows--feature-inventory)
8. [Desktop & UI Features](#8-desktop--ui-features)
9. [Sound System](#9-sound-system)
10. [Data Layer](#10-data-layer)
11. [API](#11-api)
12. [SEO & Metadata](#12-seo--metadata)
13. [Keyboard Shortcuts](#13-keyboard-shortcuts)
14. [Known Issues & Gaps](#14-known-issues--gaps)
15. [Recommended Improvements](#15-recommended-improvements)
16. [Deployment Notes](#16-deployment-notes)

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Owner** | Nischal Bhandari |
| **Role** | IT Graduate, Full Stack Developer, German Language Instructor |
| **Location** | Pokhara, Nepal |
| **Site URL** | https://nischalbhandari9825.com.np |
| **GitHub** | https://github.com/Nischal00 |
| **LinkedIn** | https://linkedin.com/in/nischal-bhandari-708b712a3 |
| **Email** | nischalbhandari11@gmail.com |
| **Concept** | Windows XP desktop emulator as an interactive portfolio |

---

## 2. Tech Stack

| Category | Technology | Version |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.1.7 |
| **Language** | TypeScript | ^5 |
| **UI Library** | React | 19.2.3 |
| **Animations** | Framer Motion | ^12.38.0 |
| **Styling** | Tailwind CSS | ^4 |
| **Audio** | Web Audio API (native, no library) | — |
| **State** | React `useReducer` + Context API | — |
| **Persistence** | `sessionStorage` (window layout) + `localStorage` (wallpaper) | — |
| **API** | Next.js Route Handler (`/api/contact`) | — |
| **Fonts** | Tahoma / Arial (system fonts, no Google Fonts) | — |
| **Lint** | ESLint + eslint-config-next | ^9 |

> **No external UI component libraries** — every visual element (windows, taskbar, menus, dialogs) is hand-built.

---

## 3. Project Structure

```
nischal-portfolio/
├── public/
│   ├── wallpapers/
│   │   └── gurucool-logic-imagination.png   # Custom wallpaper artwork
│   └── *.svg                                # Default Next.js assets (unused)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout — metadata, JSON-LD, viewport
│   │   ├── page.tsx            # Entry point — boot → login → desktop phases
│   │   ├── globals.css         # Global styles, CSS animations (float-cloud, etc.)
│   │   ├── favicon.ico
│   │   ├── icon.svg
│   │   ├── robots.ts           # robots.txt generation
│   │   ├── sitemap.ts          # sitemap.xml generation
│   │   └── api/
│   │       └── contact/
│   │           └── route.ts    # POST /api/contact — validation + rate limiting
│   │
│   ├── components/
│   │   ├── XPWindow.tsx        # ⭐ Core reusable window shell (drag, resize, minimize, maximize, close)
│   │   ├── Desktop.tsx         # ⭐ Desktop orchestrator — wallpaper, clouds, context menu, all windows
│   │   ├── DesktopIcons.tsx    # Clickable desktop icon grid
│   │   ├── Taskbar.tsx         # ⭐ Taskbar — START button, open windows list, system tray, clock
│   │   ├── BootScreen.tsx      # Windows XP boot animation (loading bar + flag logo)
│   │   ├── LoginScreen.tsx     # Login screen with username/avatar
│   │   ├── Screensaver.tsx     # Idle screensaver (auto-triggers after inactivity)
│   │   ├── BalloonNotification.tsx  # System tray pop-up notifications
│   │   ├── AltTabSwitcher.tsx  # Alt+Tab window switcher overlay
│   │   ├── GlitchText.tsx      # Animated glitch text effect
│   │   ├── ErrorBoundary.tsx   # React error boundary wrapping every window
│   │   │
│   │   └── windows/            # Individual window content (17 total)
│   │       ├── AboutWindow.tsx         # System Properties — bio, career, skills tabs
│   │       ├── ExperienceWindow.tsx    # Work history with expandable job cards
│   │       ├── SkillsWindow.tsx        # Skill bars + soft skills + languages
│   │       ├── EducationWindow.tsx     # Academic background
│   │       ├── ProjectsWindow.tsx      # File-manager view of projects
│   │       ├── ContactWindow.tsx       # Outlook-style email compose form
│   │       ├── CmdWindow.tsx           # Fully functional CMD terminal
│   │       ├── CertsWindow.tsx         # Certifications display wall
│   │       ├── RadarWindow.tsx         # SVG skill radar/spider chart
│   │       ├── TimelineWindow.tsx      # Career tech-evolution timeline
│   │       ├── RateCardWindow.tsx      # Services & pricing
│   │       ├── SnippetsWindow.tsx      # Syntax-highlighted code snippets
│   │       ├── QuizWindow.tsx          # Interactive German vocabulary quiz game
│   │       ├── ShortcutsWindow.tsx     # Keyboard shortcut reference
│   │       ├── MinesweeperWindow.tsx   # Playable Minesweeper game
│   │       ├── NotepadWindow.tsx       # Editable notepad with save/print
│   │       └── TaskManagerWindow.tsx   # Fake XP Task Manager (processes, performance)
│   │
│   ├── context/
│   │   └── WindowContext.tsx   # ⭐ Global window state — useReducer + Context + sessionStorage
│   │
│   ├── data/
│   │   └── portfolio.ts        # ⭐ Single source of truth for ALL portfolio content
│   │
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces — WindowId, WindowState, JobData, etc.
│   │
│   └── utils/
│       └── sounds.ts           # Web Audio API sound engine (8 sound effects)
```

---

## 4. Application Flow

```
Browser Visit
     │
     ▼
page.tsx  ──── sessionStorage check ──── returning visitor?
     │                                        │
     │ first visit                            │ yes
     ▼                                        ▼
BootScreen                              LoginScreen
(XP boot animation ~5s)                     │
     │                                        │
     └──────────────┬─────────────────────────┘
                    │ onLogin()
                    ▼
              Desktop (main app)
                    │
                    ├── Auto-opens "About" window after 400ms
                    ├── Plays startup chime after 600ms
                    ├── Shows balloon notification
                    └── User interacts with 17 windows freely
```

---

## 5. Core Architecture

### 5.1 Window State Management — `WindowContext.tsx`

The entire window system is driven by a single **`useReducer`** store exposed via React Context.

**State shape per window (`WindowState`):**
```ts
{
  id: WindowId          // unique identifier
  title: string         // title bar text
  icon: string          // emoji icon
  isOpen: boolean       // visible on desktop?
  isMinimized: boolean  // in taskbar only?
  isMaximized: boolean  // fullscreen?
  zIndex: number        // stacking order
  position: { x, y }   // pixel offset from desktop top-left
  size: { width, height }
  prevPosition?         // saved before maximize
  prevSize?             // saved before maximize
}
```

**Supported actions:**
| Action | Effect |
|---|---|
| `OPEN` | Opens window; auto-maximizes on `width < 768px` |
| `CLOSE` | Closes and adds to recycle bin queue |
| `MINIMIZE` | Hides to taskbar |
| `MAXIMIZE` | Saves position/size, goes fullscreen |
| `RESTORE` | Returns to saved position/size |
| `FOCUS` | Increments global `zCounter`, brings to front |
| `MOVE` | Updates `position` (called during title-bar drag) |
| `RESIZE` | Updates `size` |
| `RESIZE_POSITION` | Updates both (for NW/NE/SW resize handles) |
| `MINIMIZE_ALL` | Minimizes all open windows (Ctrl+D / Show Desktop) |
| `CLOSE_ALL` | Closes everything |
| `HYDRATE` | Restores full state from sessionStorage |

**Persistence strategy:**
- Window layout (positions, open/minimized state) → `sessionStorage` (survives refresh, cleared on tab close)
- Wallpaper selection → `localStorage` (persists across sessions)

**Recycle Bin:**
- Closed windows are pushed to a `recycledIds` queue (max 10)
- Can be restored via `restoreFromRecycle()` or emptied via `emptyRecycleBin()`

**Responsive behavior:**
- A `matchMedia('(max-width: 767px)')` listener auto-maximizes windows on portrait mobile and auto-restores them on landscape/desktop resize

### 5.2 `XPWindow.tsx` — The Window Shell

Every window is wrapped in `XPWindow`, which provides:

| Feature | Implementation |
|---|---|
| **Title bar drag** | `mousedown` + `mousemove` on `document`, `requestAnimationFrame` throttled |
| **Touch drag** | Parallel touch event handlers with the same RAF throttle |
| **8-direction resize** | Corner + edge hit zones, each calls `resizePositionWindow` |
| **Double-click maximize** | Title bar `onDoubleClick` → toggle maximize/restore |
| **Double-tap maximize** | Touch `lastTapRef` with 300ms threshold |
| **Active window highlight** | Blue gradient title bar; inactive windows get a grey gradient |
| **System menu** | Right-click title bar or icon click → Restore / Move / Size / Minimize / Maximize / Close |
| **Sound on open/close** | `playWindowOpen()` / `playWindowClose()` via Web Audio API |
| **Error boundary** | Every window content is wrapped in `<ErrorBoundary>` |
| **Lazy mounting** | Windows are only mounted in the DOM after first open (`mountedWindows` Set in Desktop) |
| **Dynamic import** | All 17 window components use `next/dynamic` with `ssr: false` |

---

## 6. Window System

### 6.1 Window ID Registry

All 17 window IDs are defined in `src/types/index.ts`:

```ts
type WindowId =
  'about' | 'experience' | 'skills' | 'education' | 'contact' | 'projects' |
  'terminal' | 'quiz' | 'radar' | 'timeline' | 'certs' | 'ratecard' |
  'snippets' | 'shortcuts' | 'minesweeper' | 'notepad' | 'taskmanager'
```

### 6.2 Default Window Sizes

| Window | Default Size | Default Position |
|---|---|---|
| about | 420 × 420 | (80, 40) |
| experience | 540 × 380 | (110, 55) |
| skills | 420 × 460 | (130, 70) |
| education | 400 × 380 | (150, 90) |
| contact | 510 × 560 | (100, 50) |
| projects | 520 × 560 | (120, 60) |
| terminal | 540 × 380 | (160, 80) |
| quiz | 440 × 420 | (180, 60) |
| radar | 500 × 500 | (200, 70) |
| timeline | 600 × 460 | (90, 50) |
| certs | 520 × 440 | (140, 65) |
| ratecard | 480 × 500 | (110, 55) |
| snippets | 580 × 480 | (170, 75) |
| shortcuts | 420 × 420 | (220, 90) |
| minesweeper | 320 × 400 | (240, 100) |
| notepad | 480 × 380 | (180, 80) |
| taskmanager | 500 × 440 | (160, 70) |

---

## 7. All Windows — Feature Inventory

### 📁 About (`about`) — *"System Properties"*
- **Three tabs:** General · Career · Skills
- **General tab:** Photo placeholder ("NB"), name, philosophy, location/graduation/availability
- **Career tab:** 6 jobs listed as animated cards with icon, role, company, period
- **Skills tab:** 7 animated skill bars with percentage labels + colored badge pills
- ⚠️ **Duplicate data** — hardcodes its own `careerItems` and `skillItems` arrays instead of importing from `portfolio.ts`

### 📁 Experience (`experience`) — *"My Experience — C:\Work History"*
- Expandable job cards from `jobData` in `portfolio.ts`
- Each card shows icon, role, company, period and expandable duty list
- Animated stagger on entry

### ⚙️ Skills (`skills`) — *"My Skills — System Properties"*
- Technical skill bars sourced from `technicalSkills`
- Soft skills section sourced from `softSkills`
- Languages section sourced from `languages` (with fluency badges)

### 🎓 Education (`education`) — *"Education — Academic Records"*
- Academic history in a styled records format

### 📂 Projects (`projects`) — *"My Projects — File Manager"*
- **Windows Explorer–style toolbar** with fake address bar (`C:\My Documents\Projects`)
- Icon grid view (top) + detail list view (bottom)
- Tech tag pills with color coding by index
- ⚠️ **No GitHub or live demo links** — cards are dead-ends

### ✉️ Contact (`contact`) — *"New Message"* (Outlook-style)
- Outlook Express–inspired compose window
- Pre-filled `TO:` (nischalbhandari11@gmail.com), editable `CC:`, fixed `SUBJECT:`
- Full form: name, email, message with client-side validation
- Social links: GitHub, LinkedIn
- Calls `POST /api/contact` with rate-limiting response handling
- Success overlay with OK confirmation
- ⚠️ **API does not actually deliver the email** — validation passes but message is discarded

### 💻 Terminal (`terminal`) — *"Command Prompt"*
Fully functional CMD emulator with:

| Command | Output |
|---|---|
| `help` | All available commands |
| `whoami` | Bio paragraph |
| `skills` | ASCII skill bars for all technical skills |
| `softskills` | Bullet list |
| `languages` | Language + level table |
| `experience` | All jobs summary |
| `exp <key>` | Single job detail (kaski / searchable / skybase / infomax / ing / dmu) |
| `projects` | All projects list |
| `project <n>` | Single project detail (1–4) |
| `edu` | Academic background |
| `contact` | Opens contact window |
| `open <win>` | Opens any named window |
| `date` | Current date/time |
| `sysinfo` | System info table |
| `neofetch` | Portfolio stats overview (Neofetch-style) |
| `mines` | Opens Minesweeper |
| `notepad` | Opens Notepad |
| `taskmgr` | Opens Task Manager |
| `matrix` | Easter egg |
| `cls` | Clears screen |
| `exit` | Closes window |

- Command history (↑/↓ arrows)
- Typing animation for long outputs
- Monospace green-on-black terminal styling

### 🇩🇪 Quiz (`quiz`) — *"German Quiz — Lernspiel.exe"*
- Interactive multiple-choice vocabulary quiz
- 24 German words across 6 categories (Greetings, Nouns, Verbs, Tech, Concepts, Healthcare)
- Score tracking, streak counter, category filtering

### 📊 Radar (`radar`) — *"Skill Radar — sys_stats.exe"*
- Custom SVG radar/spider chart
- Visualizes technical skills from `technicalSkills` data
- Animated draw-in on open

### 📅 Timeline (`timeline`) — *"Career Timeline — history.log"*
- Horizontal/vertical scrollable career timeline
- Driven by `techEvolution` data (2019–2025)
- Each phase shows year, role, tech stack, color accent

### 🏆 Certs (`certs`) — *"Credentials Wall — certs.msc"*
- Grid of 9 certification cards from `certifications` data
- Category badges (IT, Security, Dev, Language, Business)
- Color-coded by cert type

### 💼 RateCard (`ratecard`) — *"Services & Rates — services.exe"*
- Service offering cards with pricing tiers
- Freelance/contract services overview

### 📝 Snippets (`snippets`) — *"Code Snippets — notepad++.exe"*
- 4 real code samples from portfolio projects:
  - Patient API Router (TypeScript/Express)
  - `useDebounce` Hook (React/TypeScript)
  - Python Network Scanner
  - Angular HTTP Cache Service
- Syntax-highlighted display with language label
- Copy-to-clipboard functionality

### ⌨️ Shortcuts (`shortcuts`) — *"Keyboard Shortcuts — help.exe"*
- Reference table of all `Ctrl+Alt+*` shortcuts
- Window management shortcuts (Alt+F4, Ctrl+D)

### 💣 Minesweeper (`minesweeper`) — *"Minesweeper"*
- Fully playable Minesweeper game
- Classic XP-style UI with mine counter and timer
- Three difficulty levels

### 🗒️ Notepad (`notepad`) — *"Untitled — Notepad"*
- Editable plain-text notepad
- Save to file / print functionality

### 📋 TaskManager (`taskmanager`) — *"Windows Task Manager"*
- Fake XP-style Task Manager
- Tabs: Applications, Processes, Performance, Networking, Users
- Shows all open portfolio windows as "processes"
- CPU/memory performance graphs (animated)

---

## 8. Desktop & UI Features

### 8.1 Boot Screen
- Black screen with Windows XP flag logo (4 colored quadrants)
- Animated loading bar with 8 blue segments cycling × 3 loops
- CRT scanline overlay effect
- Floating blue particles
- Auto-advances to Login Screen after ~5s
- **Session optimization:** Skips boot for returning visitors in the same browser session (checks `sessionStorage`)

### 8.2 Login Screen
- XP-style welcome screen
- Username "Nischal Bhandari" with avatar
- Click-to-login → fades into Desktop

### 8.3 Desktop
- **Wallpaper system** — 6 themes:
  | ID | Name | Style |
  |---|---|---|
  | `bliss` | Bliss | Warm dusk gradient (default) |
  | `luna` | Luna | Classic XP blue sky |
  | `azul` | Azul | Deep navy blues |
  | `autumn` | Autumn | Orange/amber tones |
  | `matrix` | Matrix | Dark green terminal |
  | `gurucool` | GuruCOOL | Custom artwork (PNG from `/public/wallpapers/`) |

- **Animated clouds** — 5 CSS-animated clouds float across (only on non-custom wallpapers)
- **Mountain ridges** — CSS radial-gradient foreground hills (only on gradient wallpapers)
- **Quote Carousel** — 12 dev quotes rotate every 15s at the bottom (isolated `memo` component to prevent Desktop re-renders)
- **Right-click context menu** — Arrange Icons By, Refresh, Open Shortcuts, Open Terminal, Open Task Manager, Personalize, Properties
- **Wallpaper Picker** — Draggable XP-style dialog with preview + 3×2 grid selector
- **Lazy window mounting** — Windows are only added to the DOM once opened (via `mountedWindows` Set + `requestAnimationFrame`)

### 8.4 Taskbar
- **START button** — Green gradient, XP logo, opens Start Menu
- **Start Menu** — Two-panel (left: app list, right: system places) + header with avatar + footer with Log Off / Turn Off
- **Quick Launch** — "Show Desktop" button (minimizes all)
- **Open windows list** — Taskbar buttons per open window; active = sunken style; right-click → Restore/Minimize/Maximize/Close context menu
- **System Tray** — Network 📶, Mute/Unmute 🔊🔇, Power ⚡
- **Clock** — Updates every 10 seconds, shows 12h time + abbreviated date

### 8.5 Screensaver
- Triggers after a period of inactivity
- Click/keypress to dismiss and return to desktop

### 8.6 Alt+Tab Switcher
- `Alt+Tab` keyboard shortcut opens a window-switcher overlay
- Shows icons of all open windows

### 8.7 Balloon Notification
- System tray–style pop-up notification shown on first desktop load

### 8.8 Log Off / Shut Down Dialog
- Animated glassmorphism modal with particle effects
- Blue theme for Log Off, Red theme for Turn Off
- Shimmer stripe, glitch-text title, glow ring behind icon
- Confirmed actions → play sound + call `onLogOff()` → returns to Login Screen

---

## 9. Sound System

All sounds are synthesized in real-time using the **Web Audio API** — no audio files needed.

| Function | Trigger | Description |
|---|---|---|
| `playWindowOpen()` | Window opens | 3 ascending sine tones (C5–G5–G5) |
| `playWindowClose()` | Window closes | 3 descending sine tones |
| `playClick()` | Button/icon clicks | Short 900 Hz square wave tick |
| `playError()` | Form validation fail | Two 220 Hz square beeps |
| `playSuccess()` | Message sent | 4-note ascending chime |
| `playStartupChime()` | Desktop first loads | E4–G4–D5–E5 spaced melody |
| `playLogoff()` | Log Off dialog opens | Soft descending A4→E4→C4 chord |
| `playShutdown()` | Shut Down dialog opens | Low rumble + sawtooth descent |
| `playLogoffConfirm()` | Log off confirmed | 3-note farewell |
| `playShutdownConfirm()` | Shut down confirmed | 6-step power-down sweep |

- Global **mute toggle** in system tray (persisted in module-level variable, not localStorage)
- Audio context lazily created on first interaction (respects browser autoplay policy)
- `AudioContext.resume()` called if suspended

---

## 10. Data Layer

**Single source of truth:** `src/data/portfolio.ts`

All content is exported as typed constants consumed by window components:

| Export | Type | Used By |
|---|---|---|
| `jobData` | `Record<string, JobData>` | ExperienceWindow, CmdWindow |
| `technicalSkills` | `SkillData[]` | SkillsWindow, RadarWindow, CmdWindow |
| `softSkills` | `string[]` | SkillsWindow, CmdWindow |
| `languages` | `{ name, level }[]` | SkillsWindow, CmdWindow |
| `projects` | `ProjectData[]` | ProjectsWindow, CmdWindow |
| `germanWords` | `GermanWord[]` | QuizWindow |
| `techEvolution` | `TechPhase[]` | TimelineWindow |
| `certifications` | `CertData[]` | CertsWindow |
| `codeSnippets` | `CodeSnippet[]` | SnippetsWindow |
| `devQuotes` | `string[]` | Desktop (QuoteCarousel) |

### TypeScript Interfaces

```ts
interface WindowState   { id, title, icon, isOpen, isMinimized, isMaximized, zIndex, position, size, prevPosition?, prevSize? }
interface JobData        { role, company, period, icon, duties[] }
interface SkillData      { name, level }
interface ProjectData    { name, description, tech[], icon }   // ⚠️ Missing: github?, live?
interface GermanWord     { de, en, category }
interface TechPhase      { year, phase, techs[], color }
interface CertData       { name, issuer, year, icon, category, color }
interface CodeSnippet    { title, lang, description, code }
```

---

## 11. API

### `POST /api/contact`

**File:** `src/app/api/contact/route.ts`

**Rate limiting:** In-memory per-IP, max 5 requests per 60 seconds.

**Request body:**
```json
{ "name": "string", "email": "string", "message": "string" }
```

**Validation rules:**
- `name`: required, max 200 chars
- `email`: required, valid format, max 320 chars
- `message`: optional, max 5000 chars

**Responses:**
| Status | Body |
|---|---|
| 200 | `{ success: true, message: "Message received!" }` |
| 400 | `{ error: "..." }` |
| 429 | `{ error: "Too many requests. Please try again later." }` |

> ⚠️ **Critical gap:** The route validates the input and returns success, but **never delivers the message to anyone**. The line `void { name, email, message }` is a no-op. Integration with an email service (Resend, SendGrid, Nodemailer) is required before the contact form is functional.

---

## 12. SEO & Metadata

**File:** `src/app/layout.tsx`

| Property | Value |
|---|---|
| `<title>` | Nischal Bhandari — Full Stack Developer & IT Professional |
| `description` | Windows XP themed portfolio... |
| `keywords` | Nischal Bhandari, Full Stack Developer, IT Professional, JavaScript, Angular, React, Node.js, Python |
| `og:type` | website |
| `og:url` | https://nischalbhandari9825.com.np |
| `og:title` | Nischal Bhandari — Full Stack Developer & IT Professional |
| `twitter:card` | summary_large_image |
| `robots` | index: true, follow: true |
| **JSON-LD** | `@type: Person` with name, jobTitle, url, sameAs (GitHub + LinkedIn) |
| **Viewport** | device-width, max-scale 5, userScalable, viewportFit: cover |

> ⚠️ **Missing:** `og:image` and `twitter:image` — no social preview image is set. Sharing on LinkedIn/WhatsApp will show no preview image.

**Sitemap & Robots:**
- `src/app/sitemap.ts` — generates `/sitemap.xml`
- `src/app/robots.ts` — generates `/robots.txt`
- Both use hardcoded `siteUrl = "https://nischalbhandari9825.com.np"` — must match actual deployed domain.

---

## 13. Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Alt + A` | Open About |
| `Ctrl + Alt + E` | Open Experience |
| `Ctrl + Alt + S` | Open Skills |
| `Ctrl + Alt + P` | Open Projects |
| `Ctrl + Alt + C` | Open Contact |
| `Ctrl + Alt + T` | Open Terminal |
| `Ctrl + Alt + Q` | Open Quiz |
| `Ctrl + Alt + R` | Open Radar |
| `Ctrl + Alt + L` | Open Timeline |
| `Ctrl + Alt + G` | Open Certs |
| `Ctrl + Alt + W` | Open Rate Card |
| `Ctrl + Alt + I` | Open Snippets |
| `Ctrl + Alt + K` | Open Shortcuts |
| `Ctrl + Alt + Delete` | Open Task Manager |
| `Alt + F4` | Close topmost window |
| `Ctrl + D` | Show Desktop (minimize all) |
| `Alt + Tab` | Window switcher overlay |

---

## 14. Known Issues & Gaps

### 🔴 Critical

| # | Issue | Location |
|---|---|---|
| C-1 | **Contact form never delivers messages** — API validates but discards data | `src/app/api/contact/route.ts` line: `void { name, email, message }` |
| C-2 | **Projects have no external links** — no GitHub or live demo URLs | `src/types/index.ts` (`ProjectData`), `src/data/portfolio.ts`, `ProjectsWindow.tsx` |

### 🟠 High

| # | Issue | Location |
|---|---|---|
| H-1 | **No photo** — About window shows "NB" initials placeholder | `AboutWindow.tsx` |
| H-2 | **No resume/CV download** — nowhere to download a PDF resume | Entire app |
| H-3 | **Missing OG/Twitter preview image** — `og:image` and `twitter:image` unset | `src/app/layout.tsx` |

### 🟡 Medium

| # | Issue | Location |
|---|---|---|
| M-1 | **Duplicate data** — `AboutWindow.tsx` hardcodes `careerItems` and `skillItems` instead of importing from `portfolio.ts` | `AboutWindow.tsx` lines ~8–20 |
| M-2 | **Mute not persisted** — toggling mute in system tray resets on refresh | `src/utils/sounds.ts` (`_muted` is module-level) |
| M-3 | **"Arrange Icons By" context menu item does nothing** | `Desktop.tsx` `ctxItems` array |
| M-4 | **Clock updates every 10 seconds** — could drift visibly | `Taskbar.tsx` `setInterval(update, 10000)` |
| M-5 | **Mobile UX is limited** — draggable windows on small screens are awkward | `XPWindow.tsx`, `Desktop.tsx` |

### 🟢 Low

| # | Issue | Location |
|---|---|---|
| L-1 | **No ARIA roles on desktop icons** | `DesktopIcons.tsx` |
| L-2 | **Menu bar items are decorative only** — clicking File/Edit/View does nothing | `XPWindow.tsx` menu bar |
| L-3 | **public/ folder has unused default Next.js SVGs** | `public/*.svg` |
| L-4 | **`techEvolution` `2025` phase lists "Tailwind v4"** — but package.json confirms v4 is already in use, so phase label could be "Current" | `portfolio.ts` |

---

## 15. Recommended Improvements

### Priority 1 — Fix Functional Gaps

```
1. Integrate email delivery in /api/contact
   → Use Resend (free tier: 100 emails/day)
   → npm install resend
   → Replace void {...} with: await resend.emails.send({...})

2. Add github/live fields to ProjectData type + portfolio.ts
   → Show as icon-link buttons in ProjectsWindow footer
   → Show as links in CmdWindow 'project <n>' output

3. Add a real headshot to AboutWindow
   → Place photo in /public/avatar.jpg
   → Replace the "NB" gradient box with <Image>

4. Add CV download
   → Place PDF at /public/nischal-bhandari-cv.pdf
   → Add a "Download CV" button to AboutWindow General tab
   → Add a "📄 Download CV" item to the Start Menu right panel
```

### Priority 2 — Content & Polish

```
5. Fix duplicate data in AboutWindow
   → Import jobData from '@/data/portfolio'
   → Import technicalSkills from '@/data/portfolio'

6. Add og:image + twitter:image (1200×630px)
   → Place image at /public/og-preview.png
   → Add to layout.tsx metadata object

7. Persist mute preference to localStorage
   → Load in Taskbar useEffect
   → Save in toggleMute()

8. Fix clock to update every second (or at minimum every minute)
   → Change setInterval(update, 10000) → setInterval(update, 1000)

9. Expand Terminal commands
   → 'resume' → download CV PDF
   → 'github' → window.open(...)
   → 'linkedin' → window.open(...)
   → 'clear' as alias for 'cls'
```

### Priority 3 — UX Enhancements

```
10. Mobile layout improvement
    → Below 480px: render a card-scroll view instead of the desktop
    → Or: add a mobile nav bar with window launcher buttons

11. Desktop icons — right-click context menu per icon
    → "Open", "Rename" (cosmetic), "Delete" (sends to recycle bin)

12. Recycle Bin desktop icon
    → Show recycled window count as badge
    → Double-click to restore last closed window

13. Remove or implement "Arrange Icons By" context menu item

14. Add a proper 404 page (not-found.tsx exists but may be plain)
```

---

## 16. Deployment Notes

| Setting | Value |
|---|---|
| **Target domain** | https://nischalbhandari9825.com.np |
| **Recommended host** | Vercel (zero-config Next.js support) |
| **Build command** | `npm run build` |
| **Start command** | `npm start --hostname 0.0.0.0` |
| **Dev command** | `npm run dev` (binds to `0.0.0.0`) |
| **Node.js** | ≥ 18 recommended (Next.js 16 requirement) |

**Environment variables needed before production:**

```env
# For contact form email delivery (example with Resend):
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
CONTACT_TO_EMAIL=nischalbhandari11@gmail.com
```

**Pre-deploy checklist:**
- [ ] Verify `siteUrl` in `layout.tsx`, `sitemap.ts`, `robots.ts` matches live domain
- [ ] Add `og:image` (`/public/og-preview.png`)
- [ ] Add real headshot (`/public/avatar.jpg`)
- [ ] Add CV PDF (`/public/nischal-bhandari-cv.pdf`)
- [ ] Wire up email delivery in `/api/contact`
- [ ] Add project GitHub/live links to `portfolio.ts`
- [ ] Remove unused default Next.js SVGs from `public/`
- [ ] Test on mobile (portrait + landscape)
- [ ] Test with sound muted and unmuted
- [ ] Verify all 17 windows open, render, and close without errors

---

*Last updated: May 2026 — Generated from full source review.*

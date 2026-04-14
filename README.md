# Nischal Portfolio

An interactive Windows XP-style portfolio built with Next.js, React, TypeScript, Tailwind CSS v4, and Framer Motion.

The site recreates an old-school desktop flow with a boot screen, login screen, draggable windows, system sounds, themed wallpapers, and multiple mini-apps that present portfolio content in a playful but still usable way.

Live site: [nischalbhandari.com.np](https://nischalbhandari.com.np)

## Highlights

- Windows XP-inspired boot, login, and desktop flow
- Draggable, focusable, minimizable, and maximizable desktop windows
- Portfolio content split into native-feeling apps instead of a standard scroll page
- Built-in mini experiences including command prompt, German quiz, radar chart, timeline, snippets, Minesweeper, notepad, and task manager
- Wallpaper picker with persistent selection
- Session-based restoration of desktop window state
- Web Audio API sound effects with taskbar mute control
- Responsive behavior that switches open windows to maximized mode on smaller screens
- Contact form API with server-side validation and basic rate limiting
- Security headers configured in Next.js

## Included Windows

- System Properties / About
- Experience
- Skills
- Education
- Projects
- Contact
- Command Prompt
- German Quiz
- Skill Radar
- Career Timeline
- Credentials
- Services and Rates
- Code Snippets
- Keyboard Shortcuts
- Minesweeper
- Notepad
- Task Manager

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS v4
- Framer Motion
- Web Audio API

## Getting Started

### Prerequisites

- Node.js 20 or newer recommended
- npm

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

The development server binds to `0.0.0.0`. Open `http://localhost:3000` in your browser.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

- `npm run dev`: start the local development server
- `npm run build`: create the production build
- `npm run start`: run the production server
- `npm run lint`: run ESLint

## Interaction Guide

- Click the login card to enter the desktop
- Open apps from desktop icons, the Start menu, the taskbar, or the desktop context menu
- Right-click the desktop to open the XP-style context menu
- Use `Personalize...` from the desktop context menu to change the wallpaper
- Use the taskbar speaker button to mute or unmute generated system sounds

## Keyboard Shortcuts

These shortcuts are implemented in the app today:

| Shortcut | Action |
| --- | --- |
| `Alt + Tab` | Cycle through open windows |
| `Alt + F4` | Close the topmost active window |
| `Ctrl + D` | Minimize all open windows |
| `Ctrl + Alt + Delete` | Open Task Manager |
| `Ctrl + Alt + A` | Open About / System Properties |
| `Ctrl + Alt + E` | Open Experience |
| `Ctrl + Alt + S` | Open Skills |
| `Ctrl + Alt + P` | Open Projects |
| `Ctrl + Alt + C` | Open Contact |
| `Ctrl + Alt + T` | Open Command Prompt |
| `Ctrl + Alt + Q` | Open German Quiz |
| `Ctrl + Alt + R` | Open Skill Radar |
| `Ctrl + Alt + L` | Open Career Timeline |
| `Ctrl + Alt + G` | Open Credentials |
| `Ctrl + Alt + W` | Open Services and Rates |
| `Ctrl + Alt + I` | Open Code Snippets |
| `Ctrl + Alt + K` | Open Keyboard Shortcuts |

## How the Experience Works

- First-time visitors land on a boot sequence before the login screen
- Returning visitors skip the boot screen for the current browser session
- Opening, moving, resizing, minimizing, and restoring windows is managed through a shared window context
- Open window state is saved in `sessionStorage`
- Wallpaper choice is saved in `localStorage`
- Startup, click, open/close, logoff, and shutdown sounds are generated with the Web Audio API

## Persistence Model

- `sessionStorage` stores whether the visitor has already seen the boot screen during the current browser session
- `sessionStorage` also stores open window state, positions, sizes, minimization, and z-index ordering
- `localStorage` stores the selected wallpaper under `nischal-wallpaper`
- The in-memory contact rate limiter is not persistent and resets when the server restarts

## Content and Customization

Most portfolio content and configuration live in a small number of files:

- `src/data/portfolio.ts`: jobs, skills, projects, certifications, quiz data, timeline data, quotes, and code snippets
- `src/app/layout.tsx`: site metadata, Open Graph metadata, Twitter metadata, and JSON-LD
- `src/components/Desktop.tsx`: wallpaper definitions, desktop context menu, auto-open behavior, and window mounting
- `src/context/WindowContext.tsx`: window lifecycle, z-index handling, persistence, and mobile maximization behavior
- `src/components/windows/ContactWindow.tsx`: contact form UI and external profile links
- `src/app/api/contact/route.ts`: request validation and rate limiting for contact submissions
- `public/wallpapers`: custom wallpaper assets

## Contact API Notes

The contact form endpoint is intentionally lightweight right now.

- `POST /api/contact` validates `name`, `email`, and `message`
- Requests are rate limited in memory to 5 submissions per minute per IP
- The limiter resets when the server restarts
- The endpoint currently returns success but does not send email or store messages

If you want production-ready contact delivery, replace the placeholder logic in `src/app/api/contact/route.ts` with a mail or persistence provider such as Resend, SendGrid, Postmark, or a database-backed queue.

## Environment Variables

No environment variables are required for the project in its current state.

If you connect the contact form to a real mail service or backend, add the provider-specific variables before deploying.

## Security

The app sets several security-oriented headers in `next.config.ts`, including:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`

## Browser Support

The portfolio is built for modern browsers with support for:

- React and Next.js client-side rendering
- `sessionStorage` and `localStorage`
- `AudioContext` for system sounds
- CSS transforms and animations used by the desktop UI

The best experience is on desktop or laptop screens. On narrow screens, open windows automatically switch to maximized mode.

## Project Structure

```text
src/
	app/
		api/contact/route.ts
		layout.tsx
		page.tsx
	components/
		windows/
	context/
		WindowContext.tsx
	data/
		portfolio.ts
	utils/
		sounds.ts
public/
	wallpapers/
```

## Deployment

This project is suitable for deployment on Vercel or any Node.js host that supports Next.js.

Production commands:

```bash
npm run build
npm run start
```

Deployment notes for the current implementation:

- The contact rate limiter reads the client IP from `x-forwarded-for`, so keep that header intact if you deploy behind a proxy or CDN
- The current limiter is process-local; if you deploy multiple instances, replace it with a shared store such as Redis
- The app sets HSTS, so production should be served over HTTPS

## Known Limitations

- The contact form is a validated demo endpoint, not a complete messaging pipeline
- Rate limiting is in-memory only and is not shared across instances
- Some of the XP-style experience depends on browser APIs such as `sessionStorage`, `localStorage`, and `AudioContext`

## Author

Nischal Bhandari

- GitHub: [Nischal00](https://github.com/Nischal00)
- LinkedIn: [nischal-bhandari-708b712a3](https://www.linkedin.com/in/nischal-bhandari-708b712a3/)

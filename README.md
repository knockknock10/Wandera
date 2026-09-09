# Project Air — WanderLust

A Wanderlust-style vacation / property listing platform where users can discover and share places to stay around the world. Built with the Node.js + Express + EJS + MongoDB (Mongoose) stack with Passport authentication, Cloudinary image hosting, and Google Maps integration.

> **Note:** This is an educational / portfolio project implementation.

## Features

- Browse, search, and share vacation listings (search matches title, location, and country)
- User signup / login / logout with Passport (local strategy) and session persistence
- Listing owners can create, edit, and delete **their own** listings (server-side authorization)
- Image uploads to Cloudinary with file-type, size, and content validation
- Reviews with star ratings — authors can delete their own reviews
- Interactive Google Maps on listing detail pages, with graceful fallback when no API key is configured
- Flash messages, rate limiting, security headers (helmet), and responsive Bootstrap UI
- Static pages: Privacy, Terms, Contact

## Tech Stack

- **Backend:** Node.js, Express 5
- **Database:** MongoDB via Mongoose (8.x) — local or Atlas
- **Templating:** EJS + ejs-mate layouts
- **Auth:** Passport + passport-local-mongoose, express-session with MongoStore
- **Uploads:** Multer + multer-storage-cloudinary → Cloudinary
- **Validation:** Joi (server-side)
- **Maps:** Google Maps JavaScript API
- **Security:** Helmet, express-rate-limit
- **Frontend:** Bootstrap 5, vanilla JavaScript, custom CSS

## Architecture

The application is a classic server-rendered MVC app:

```
Client (browser)
   │  GET/POST forms
   ▼
Express (app.js)
   │
   ├── Middleware: helmet → rate limits → session → passport → locals → flash
   ├── Routers: /listings, /listings/:id/reviews, /users, /static
   │
   ├── Controllers (controllers/)
   │     ├── listings.js / review.js / users.js
   │
   ├── Models (models/)
   │     ├── listing.js / review.js / user.js
   │
   ├── Validation (schema.js — Joi)
   │
   └── Views (views/) — EJS templates with ejs-mate layouts
```

### Request flow example

```
GET /listings/:id
  → routes/listing.js
  → controllers/listings.js → showListing()
  → Listing.findById(...).populate("reviews").populate("owner")
  → views/listings/show.ejs (rendered with layout boilerplate.ejs)
```

## Project Structure

```
.
├── app.js                 # Express app entry point
├── cloudconfig.js         # Cloudinary + multer storage setup
├── middleware.js          # Auth/authorization/validation middleware
├── schema.js              # Joi validation schemas
├── controllers/           # Route handlers (listings, review, users)
├── models/                # Mongoose models (listing, review, user)
├── routes/                # Express routers (listing, reviews, user, static)
├── utils/                 # ExpressError class + wrapAsync helper
├── init/                  # Local dev seed script (never runs in production)
├── public/                # Static assets (css, js, images)
└── views/                 # EJS templates (layouts, includes, listings, users, static)
```

## Prerequisites

- Node.js 20+
- npm
- A MongoDB instance — local (`mongodb://127.0.0.1:27017/wanderlust`) or Atlas

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `ATLASTDB_URL` | Yes | MongoDB connection string. Local default: `mongodb://127.0.0.1:27017/wanderlust` |
| `SECRET` | Yes | Strong, random session secret. Generate with `openssl rand -base64 32` |
| `CLOUD_NAME` | Yes* | Cloudinary cloud name (needed for uploads) |
| `CLOUD_API_KEY` | Yes* | Cloudinary API key |
| `CLOUD_API_SECRET_KEY` | Yes* | Cloudinary API secret |
| `GOOGLE_MAPS_API_KEY` | No | Google Maps JavaScript API key (enables embedded maps) |
| `PORT` | No | Server port (defaults to `8080`) |

\* Required for image uploads. The app still starts without them.

> **Never** commit `.env` or share these values. `.env` is git-ignored.

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#  → fill in the required values (see table above)

# 3. Start MongoDB (if local)
mongod

# 4. Run the app
npm start        # production mode
npm run dev      # development mode (nodemon)
```

The app runs at `http://localhost:8080`.

## Database Setup

The app connects automatically on start using `ATLASTDB_URL` (or the local default).

To load the sample listings into your **local** database:

```bash
node init/index.js
```

This script assigns all seeded listings to the user whose ObjectId is set as `ADMIN_ID` in `.env`. It **refuses to run when `NODE_ENV=production`** and is strictly a development tool.

## Cloudinary Setup

1. Create a free account at <https://cloudinary.com>.
2. Copy your **Cloud Name**, **API Key**, and **API Secret** into `.env`.
3. Images are stored in the `proj_dev` folder of your Cloudinary account.
4. When a listing is deleted, its Cloudinary image is removed automatically.

Allowed upload types: `png`, `jpg`, `jpeg`, `webp`, `gif`. Maximum file size: 5 MB.

## Google Maps Setup

1. In <https://console.cloud.google.com>, create a project and enable the **Maps JavaScript API** and **Geocoding API**.
2. Create an API key and put it in `.env` as `GOOGLE_MAPS_API_KEY`.
3. **Restrict the key by HTTP referrer** to your domains (e.g., `http://localhost:8080/*`, `https://your-app.onrender.com/*`). The key is exposed to browsers, so referrer restrictions are required.
4. If no key is configured, the map area shows a graceful "Map is unavailable" message instead of crashing.

## Authentication

- Users register with username, email, and password (Passport + passport-local-mongoose, salted & hashed storage).
- Logged-in users can create listings and review others' listings.
- Listing edit/delete is restricted to the listing owner; review deletion is restricted to the review author.
- All authorization is enforced **server-side** in `middleware.js` — hidden buttons alone are not relied upon.

## Deployment

### Render Configuration

The project includes a `render.yaml`, so you can deploy directly:

1. Push the repository to GitHub.
2. In Render, create a **new Web Service** and connect the repo — Render will pick up `render.yaml`.
   - Or, when configuring manually:
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
3. Add the environment variables from the table above in the Render dashboard (never in `render.yaml`). At minimum: `ATLASTDB_URL`, `SECRET`, `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET_KEY`. `GOOGLE_MAPS_API_KEY` is optional.
4. Make sure `NODE_ENV=production` is set so secure cookies behave correctly behind HTTPS. Render also injects `PORT` — the app picks it up automatically.
5. The health check is configured at `/listings` (public, returns 200).

### Security notes for production

- The session cookie is `httpOnly` and `SameSite=Lax`; it is flagged `Secure` when `NODE_ENV=production` (i.e., served over HTTPS).
- Helmet sets security headers (CSP is disabled because the views use inline scripts/styles — a documented trade-off of the current template approach).
- Rate limiting keeps a 15-minute window on both global and auth routes.

## Known Limitations

- Category filter chips are not implemented (a search bar and a GST toggle are used instead). Adding category support would require a `category` field plus data backfill.
- CSRF tokens are not used; Cross-Site Request Forgery risk is mitigated via `SameSite=Lax` cookies, `httpOnly` session cookies, and POST-only state changes (logout is POST).
- The seeded sample listings link to Unsplash images (not Cloudinary); only user-uploaded images are removed on delete (including when replaced on edit).

## Future Improvements

- Category-based filtering with a `category` field on the Listing model
- Explicit CSRF tokens (e.g., `csrf-csrf`) on all state-changing forms
- Pagination for the listings index
- Email verification and password reset
- Accessibility pass and CSP re-enablement using hashes/nonces for inline scripts
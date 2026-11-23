# Daymark — JavaScript Intermediate Task 4

Daymark is a responsive suite of four small applications built with HTML, CSS, vanilla JavaScript, Express, Mongoose, and MongoDB.

## Applications

- **Bookmark Library** — CRUD bookmarks, tags, search, and keyboard shortcuts.
- **Mood Journal** — daily 1–5 check-ins, notes, editing, deletion, mood filters, and date sorting.
- **Breathing Room** — configurable inhale/hold/exhale state machine with start, pause, reset, animation, and Spacebar control.
- **Idea Studio** — CRUD content ideas with type and status filters.

Bookmarks, mood entries, and content ideas use MongoDB. The breathing timer deliberately keeps its state in memory and does not use the database.

## Setup

1. Install Node.js 18 or newer and make sure MongoDB is available.
2. Install packages:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env`.
4. Put your MongoDB connection string in `.env`:

   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/task4_suite
   ```

   For MongoDB Atlas, use the `mongodb+srv://...` connection string supplied by Atlas instead.

5. Start the project:

   ```bash
   npm run dev
   ```

6. Visit [http://localhost:3000](http://localhost:3000).

## Keyboard shortcuts

- Bookmark Library: `/` focuses search, `Ctrl+Enter` saves the form, and `Escape` cancels editing.
- Breathing Room: `Space` starts or pauses the timer when focus is not inside a control.

## API routes

| Resource | Routes |
| --- | --- |
| Health | `GET /api/health` |
| Bookmarks | `GET/POST /api/bookmarks`, `PUT/DELETE /api/bookmarks/:id` |
| Moods | `GET/POST /api/moods`, `PUT/DELETE /api/moods/:id` |
| Ideas | `GET/POST /api/ideas`, `PUT/DELETE /api/ideas/:id` |

## Suggested recording checklist

Record one short video for each application. Demonstrate adding, editing, deleting, filtering/searching, keyboard shortcuts, responsive layout, and data persistence after a refresh where applicable.

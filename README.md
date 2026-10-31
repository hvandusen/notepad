# notepad

One shared notepad. Everyone on the page edits the same text live. At midnight (in `TIMEZONE`) it starts fresh, and each day's note is kept.

- `/` — today's notepad
- `/archive` — every past day
- `/archive/YYYY-MM-DD` — one day's note, read-only

Notes are saved as `data/notes/YYYY-MM-DD.html`.

## Run

```sh
npm install
cp .env.example .env   # set PORT
npm start
```

## Pulling the old notes off MongoDB Atlas

Run this once, on the server (so the notes land in its `data/notes/`) or locally:

```sh
MONGO_URI='mongodb+srv://USER:PASSWORD@hankscluster-dtp7l.mongodb.net/' npm run export-atlas
```

It also writes everything raw to `data/atlas-backup.json`. The old app saved notes under names like `Tue-Oct-31` with no year, so the year comes from each note's last-edited time. If the same weekday and date came around in two different years, the later year overwrote the earlier one in Atlas, so those older notes are gone.

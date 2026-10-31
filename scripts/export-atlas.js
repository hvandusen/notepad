// One-time export of the old MongoDB Atlas notes into data/notes/, so they
// show up at /archive. Also saves a raw JSON backup of everything.
//
//   npm install
//   MONGO_URI='mongodb+srv://USER:PASSWORD@hankscluster-dtp7l.mongodb.net/' npm run export-atlas
//
// The old app keyed notes by "Tue-Oct-31" (no year), so the year comes from
// the `actual` timestamp: the last time that day's note was edited.

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const notes = require('../lib/notes');

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('Set MONGO_URI first (see .env.example).');
  process.exit(1);
}

(async () => {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  const docs = await client.db('notepad').collection('notepad').find().toArray();
  await client.close();

  const backup = path.join(__dirname, '..', 'data', 'atlas-backup.json');
  fs.mkdirSync(path.dirname(backup), { recursive: true });
  fs.writeFileSync(backup, JSON.stringify(docs, null, 2));
  console.log(`saved ${docs.length} raw documents to ${backup}`);

  let written = 0, skipped = 0;
  for (const doc of docs) {
    if (notes.isEmpty(doc.html)) { skipped++; continue; }
    if (!doc.actual) {
      console.log(`no timestamp for ${doc.dateId}; it's only in the JSON backup`);
      skipped++;
      continue;
    }
    const date = notes.dateId(new Date(doc.actual));
    const existing = notes.read(date);
    if (existing !== null && existing !== doc.html) {
      console.log(`${date} already has a different note; leaving it alone`);
      skipped++;
      continue;
    }
    notes.write(date, doc.html);
    written++;
  }
  console.log(`wrote ${written} notes to data/notes/ (${skipped} empty or skipped)`);
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

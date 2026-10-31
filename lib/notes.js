// Notes are stored one file per day: data/notes/YYYY-MM-DD.html
const fs = require('fs');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const DIR = process.env.NOTES_DIR || path.join(__dirname, '..', 'data', 'notes');
const TIMEZONE = process.env.TIMEZONE || 'America/New_York';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// "2026-10-31" for the given moment, in TIMEZONE.
function dateId(when = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(when);
}

// Keep the formatting Trumbowyg makes; drop scripts, event handlers, etc.
function clean(html) {
  return sanitizeHtml(String(html || ''), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'u', 's', 'strike', 'sub', 'sup', 'del', 'ins']),
    allowedAttributes: { a: ['href', 'title', 'target'], img: ['src', 'alt', 'title'] },
  });
}

function file(date) {
  if (!DATE_RE.test(date)) throw new Error('bad date ' + date);
  return path.join(DIR, date + '.html');
}

function read(date) {
  try {
    return fs.readFileSync(file(date), 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

function write(date, html) {
  fs.mkdirSync(DIR, { recursive: true });
  const tmp = file(date) + '.tmp';
  fs.writeFileSync(tmp, html);
  fs.renameSync(tmp, file(date));
}

// Newest first.
function list() {
  let names = [];
  try {
    names = fs.readdirSync(DIR);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  return names
    .filter((n) => n.endsWith('.html') && DATE_RE.test(n.slice(0, -5)))
    .map((n) => n.slice(0, -5))
    .sort()
    .reverse();
}

function isEmpty(html) {
  if (/<img/i.test(String(html))) return false;
  return !String(html || '').replace(/<[^>]*>|&nbsp;|\s/g, '');
}

module.exports = { dateId, clean, read, write, list, isEmpty, DATE_RE, TIMEZONE };

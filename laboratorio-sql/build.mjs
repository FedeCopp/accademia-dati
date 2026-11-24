/**
 * Costruisce il Laboratorio SQL come UN SOLO file HTML, apribile con doppio clic e offline:
 * bundle JS (app + CodeMirror + sql.js), CSS, motore SQLite (.wasm) e database Chinook in base64.
 * Uso: npm run lab:build
 */
import { build } from 'esbuild';
import { readFileSync, writeFileSync, copyFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const OUT = join(here, 'Laboratorio-SQL.html');
const PUBLIC = join(here, '..', 'public', 'laboratorio-sql.html');

const js = (await build({
  entryPoints: [join(here, 'src/app.js')],
  bundle: true, minify: true, format: 'iife', platform: 'browser', target: 'es2020',
  write: false, legalComments: 'none', logLevel: 'warning',
  // sql-asm.js li richiede solo quando gira in Node: nel browser quel ramo non viene mai eseguito.
  external: ['node:fs', 'node:crypto'],
})).outputFiles[0].text;

const wasm = readFileSync(require.resolve('sql.js/dist/sql-wasm-browser.wasm')).toString('base64');
const db = readFileSync(join(here, 'data/chinook.sqlite')).toString('base64');
const css = readFileSync(join(here, 'src/styles.css'), 'utf8');
// package.json di sql.js non è esposto da "exports": lo leggo accanto a dist/.
const sqljsVersion = JSON.parse(readFileSync(join(dirname(require.resolve('sql.js/dist/sql-wasm.js')), '..', 'package.json'), 'utf8')).version;

const licenze = `<!--
  Laboratorio SQL · Accademia Dati (https://github.com/FedeCopp/accademia-dati)
  Contiene: sql.js ${sqljsVersion} (MIT, https://github.com/sql-js/sql.js) con SQLite (pubblico dominio),
  CodeMirror 6 (MIT), database Chinook (MIT, © 2008-2024 Luis Rocha, https://github.com/lerocha/chinook-database).
-->`;

// split/join invece di replace: nel codice minificato possono comparire sequenze come "$&".
let html = readFileSync(join(here, 'src/index.html'), 'utf8');
html = html.split('<!doctype html>').join(`<!doctype html>\n${licenze}`);
html = html.split('/*__CSS__*/').join(css);
html = html.split('__WASM__').join(wasm);
html = html.split('__DB__').join(db);
html = html.split('/*__JS__*/').join(js.replace(/<\/script/gi, '<\\/script'));

writeFileSync(OUT, html);
copyFileSync(OUT, PUBLIC);
const mb = (statSync(OUT).size / 1024 / 1024).toFixed(2);
console.log(`Creato ${OUT} (${mb} MB) e copiato in public/laboratorio-sql.html`);

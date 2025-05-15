# Beteiligungsdashboard README

## Voraussetzung:
- Linux (wir haben ein Ubuntu 22.04)
- MySQL-Datenbank (für Schema siehe ./config/db_schema.sql)
- die environment variables für die Datenbankverbindung werden in der Datei ./.env gespeichert
  - wichtig, dass die Tabelle den Namen „visitors“ trägt - dieser ist in der Datei ./routes/api.js an manchen Stellen noch hartkodiert...
- Node.js Installation

## Instructions:
- Ordnerinhalte auf den Linux-Rechner kopieren
- In den Ordner wechseln
- Im Ordner-Root .env-Datei anlegen mit den environment vars DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, DB_TABLE=visitors
- node-Module installieren mit npm install
- Optional: Portnummer anpassen in ./server.js - standardmäßig läuft die App auf Port 5435
- Antwortmöglichkeiten (für participation, futureReach und formats) können in der Datei ./config/db.js angepasst werden
- App starten (für Testzwecke) mit npm run dev -> im Browser aufrufen unter HOSTNAME:5435/dashboard
- Damit die App immer im Hintergrund läuft benötigt man entweder pm2 oder einen systemd service

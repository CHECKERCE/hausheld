Hausheld

Hausheld ist eine kleine Webanwendung mit Telegram-Bot zur Organisation von Haushaltsaufgaben, Remindern und Fairness-Statistiken im Familien- oder WG-Alltag.

Ziel des Projekts ist es, Aufgaben nachvollziehbar zu verteilen, Aktivität zu dokumentieren und Erinnerungen automatisch an die richtige Person zu senden.

## Überblick

- Aufgaben können mit Punkten angelegt, bearbeitet, erledigt und wiederhergestellt werden.
- Statistikansichten zeigen Punkte, erledigte Aufgaben und einen fairnessbasierten Score pro Person.
- Abwesenheiten werden berücksichtigt, damit Zeiträume ohne aktive Mitarbeit die Verteilung nicht verfälschen.
- Reminder lassen sich im Web und per Telegram verwalten, inklusive täglicher automatischer Reminder.
- Der Telegram-Bot kann Ranglisten anzeigen, offene Reminder auflisten und Personen mit Telegram-Accounts verknüpfen.

## Funktionen

### Aufgabenverwaltung

- Aufgaben mit Punktwert erstellen
- Aufgaben bearbeiten und löschen
- Aufgaben erledigen und im Verlauf speichern
- Undo-Funktion für versehentlich gelöschte Einträge

### Fairness und Statistik

- Rangliste aller Personen
- Punkte-, Aufgaben- und Fairness-Score-Ansicht
- Berücksichtigung von Abwesenheiten bei der Auswertung
- Diagramme und Verlaufsansicht
- Filter nach Person und Aufgabe

### Reminder-System

- Reminder erstellen
- Countdown bis zur Fälligkeit
- Reminder erledigen oder löschen
- Undo-Funktion
- Automatische tägliche Reminder (z. B. Küche aufräumen)

### Telegram-Bot

- Rangliste anzeigen
- Person mit dem aktuell niedrigsten Fairness-Score vorschlagen
- Offene Reminder anzeigen
- Reminder erstellen und erledigen
- Telegram-Accounts mit Personen verknüpfen
- Familiengruppe registrieren
- Automatische Benachrichtigungen bei fälligen Remindern

## Tech Stack

- Frontend: React, TypeScript, React Router, Recharts
- Backend: Node.js, Express, Prisma ORM
- Datenbank: PostgreSQL
- Bot: Telegram Bot API, Telegraf

## Projektstruktur

```text
hausheld/
├── apps/
│   ├── api/          # Express Backend
│   ├── bot/          # Telegram Bot
│   └── web/          # React Frontend
├── packages/
│   ├── db/           # Prisma Schema & DB Client
│   └── types/        # Geteilte TypeScript-Typen
├── docker-compose.yml
├── restart.sh        # Systemd-Services neu starten
├── stop.sh           # Systemd-Services stoppen
├── package.json
└── README.md
```

## Voraussetzungen

- Node.js 20 oder neuer
- npm
- PostgreSQL
- Telegram-Bot-Token

## Installation

Repository klonen:

```bash
git clone <repository-url>
cd hausheld
```

Abhängigkeiten installieren:

```bash
npm install
```

## Umgebungsvariablen

Beispiel für eine `.env`-Datei:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/hausheld
BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
API_URL=http://localhost:3001
```

## Datenbank einrichten

Migrationen ausführen:

```bash
npx prisma migrate dev --schema=packages/db/prisma/schema.prisma
```

Prisma Client generieren:

```bash
npx prisma generate --schema=packages/db/prisma/schema.prisma
```

## Entwicklung

Backend starten:

```bash
npm run dev:api
```

Frontend starten:

```bash
npm run dev:web
```

Telegram-Bot starten:

```bash
npm run dev:bot
```

Projekt bauen:

```bash
npm run build
```

## Skripte

- `npm run build:api` baut nur das API-Paket.
- `npm run build:bot` baut nur den Bot.
- `npm run build:web` baut nur das Frontend.
- `npm run build` baut alle Workspaces nacheinander.
- `npm run dev:api`, `npm run dev:bot` und `npm run dev:web` starten die einzelnen Dienste lokal.
- `./restart.sh` startet die Standard-Systemd-Services `hausheld-bot` und `hausheld-api` neu.
- `./stop.sh` stoppt dieselben Services.

## Telegram-Befehle

### Allgemein

- `/start`
- `/help`

### Statistiken

- `/stats`
- `/who`

`/who` zeigt die Person, die aktuell am ehesten dran wäre. Grundlage ist der Fairness-Score pro aktivem Tag.

### Reminder

- `/reminders`
- `/remind 160 Spülmaschine | Die Spülmaschine ist fertig.`

### Einrichtung

- `/register_chat`
- `/link <Name>`

## Deployment

Das Projekt ist für einen einfachen Serverbetrieb ausgelegt, zum Beispiel auf:

- Proxmox
- Debian LXC-Containern
- PostgreSQL
- Node.js

Für einen produktiven Betrieb sollten API, Bot und Web-App als eigene Services laufen.
Hausheld

Hausheld ist eine kleine Webanwendung mit Telegram-Bot zur Organisation von Haushaltsaufgaben.

Ziel des Projekts ist es, Haushaltsaufgaben fair zu verteilen, Aktivitäten zu verfolgen und Erinnerungen automatisch an die richtige Person zu senden.

Features

Aufgabenverwaltung

- Aufgaben mit Punkten erstellen
- Aufgaben bearbeiten und löschen
- Aufgaben erledigen und im Verlauf speichern
- Undo-Funktion für versehentlich gelöschte Einträge

Statistiken

- Rangliste aller Familienmitglieder
- Punkte- und Aufgabenstatistiken
- Diagramme und Verlaufsansicht
- Filter nach Person und Aufgabe

Reminder-System

- Reminder erstellen
- Countdown bis zur Fälligkeit
- Reminder erledigen oder löschen
- Undo-Funktion
- Automatische tägliche Reminder (z. B. Küche aufräumen)

Telegram Bot

- Rangliste anzeigen
- Offene Reminder anzeigen
- Reminder erstellen
- Reminder erledigen
- Telegram-Accounts mit Personen verknüpfen
- Familiengruppe registrieren
- Automatische Benachrichtigungen bei fälligen Remindern

---

Tech Stack

Frontend

- React
- TypeScript
- React Router
- Recharts

Backend

- Node.js
- Express
- Prisma ORM

Datenbank

- PostgreSQL

Bot

- Telegram Bot API
- Telegraf

---

Projektstruktur

hausheld/
│
├── apps/
│   ├── api/          # Express Backend
│   ├── web/          # React Frontend
│   └── bot/          # Telegram Bot
│
├── packages/
│   └── db/           # Prisma Schema & DB Client
│
├── .env
├── package.json
└── README.md

---

Installation

Repository klonen

git clone <repository-url>
cd hausheld

Abhängigkeiten installieren

npm install

---

Umgebungsvariablen

Beispiel ".env":

DATABASE_URL=postgresql://postgres:password@localhost:5432/hausheld

BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN

API_URL=http://localhost:3001

---

Datenbank einrichten

Migrationen ausführen:

npx prisma migrate dev --schema=packages/db/prisma/schema.prisma

Prisma Client generieren:

npx prisma generate --schema=packages/db/prisma/schema.prisma

---

Entwicklung starten

Backend:

npm run dev:api

Frontend:

npm run dev:web

Telegram Bot:

npm run dev:bot

---

Telegram Bot Befehle

Allgemein

/start
/help

Statistiken

/stats
/who

Zeigt die aktuelle Rangliste bzw. die Person, die aktuell am ehesten "dran" wäre.

Reminder

/reminders
/remind 160 Spülmaschine | Die Spülmaschine ist fertig.

Einrichtung

/register_chat
/link <Name>

---

Deployment

Geplant für:

- Proxmox
- Debian LXC Container
- PostgreSQL
- Node.js
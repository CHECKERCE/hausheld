import { prisma } from "@hausheld/db";

const hourStartReminder = 15; // the hour of the day when the daily reminder should be created (in 24-hour format)
const hourReminderDue = 18; // the hour of the day when the daily reminder is due (in 24-hour format)

function getTodayKey() {
    const today = new Date();
    const date = today.toISOString().slice(0, 10);

    return `daily-kitchen-${date}`;
}

function getTodayAt(hour: number, minute: number) {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
}

export function startDailyReminderScheduler() {
    setInterval(async () => {
        const now = new Date();
        
        if (now.getHours() < hourStartReminder) {
            return;
        }

        const key = getTodayKey();

        const existingReminder = await prisma.reminder.findUnique({
            where: { key },
        });

        if (existingReminder) {
            return;
        }

        await prisma.reminder.create({
            data: {
                key,
                title: "Küche aufräumen",
                message: "Die Küche sollte heute noch aufgeräumt werden.",
                dueAt: getTodayAt(hourReminderDue, 0),
            },
        });

        console.log("Daily kitchen reminder created:", key);
    }, 60_000);
}
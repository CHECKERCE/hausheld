import "dotenv/config";
import { Telegraf, Markup } from "telegraf";

const botToken = process.env.BOT_TOKEN;
const apiUrl = process.env.API_URL ?? "http://localhost:3001";

const commandOverviewString = "Befehle:\n" +
    "/stats - Zeigt eine Rangliste an\n" +
    "/reminders - Zeigt eine Übersicht der offenen Reminder\n" +
    "/remind <minuten> <Titel>, <Nachricht>\n" +
    "/who - Wer hat aktuell den niedrigsten Score und ist dran";

if (!botToken) {
    throw new Error("BOT_TOKEN fehlt in .env");
}

const bot = new Telegraf(botToken);

import type { Stat, Reminder, User, UserAbsence, TaskCompletion } from  "@hausheld/types";

type UserAbsenceResponse = Omit<UserAbsence, "startDate" | "endDate"> & {
    startDate: string;
    endDate: string;
};

function parseUserAbsence(absence: UserAbsenceResponse): UserAbsence {
    return {
        ...absence,
        startDate: new Date(absence.startDate),
        endDate: new Date(absence.endDate),
    };
}

type TelegramChat = {
    id: string;
    chatId: string;
    title?: string | null;
};

async function getUsers(): Promise<User[]> {
    const res = await fetch(`${apiUrl}/users`);
    return res.json();
}

async function getUserAbsences(): Promise<UserAbsence[]> {
    const res = await fetch(`${apiUrl}/user-absences`);
    const absences = (await res.json()) as UserAbsenceResponse[];

    return absences.map(parseUserAbsence);
}

function isDateInRange(date: Date, startDate: Date, endDate: Date) {
    const time = date.getTime();

    return (
        time >= startDate.getTime() &&
        time <= endDate.getTime()
    );
}

function isUserCurrentlyAway(user: User, absences: UserAbsence[]) {
    const now = new Date();

    return absences.some(
        (absence) =>
            absence.userId === user.id &&
            isDateInRange(now, absence.startDate, absence.endDate)
    );
}

async function registerTelegramChat(
    chatId: number | string,
    title?: string
): Promise<TelegramChat> {
    const res = await fetch(`${apiUrl}/telegram-chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chatId: String(chatId),
            title,
        }),
    });

    return res.json();
}

async function linkUserToTelegram(
    userId: string,
    telegramUserId: number,
    telegramName?: string
): Promise<User> {
    const res = await fetch(`${apiUrl}/users/${userId}/telegram`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            telegramUserId: String(telegramUserId),
            telegramName,
        }),
    });

    return res.json();
}

async function getTaskCompletions(): Promise<TaskCompletion[]> {
    const res = await fetch(`${apiUrl}/task-completions`);
    return res.json();
}

async function getStats(): Promise<Stat[]> {
    const res = await fetch(`${apiUrl}/stats`);
    return res.json();
}

async function getReminders(): Promise<Reminder[]> {
    const res = await fetch(`${apiUrl}/reminders`);
    return res.json();
}

async function createReminder(
    title: string,
    message: string,
    dueAt: string
): Promise<Reminder> {
    const res = await fetch(`${apiUrl}/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, dueAt }),
    });

    return res.json();
}

async function markReminderDone(id: string): Promise<Reminder> {
    const res = await fetch(`${apiUrl}/reminders/${id}/done`, {
        method: "PATCH",
    });

    return res.json();
}

async function deleteReminder(id: string) {
    const res = await fetch(`${apiUrl}/reminders/${id}`, {
        method: "DELETE",
    });
}

async function getTelegramChats(): Promise<TelegramChat[]> {
    const res = await fetch(`${apiUrl}/telegram-chats`);
    return res.json();
}

async function getPendingReminders(): Promise<Reminder[]> {
    const res = await fetch(`${apiUrl}/reminders/pending`);
    return res.json();
}

async function triggerReminder(id: string): Promise<Reminder> {
    const res = await fetch(`${apiUrl}/reminders/${id}/trigger`, {
        method: "PATCH",
    });

    return res.json();
}

function createMention(user: User) {
    if (!user.telegramUserId) {
        return user.name;
    }

    return `<a href="tg://user?id=${user.telegramUserId}">${user.name}</a>`;
}

function formatDate(value: string) {
    return new Date(value).toLocaleString("de-DE");
}

function formatDueTime(value: string) {
    const dueDate = new Date(value);
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffMinutes < 0) {
        return `vor ${Math.abs(diffMinutes)} Minuten`;
    } else if (diffMinutes < 60) {
        return `in ${diffMinutes} Minuten`;
    } else if (diffHours < 24) {
        return `in ${diffHours} Stunden`;
    } else {
        return `am ${dueDate.toLocaleDateString("de-DE")} um ${dueDate.toLocaleTimeString("de-DE")}`;
    }
}

type SuggestedUserResult = {
    user: User;
    score: number;
    tasksDone: number;
    lastCompletedAt: Date | null;
    availableUsersCount: number;
};

async function getSuggestedUser(): Promise<SuggestedUserResult | null> {
    const [users, stats, completions, absences] = await Promise.all([
        getUsers(),
        getStats(),
        getTaskCompletions(),
        getUserAbsences(),
    ]);

    const availableUsers = users.filter(
        (user) => !isUserCurrentlyAway(user, absences)
    );

    if (availableUsers.length === 0) {
        return null;
    }

    const usersWithData = availableUsers.map((user) => {
        const stat = stats.find((s) => s.userId === user.id);

        const userCompletions = completions.filter(
            (completion) => completion.user.id === user.id
        );

        const lastCompletion = [...userCompletions].sort(
            (a, b) =>
                new Date(b.completedAt).getTime() -
                new Date(a.completedAt).getTime()
        )[0];

        return {
            user,
            score: stat?.points ?? 0,
            tasksDone: stat?.tasksDone ?? 0,
            lastCompletedAt: lastCompletion?.completedAt ?? null,
            availableUsersCount: availableUsers.length,
        };
    });

    const lowestScore = Math.min(...usersWithData.map((item) => item.score));

    const lowestPointUsers = usersWithData.filter(
        (item) => item.score === lowestScore
    );

    const neverDone = lowestPointUsers.filter(
        (item) => item.lastCompletedAt === null
    );

    if (neverDone.length > 0) {
        return neverDone[Math.floor(Math.random() * neverDone.length)];
    }

    return [...lowestPointUsers].sort(
        (a, b) =>
            new Date(a.lastCompletedAt!).getTime() -
            new Date(b.lastCompletedAt!).getTime()
    )[0];
}

function startReminderScheduler() {
    setInterval(async () => {
        try {
            const [chats, reminders] = await Promise.all([
                getTelegramChats(),
                getPendingReminders(),
            ]);

            if (chats.length === 0 || reminders.length === 0) {
                return;
            }

            const chat = chats[0];

            for (const reminder of reminders) {
                const suggested = await getSuggestedUser();

                const mention = suggested
                    ? createMention(suggested.user)
                    : "jemand";

                await bot.telegram.sendMessage(
                    chat.chatId,
                    `⏰ <b>${reminder.title}</b>\n\n` +
                    `${reminder.message}\n\n` +
                    `Vorschlag: ${mention} wäre dran 🙂`,
                    {
                        parse_mode: "HTML",
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: "Erledigt ✅",
                                        callback_data: `done_reminder:${reminder.id}`,
                                    },
                                ],
                            ],
                        },
                    }
                );

                await triggerReminder(reminder.id);
            }
        } catch (error) {
            console.error("Reminder scheduler error:", error);
        }
    }, 60_000);
}

bot.start((ctx) => {
    ctx.reply(
        "Hallo! Ich bin Hausheld 🏠\n\n" +
        commandOverviewString
    );
});

bot.command("help", (ctx) => {
    ctx.reply(
        commandOverviewString
    );
});

bot.command("reminders", async (ctx) => {
    const reminders = await getReminders();
    const openReminders = reminders.filter((r) => !r.done);

    if (openReminders.length === 0) {
        await ctx.reply("Keine offenen Reminder ✅");
        return;
    }

    for (const reminder of openReminders) {
        await ctx.reply(
            `⏰ ${reminder.title}\n\n` +
            `${reminder.message}\n\n` +
            `Fällig: ${formatDate(reminder.dueAt)} | ${formatDueTime(reminder.dueAt)}`,
            Markup.inlineKeyboard([
                Markup.button.callback(
                    "Erledigt ✅",
                    `done_reminder:${reminder.id}`
                ),
                Markup.button.callback(
                    "Löschen ❌",
                    `delete_reminder:${reminder.id}`
                ),
            ])
        );
    }
});

bot.action(/^done_reminder:(.+)$/, async (ctx) => {
    const reminderId = ctx.match[1];

    await markReminderDone(reminderId);

    await ctx.answerCbQuery("Reminder erledigt ✅");

    await ctx.editMessageText("✅ Reminder erledigt.");
});

bot.action(/^delete_reminder:(.+)$/, async (ctx) => {
    const reminderId = ctx.match[1];

    await deleteReminder(reminderId);

    await ctx.answerCbQuery("Reminder gelöscht ❌");

    await ctx.editMessageText("❌ Reminder gelöscht");
});

bot.command("remind", async (ctx) => {
    const input = ctx.message.text.replace("/remind", "").trim();

    const match = input.match(/^(\d+)\s+(.+?)(?:\s*,\s*(.+))?$/);

    if (!match) {
        await ctx.reply(
            "Format:\n/remind <minuten> <Titel>, <Nachricht>\n\n" +
            "Beispiel:\n/remind 160 Spülmaschine, Spülmaschine ist fertig und kann ausgeräumt werden."
        );
        return;
    }

    const minutes = Number(match[1]);
    const title = match[2].trim();
    const message = match[3]?.trim() || `${title} ist fällig.`;

    const dueAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();

    const reminder = await createReminder(title, message, dueAt);

    await ctx.reply(
        `Reminder erstellt ✅\n\n` +
        `${reminder.title}\n` +
        `Fällig: ${formatDate(reminder.dueAt)} | ${formatDueTime(reminder.dueAt)}`
    );
});

bot.command("stats", async (ctx) => {
    const stats = await getStats();

    if (stats.length === 0) {
        await ctx.reply("Noch keine Statistiken vorhanden.");
        return;
    }

    const text = stats
        .sort((a, b) => b.points - a.points)
        .map(
            (stat, index) =>
                `${index + 1}. ${stat.name}: Score: ${stat.points.toFixed(2)} Punkte/Tag (${stat.points} Punkte, ${stat.activeDays} aktive Tage)`
        )
        .join("\n");

    await ctx.reply(`Rangliste 🏆\n\n${text}`);
});

bot.command("who", async (ctx) => {
    const suggested = await getSuggestedUser();

    if (!suggested) {
        await ctx.reply(
            "Aktuell ist niemand verfügbar. Vielleicht sind alle als abwesend markiert."
        );
        return;
    }

    await ctx.reply(
        `Heute wäre ${suggested.user.name} dran 🙂\n\n` +
        `Score: ${suggested.score.toFixed(2)}\n` +
        `Aufgaben erledigt: ${suggested.tasksDone}\n` +
        `Verfügbare Personen: ${suggested.availableUsersCount}` +
        (suggested.lastCompletedAt
            ? `\nLetzte Aufgabe: ${new Date(
                suggested.lastCompletedAt
            ).toLocaleString("de-DE")}`
            : `\nLetzte Aufgabe: noch keine`)
    );
});

bot.command("register_chat", async (ctx) => {
    const chat = ctx.chat;

    const title =
        "title" in chat
            ? chat.title
            : ctx.from?.first_name ?? "Privater Chat";

    await registerTelegramChat(chat.id, title);

    await ctx.reply(
        `Dieser Chat wurde für Hausheld-Reminder registriert ✅\n\nChat: ${title}`
    );
});

bot.command("link", async (ctx) => {
    const name = ctx.message.text.replace("/link", "").trim();

    if (!name) {
        await ctx.reply("Format:\n/link <Name>");
        return;
    }

    const users = await getUsers();

    const user = users.find(
        (item) => item.name.toLowerCase() === name.toLowerCase()
    );

    if (!user) {
        await ctx.reply(
            `Der nutzer "${name}" existiert nicht.`
        );
        return;
    }

    const telegramName =
        ctx.from.username ??
        `${ctx.from.first_name ?? ""} ${ctx.from.last_name ?? ""}`.trim();

    await linkUserToTelegram(user.id, ctx.from.id, telegramName);

    await ctx.reply(
        `${user.name} wurde mit deinem Telegram-Account verknüpft ✅`
    );
});


async function startBot() {
    await bot.launch();

    console.log("Telegram Bot läuft...");

    const shutdown = async (signal: "SIGINT" | "SIGTERM") => {
        console.log(`Bot stoppt wegen ${signal}...`);

        bot.stop(signal);

        // Falls irgendwas offen bleibt, Prozess sauber beenden
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    };

    process.once("SIGINT", () => void shutdown("SIGINT"));
    process.once("SIGTERM", () => void shutdown("SIGTERM"));
}


startReminderScheduler();
void startBot();
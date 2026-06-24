import { useState } from "react";
import { CreateUserForm } from "../components/CreateUserForm";
import type { User, UserAbsence } from "../types";

type Props = {
    users: User[];
    absences: UserAbsence[];
    onCreateUser: (name: string) => Promise<void>;
    onUpdateUser: (id: string, name: string) => Promise<void>;
    onDeleteUser: (id: string) => Promise<void>;
    onCreateAbsence: (
        userId: string,
        startDate: string,
        endDate: string,
        reason: string
    ) => Promise<void>;
    onDeleteAbsence: (id: string) => Promise<void>;
};

export function PeoplePage({
    users,
    absences,
    onCreateUser,
    onUpdateUser,
    onDeleteUser,
    onCreateAbsence,
    onDeleteAbsence,
}: Props) {
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");

    const [absenceUserId, setAbsenceUserId] = useState("");
    const [absenceStart, setAbsenceStart] = useState("");
    const [absenceEnd, setAbsenceEnd] = useState("");
    const [absenceReason, setAbsenceReason] = useState("Urlaub");

    function startEdit(user: User) {
        setEditingUserId(user.id);
        setEditingName(user.name);
    }

    function cancelEdit() {
        setEditingUserId(null);
        setEditingName("");
    }

    async function saveEdit() {
        if (!editingUserId || !editingName.trim()) return;

        await onUpdateUser(editingUserId, editingName);
        cancelEdit();
    }

    async function deletePerson(user: User) {
        const confirmed = window.confirm(
            `Möchtest du "${user.name}" wirklich löschen?\n\nAlle Aufgaben-Einträge und Abwesenheiten dieser Person werden gelöscht.`
        );

        if (!confirmed) return;

        await onDeleteUser(user.id);
    }

    async function createAbsence() {
        if (!absenceUserId || !absenceStart || !absenceEnd) return;

        await onCreateAbsence(
            absenceUserId,
            new Date(absenceStart).toISOString(),
            new Date(absenceEnd).toISOString(),
            absenceReason
        );

        setAbsenceUserId("");
        setAbsenceStart("");
        setAbsenceEnd("");
        setAbsenceReason("Urlaub");
    }

    return (
        <>
            <CreateUserForm onCreate={onCreateUser} />

            <section>
                <h2>Personen verwalten</h2>

                {users.length === 0 && <p>Noch keine Personen erstellt.</p>}

                <ul className="person-list">
                    {users.map((user) => {
                        const userAbsences = absences.filter(
                            (absence) => absence.userId === user.id
                        );

                        const activeAbsence = userAbsences.find((absence) => {
                            const now = Date.now();
                            return (
                                new Date(absence.startDate).getTime() <= now &&
                                new Date(absence.endDate).getTime() >= now
                            );
                        });

                        return (
                            <li key={user.id} className="person-item">
                                <div className="person-main">
                                    {editingUserId === user.id ? (
                                        <label className="task-name-field">
                                            <span>Name</span>
                                            <input
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                            />
                                        </label>
                                    ) : (
                                        <div>
                                            <strong>{user.name}</strong>
                                            {activeAbsence && (
                                                <span className="person-status">
                                                    🏖️ abwesend bis{" "}
                                                    {new Date(activeAbsence.endDate).toLocaleDateString(
                                                        "de-DE"
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="task-actions">
                                    {editingUserId === user.id ? (
                                        <>
                                            <button onClick={saveEdit}>Speichern</button>
                                            <button className="secondary-button" onClick={cancelEdit}>
                                                Abbrechen
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="secondary-button"
                                                onClick={() => startEdit(user)}
                                            >
                                                Bearbeiten
                                            </button>

                                            <button
                                                className="danger-button"
                                                onClick={() => deletePerson(user)}
                                            >
                                                Löschen
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </section>

            <section>
                <h2>Abwesenheit eintragen</h2>

                <div className="form-row">
                    <label className="task-name-field">
                        <span>Person</span>
                        <select
                            value={absenceUserId}
                            onChange={(e) => setAbsenceUserId(e.target.value)}
                        >
                            <option value="">Person auswählen</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="task-name-field">
                        <span>Von</span>
                        <input
                            type="date"
                            value={absenceStart}
                            onChange={(e) => setAbsenceStart(e.target.value)}
                        />
                    </label>

                    <label className="task-name-field">
                        <span>Bis</span>
                        <input
                            type="date"
                            value={absenceEnd}
                            onChange={(e) => setAbsenceEnd(e.target.value)}
                        />
                    </label>

                    <label className="task-name-field">
                        <span>Grund</span>
                        <input
                            value={absenceReason}
                            onChange={(e) => setAbsenceReason(e.target.value)}
                        />
                    </label>

                    <button onClick={createAbsence}>Speichern</button>
                </div>
            </section>

            <section>
                <h2>Abwesenheiten</h2>

                {absences.length === 0 && <p>Keine Abwesenheiten eingetragen.</p>}

                <ul className="person-list">
                    {absences.map((absence) => (
                        <li key={absence.id} className="person-item">
                            <div className="person-main">
                                <strong>{absence.user.name}</strong>
                                <span className="person-status">
                                    {new Date(absence.startDate).toLocaleDateString("de-DE")} –{" "}
                                    {new Date(absence.endDate).toLocaleDateString("de-DE")}
                                    {absence.reason ? ` · ${absence.reason}` : ""}
                                </span>
                            </div>

                            <button
                                className="danger-button"
                                onClick={() => onDeleteAbsence(absence.id)}
                            >
                                Löschen
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    );
}
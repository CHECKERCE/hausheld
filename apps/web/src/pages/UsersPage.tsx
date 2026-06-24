import { CreateUserForm } from "../components/CreateUserForm";
import type { User } from "../types";

type Props = {
  users: User[];
  onCreateUser: (name: string) => Promise<void>;
};

export function UsersPage({ users, onCreateUser }: Props) {
  return (
    <>
      <CreateUserForm onCreate={onCreateUser} />

      <section>
        <h2>Personen</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
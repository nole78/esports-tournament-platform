import { useEffect, useState } from "react";
import { PageHeader, Table, TableHead, RoleBadge, Empty, ErrorBox } from "../../components/ui/UI";
import { usersApi } from "../../api_services/users/UsersAPIService";
import type { UserDto } from "../../models/user/UserTypes";

export default function UsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [error, setError] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

  useEffect(() => {
    usersApi.getAll()
      .then(res => { if (res.success) setUsers(res.data ?? []); else setError(res.message); })
      .catch(() => setError("Failed to load users"));
  }, []);

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Users" />
      {error && <ErrorBox message={error} />}
      {users.length === 0 && !error ? <Empty message="No users found" /> : (
        <Table>
          <TableHead columns={["ID", "Username", "Email", "Role", "Status"]} />
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-secondary/50 hover:bg-bgprimary/10 transition-colors">
                <td className="px-5 py-3.5 text-bgsecondary/30 font-mono text-xs">{u.id}</td>
                <td className="px-5 py-3.5 text-bgsecondary/80 text-sm">{u.gamerTag}</td>
                <td className="px-5 py-3.5 text-bgsecondary/40 text-sm">{u.email}</td>
                <td className="px-5 py-3.5">
                  <button onClick={() => setSelectedUser(u)} className="cursor-pointer">
                    <RoleBadge role={u.role} />
                  </button>
                </td>
                <td className="px-5 py-3.5 text-bgsecondary/30 text-xs">
                  <div className="flex items-center">
                    <span
                        className={`w-2.5 h-2.5 rounded-full mr-2 ${
                            u?.isActive
                                ? "bg-green-500 shadow-[0_0_8px_#22c55e]"
                                : "bg-bgsecondary/30"
                        }`}
                    />
                    <span className="text-bgsecondary/40">
                        {u?.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)}/>
          <div className=" relative w-85 rounded-3xl border border-secondary/40 bg-[#111814] p-6 shadow-[0_0_60px_rgba(120,255,120,0.08)] animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-secondary to-transparent opacity-70" />
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-bgsecondary">
                Change Role
              </h2>
              <p className="mt-1 text-sm text-bgsecondary/40">
                Select a new role for{" "}
                <span className="text-bgsecondary">
                  {selectedUser.gamerTag}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              {["admin", "player"].map(role => (
                <button key={role} onClick={() => {
                    setUsers(prev =>
                      prev.map(user =>
                        user.id === selectedUser.id
                          ? { ...user, role }
                          : user
                      )
                    );
                    if(selectedUser.role === "admin")
                    {
                      role = selectedUser.role;
                      setSelectedUser(null);
                      setError("Cannot change the role of an admin")
                      setTimeout(() => {setError("")}, 3000);
                      return;
                    }
                    else
                    {
                      usersApi.changeRole(selectedUser.id, role)
                    }
                    
                    setSelectedUser(null);
                  }}
                  className={`w-full rounded-2xl border py-3 text-sm font-medium transition-all duration-200 cursor-pointer justify-center-safe items-center
                    ${
                      selectedUser.role === role
                        ? "border-secondary/40 bg-secondary/10 text-secondary"
                        : "border-bgsecondary/5 bg-bgsecondary/2 text-bgsecondary/70 hover:bg-bgsecondary/5"
                    }
                  `}>
                  <RoleBadge role = {role}/>
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-5 w-full rounded-2xl border border-bgsecondary/5 bg-bgsecondary/3 py-3 text-sm text-bgsecondary/50 transition hover:bg-bgsecondary/6 cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

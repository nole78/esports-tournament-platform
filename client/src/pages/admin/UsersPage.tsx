// Add user pagination
import { useState } from "react";
import { PageHeader, Table, TableHead, RoleBadge, Empty, ErrorBox, Spinner } from "../../components/ui/UI";
import { usersApi } from "../../api_services/users/UsersAPIService";
import type { UserDto } from "../../models/user/UserTypes";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

export default function UsersPage() {
  const [actionError, setActionError] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserDto>();
  const [open, setOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error} = useQuery({
    queryKey:["users"],
    queryFn: async () => {
      return usersApi.getAll()
      .then(res => { 
        if (!res.success) {
          throw new Error(res.message ?? "Failed to load users"); 
        }
        return res.data;
      })
      .catch(() => { throw new Error("Failed to load users")});
    },
    placeholderData: keepPreviousData
  })

  const users = data || []

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Users" />
      {actionError && 
        <ErrorBox message={actionError}/>
      }
      {error ? (
        <ErrorBox message={error.message} />
      ) :
      isLoading? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : 
      users.length === 0 ? (
        <Empty message="No users found" /> 
      ) : (
        <Table>
          <TableHead columns={["ID", "Username", "Email", "Role", "Status"]} />
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-secondary/50 hover:bg-bgprimary/10 transition-colors">
                <td className="px-5 py-3.5 text-bgsecondary/30 font-mono text-xs">{u.id}</td>
                <td className="px-5 py-3.5 text-bgsecondary/80 text-sm">{u.gamerTag}</td>
                <td className="px-5 py-3.5 text-bgsecondary/40 text-sm">{u.email}</td>
                <td className="px-5 py-3.5">
                  <button onClick={() => {setSelectedUser(u); setOpen(true);}} className="cursor-pointer">
                    <RoleBadge role={u.role} />
                  </button>
                </td>
                <td className="px-5 py-3.5 text-bgsecondary/30 text-xs">
                  <div className="flex items-center">
                    <span
                        className={`w-2.5 h-2.5 rounded-full mr-2  ${
                            u?.isActive
                                ? "animate-pulse bg-green-500 shadow-[0_0_8px_#22c55e]"
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
      {selectedUser && open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}/>
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
                    if(selectedUser.role === "admin")
                    {
                      role = selectedUser.role;
                      setOpen(false);
                      setActionError("Cannot change the role of an admin")
                      setTimeout(() => {setActionError("")}, 3000);
                      return;
                    }
                    else
                    {
                      usersApi.changeRole(selectedUser.id, role)
                      .then(res => {
                        if(!res.success) {
                          setActionError(res.message || "Failed to change users role");
                        }
                        queryClient.invalidateQueries({queryKey: ["users"]});
                      })
                      .catch(() => setActionError("Failed to change users role"));
                    }
                    
                    setOpen(false);
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
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-2xl border border-bgsecondary/5 bg-bgsecondary/3 py-3 text-sm text-bgsecondary/50 transition hover:bg-bgsecondary/6 cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

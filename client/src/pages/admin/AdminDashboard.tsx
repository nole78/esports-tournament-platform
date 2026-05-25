import { PageHeader } from "../../components/ui/UI";
import AuditLogPage from "./AuditLog";
import HealthPage from "./HealthPage";
import UsersPage from "./UsersPage";

// TODO: Replace with your domain-specific admin dashboard content
export default function AdminDashboard() {
  return (
    <div>
      <PageHeader eyebrow="Admin" title="Dashboard" />
      <UsersPage/>
      <br/>
      <AuditLogPage/>
      <br/>
      <HealthPage/>
    </div>
  );
}

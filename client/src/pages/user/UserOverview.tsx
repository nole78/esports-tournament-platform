import { PageHeader } from "../../components/ui/UI";
import ChangePasswordForm from "../../components/account/ChangePasswordForm";
import ChangeInfoForm from "../../components/account/ChangeInfoForm";

export default function UserOverview() {

  return (
    <div>
        <PageHeader eyebrow="" title="Change Account Information" />
        <ChangeInfoForm/>
        <PageHeader eyebrow="" title="Change Password" />
        <ChangePasswordForm/>
    </div>
  );
}

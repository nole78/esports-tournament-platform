import ApiHealthDisplay from "../../components/admin/ApiHealthDisplay";
import DbHealthDisplay from "../../components/admin/DbHealthDisplay";

export default function HealthPage() {

  return (
    <>
      <DbHealthDisplay/>
      <br/>
      <ApiHealthDisplay/>
    </>
  );
}

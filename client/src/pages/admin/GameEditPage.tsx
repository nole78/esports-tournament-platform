import { useNavigate, useParams } from "react-router-dom";
import { GameEditForm } from "../../components/admin/GameEditForm";
import { PageHeader } from "../../components/ui/UI";


export default function GameEditPage(){
    const navigate = useNavigate();
    const {id} = useParams();

    return (
        <div>
            <PageHeader eyebrow="ADMIN" title="Edit Game"></PageHeader>
            <button onClick={() => navigate("/game_catalog")}
                    className="mb-2 bg-bgsecondary/40 border-2 border-bgsecondary hover:bg-bgsecondary/30 text-bgsecondary font-semibold rounded-xl p-3 text-sm transition-colors">
            Back</button>
            <GameEditForm id={id ?? ""}/>
        </div>
    );
}
import { useParams } from "react-router-dom";
import { GameEditForm } from "../../components/admin/GameEditForm";
import { PageHeader } from "../../components/ui/UI";


export default function GameEditPage(){

    const {id} = useParams();

    return (
        <div>
            <PageHeader eyebrow="ADMIN" title="Edit Game"></PageHeader>
            <GameEditForm id={id ?? ""}/>
        </div>
    );
}
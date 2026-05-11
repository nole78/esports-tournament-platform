import { useParams } from "react-router-dom";
import { GameEditForm } from "../../components/admin/GameEditForm";


export default function GameEditPage(){
    const {id} = useParams();

    return (
        <main className="min-h-screen bg-primary flex items-center justify-center px-4">
            <GameEditForm id={id ?? ""}/>
        </main>
    );
}
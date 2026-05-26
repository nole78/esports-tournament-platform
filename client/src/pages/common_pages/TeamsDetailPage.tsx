import { useParams } from "react-router-dom";
import { TeamsDetailForm } from "../user_forms/TeamsDetailForm";


export default function TeamsDetailPage(){
    const {id} = useParams();
    return (
        <main className="min-h-screen w-1/2 bg-primary flex items-center justify-self-center p-2">
            <TeamsDetailForm id={id ?? ""}/>
        </main>
    );
}
import { useParams } from "react-router-dom";
import { TeamsDetailForm } from "../user_forms/TeamsDetailForm";


export default function TeamsDetailPage(){
    const {id} = useParams();
    return (
        <main className="min-h-screen bg-primary flex items-center justify-center px-4">
                            <TeamsDetailForm id={id ?? ""}/>
                </main>
    );
}
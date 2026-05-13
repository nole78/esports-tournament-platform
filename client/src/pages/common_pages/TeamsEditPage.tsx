import { useParams } from "react-router-dom";
import { TeamsEditForm } from "../user_forms/TeamsEditForm";


export default function TeamsEditPage(){
    const {id} = useParams();

    return(
    <main className="min-h-screen bg-primary flex items-center justify-center px-4">
            <TeamsEditForm id={id ?? ""}/>
    </main>
    );
}
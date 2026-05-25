import { useParams } from "react-router-dom";
import { TeamsGuestDetailsForm } from "../user_forms/TeamsGuestDetailsForm";


export default function TeamsGuestDetailsPage(){
    const {id} = useParams();
    return (
        <main className="min-h-screen bg-primary flex items-center justify-center px-4">
                            <TeamsGuestDetailsForm id={id ?? ""}/>
                </main>
    );
}
import { PageHeader } from "../ui/UI";

export default function TournamentOverview() {
    
    return (
        <div>
        <PageHeader eyebrow="" title="Tournament Overview" />
        <div className="space-y-4">
            <div className="bg-primary border border-secondary/40 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Tournament name</h3>
            {/* need to implement tournament info */}
            </div>
        </div>
        </div>
    );
}
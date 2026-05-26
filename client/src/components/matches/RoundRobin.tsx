import { useMemo } from "react";
import { PageHeader, Table, TableHead } from "../ui/UI";
import type { MatchDto } from "../../models/match/MatchDto";
import { MatchNode } from "./MatchNode";
import TrophyIcon from "../heroIcons/TrophyIcon";

type Props = {
    matches: MatchDto[];
};

type TeamStats = {
    teamId: number;
    teamName: string;
    wins: number;
    losses: number;
    roundsWon: number;
    roundsLost: number;
    matchesPlayed: number;
};

export default function RoundRobin({ matches }: Props) {

    const standings = useMemo(() => {
        const statsMap = new Map<number, TeamStats>();

        const getOrCreate = (id: number, name: string): TeamStats => {
            if (!statsMap.has(id)) {
                statsMap.set(id, {
                    teamId: id,
                    teamName: name,
                    wins: 0,
                    losses: 0,
                    roundsWon: 0,
                    roundsLost: 0,
                    matchesPlayed: 0,
                });
            }
            return statsMap.get(id)!;
        };

        matches.forEach((m) => {
            if (m.status === "scheduled") return;

            const blue = getOrCreate(m.blueTeamId, m.blueTeamName);
            const red = getOrCreate(m.redTeamId, m.redTeamName);

            blue.matchesPlayed++;
            red.matchesPlayed++;

            blue.roundsWon += m.blueTeamScore;
            blue.roundsLost += m.redTeamScore;
            red.roundsWon += m.redTeamScore;
            red.roundsLost += m.blueTeamScore;

            if (m.winnerTeamId === m.blueTeamId) {
                blue.wins++;
                red.losses++;
            } else if (m.winnerTeamId === m.redTeamId) {
                red.wins++;
                blue.losses++;
            }
        });

        return Array.from(statsMap.values()).sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            const aDiff = a.roundsWon - a.roundsLost;
            const bDiff = b.roundsWon - b.roundsLost;
            return bDiff - aDiff;
        });
    }, [matches]);

    const rounds = useMemo(() => {
        const grouped: Record<number, MatchDto[]> = {};
        matches.forEach((m) => {
            (grouped[m.roundNumber] ??= []).push(m);
        });
        return Object.entries(grouped)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([round, roundMatches]) => ({
                round: Number(round),
                matches: roundMatches,
            }));
    }, [matches]);

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen">
            {/* STANDINGS TABLE */}
            <div className="w-2/3">
                <PageHeader title="Standings" eyebrow=""/>
                <Table>
                    <TableHead columns={["#", "Team", "MP", "W", "L", "Score", "DIFF"]} />
                    <tbody>
                        {standings.map((team, index) => {
                            const diff = team.roundsWon - team.roundsLost;
                            const isPositive = diff > 0;
                            const isNegative = diff < 0;

                            return (
                                <tr key={team.teamId} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                    <td className="px-5 py-3.5 text-white/30 text-xs font-bold">
                                        {index + 1}
                                    </td>
                                    <td className="px-5 py-3.5 font-bold text-bgsecondary/80  text-sm">
                                        {index === 0 && (
                                            <TrophyIcon className="mr-2 text-yellow-400 w-4 h-4" />
                                        )}
                                        {team.teamName}
                                    </td>
                                    <td className="px-5 py-3.5 text-white/60 text-sm">
                                        {team.matchesPlayed}
                                    </td>
                                    <td className="px-5 py-3.5 text-green-400 font-bold text-sm">
                                        {team.wins}
                                    </td>
                                    <td className="px-5 py-3.5 text-red-400 font-bold text-sm">
                                        {team.losses}
                                    </td>
                                    <td className="px-5 py-3.5 text-bgsecondary/80  text-sm">
                                        {team.roundsWon}/{team.roundsLost}
                                    </td>
                                    <td className={`px-5 py-3.5 font-bold text-sm ${
                                        isPositive
                                            ? "text-green-400"
                                            : isNegative
                                            ? "text-red-400"
                                            : "text-white/40"
                                    }`}>
                                        {isPositive ? `+${diff}` : diff}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>
            {/* ROUNDS */}
            <div className="flex flex-col gap-6">
                {rounds.map((round) => (
                    <div key={round.round}>
                        <PageHeader title={"Round " + round.round} eyebrow=""/>
                        <div className="flex flex-wrap gap-4">
                            {round.matches.map((match) => (
                                <MatchNode
                                    key={match.matchId}
                                    match={match}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
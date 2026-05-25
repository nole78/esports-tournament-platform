export const TournamentRegistrationStatus = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    DISQUALIFIED: "disqualified"
}as const;

export type TournamentRegistrationStatus = typeof TournamentRegistrationStatus[keyof typeof TournamentRegistrationStatus];
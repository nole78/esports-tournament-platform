export const TournamentStatusValues = {
    UPCOMING: "upcoming",
    ACTIVE: "active",
    COMPLETED: "completed"
} as const;

export type TournamentStatus = typeof TournamentStatusValues[keyof typeof TournamentStatusValues];
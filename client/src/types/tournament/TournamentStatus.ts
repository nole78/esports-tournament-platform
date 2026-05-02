const TournamentStatus = {
    UPCOMING: "upcoming",
    ACTIVE: "active",
    COMPLETED: "completed"
} as const;

export type TournamentStatus = typeof TournamentStatus[keyof typeof TournamentStatus];
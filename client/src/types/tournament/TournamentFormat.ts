export const TournamentFormatValues = {
    SINGLE_ELIMINATION: "single_elimination",
    DOUBLE_ELIMINATION: "double_elimination",
    ROUND_ROBIN: "round_robin"
} as const;

export type TournamentFormat = typeof TournamentFormatValues[keyof typeof TournamentFormatValues];
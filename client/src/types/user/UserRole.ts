export const UserRole = {
    ADMIN: "admin",
    PLAYER: "player"
} as const;

export type TeamRole = typeof UserRole[keyof typeof UserRole];
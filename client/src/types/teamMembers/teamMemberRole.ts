export const TeamRole ={
    CAPTAIN: "captain",
    MEMBER: "member",
    GUEST: "guest"
} as const;

export type TeamRole = typeof TeamRole[keyof typeof TeamRole];
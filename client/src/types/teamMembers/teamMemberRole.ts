export const TeamRole ={
    CAPTAIN: "captain",
    MEMBER: "member" 
} as const;

export type TeamRole = typeof TeamRole[keyof typeof TeamRole];
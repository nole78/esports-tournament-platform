import { useEffect, useRef, useState } from "react";
import type { MatchDto } from "../../models/match/MatchDto";
import { MatchNode } from "./MatchNode";

type BracketProps = {
    matches: MatchDto[];
};

const MATCH_WIDTH = 180;
const MATCH_HEIGHT = 64;
const COLUMN_GAP = 140;
const BASE_VERTICAL_GAP = 28;
const MIN_SCALE = 0.35;
const MAX_SCALE = 1.2;

type PositionedMatch = {
    match: MatchDto;
    x: number;
    y: number;
};

function positionRounds(rounds: { round: number; matches: MatchDto[] }[])
: { positioned: PositionedMatch[]; canvasWidth: number; canvasHeight: number } {
    if (rounds.length === 0) {
        return { positioned: [], canvasWidth: 400, canvasHeight: 300 };
    }

    const firstRoundCount = rounds[0].matches.length;
    const totalHeight =
        firstRoundCount * (MATCH_HEIGHT + BASE_VERTICAL_GAP) * 2 + 100;

    const positioned: PositionedMatch[] = [];

    rounds.forEach((round, roundIndex) => {
        const spacing =
            (MATCH_HEIGHT + BASE_VERTICAL_GAP) * Math.pow(2, roundIndex);
        const roundHeight = spacing * round.matches.length;
        const offsetY = (totalHeight - roundHeight) / 2;

        round.matches.forEach((match, index) => {
            positioned.push({
                match,
                x: roundIndex * (MATCH_WIDTH + COLUMN_GAP),
                y: offsetY + index * spacing + spacing / 2 - MATCH_HEIGHT / 2,
            });
        });
    });

    const canvasWidth = rounds.length * (MATCH_WIDTH + COLUMN_GAP) + 100;
    const canvasHeight = totalHeight + 80;

    return { positioned, canvasWidth, canvasHeight };
}

function BracketCanvas({rounds, label, labelColor, lineColor,}: {
    rounds: { round: number; matches: MatchDto[] }[];
    label: string;
    labelColor: string;
    lineColor: string;
}) {
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(document.createElement("div"));
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
    const [dragging, setDragging] = useState(false);

    const { positioned, canvasWidth, canvasHeight } = positionRounds(rounds);

    const getPos = (id: number) =>
        positioned.find((m) => m.match.matchId === id);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            setScale((prev) =>
                Math.min(Math.max(prev - e.deltaY * 0.001, MIN_SCALE), MAX_SCALE)
            );
        };

        el.addEventListener("wheel", handleWheel, { passive: false });
        return () => el.removeEventListener("wheel", handleWheel);
    }, []); 

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const fit = Math.min(
            el.clientWidth / canvasWidth,
            el.clientHeight / canvasHeight,
            1
        );
        setScale(Math.max(fit, MIN_SCALE));
    }, [canvasWidth, canvasHeight]);

    const onMouseDown = (e: React.MouseEvent) => {
        const el = containerRef.current;
        if (!el) return;
        isDragging.current = true;
        setDragging(true);
        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            scrollLeft: el.scrollLeft,
            scrollTop: el.scrollTop,
        };
    };

    const onMouseMove = (e: React.MouseEvent) => {
        const el = containerRef.current;
        if (!el || !isDragging.current) return;
        el.scrollLeft =
            dragStart.current.scrollLeft - (e.clientX - dragStart.current.x);
        el.scrollTop =
            dragStart.current.scrollTop - (e.clientY - dragStart.current.y);
    };

    const stopDragging = () => {
        isDragging.current = false;
        setDragging(false);
    };

    return (
        <div className="relative flex-1 min-h-0 overflow-hidden flex flex-col">
            
            {/* Label */}
            <div
                className={`shrink-0 px-5 py-2 text-xs font-bold tracking-widest uppercase border-b border-white/5 ${labelColor}`}
            >
                {label}
            </div>

            {/* Zoom buttons */}
            <div className="absolute top-2 right-3 z-50 flex gap-2">
                <button
                    onClick={() =>
                        setScale((s) => Math.min(s + 0.1, MAX_SCALE))
                    }
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-lg bg-black/60 text-white font-bold hover:bg-black/80"
                >
                    +
                </button>
                <button
                    onClick={() =>
                        setScale((s) => Math.max(s - 0.1, MIN_SCALE))
                    }
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-lg bg-black/60 text-white font-bold hover:bg-black/80"
                >
                    −
                </button>
            </div>

            {/* Scrollable area */}
            <div
                ref={containerRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={stopDragging}
                onMouseLeave={stopDragging}
                className={`flex-1 overflow-auto relative select-none ${
                    dragging ? "cursor-grabbing" : "cursor-grab"
                }`}
            >
                <div
                    className="relative origin-top-left"
                    style={{
                        width: canvasWidth,
                        height: canvasHeight,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        paddingTop: 40,
                        paddingLeft: 60,
                    }}
                >
                    {/* Connector lines */}
                    <svg
                        className="absolute top-0 left-0 pointer-events-none"
                        width={canvasWidth}
                        height={canvasHeight}
                    >
                        {positioned.map((current) => {
                            const targetId = current.match.winnerToMatchId;
                            if (!targetId) return <></>;
                            const target = getPos(targetId);
                            if (!target) return <></>;

                            const startX = current.x + MATCH_WIDTH;
                            const startY = current.y + MATCH_HEIGHT / 2;
                            const midX = startX + COLUMN_GAP / 2;
                            const endX = target.x;
                            const endY = target.y + MATCH_HEIGHT / 2;

                            return (
                                <path
                                    key={`line-${current.match.matchId}-${targetId}`}
                                    d={`M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`}
                                    stroke={lineColor}
                                    strokeWidth="2.5"
                                    fill="none"
                                    strokeLinecap="round"
                                    opacity={0.8}
                                />
                            );
                        })}
                    </svg>

                    {/* Match nodes */}
                    {positioned.map((item) => (
                        <div
                            key={item.match.matchId}
                            className="absolute"
                            style={{ left: item.x, top: item.y }}
                        >
                            <MatchNode match={item.match} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function createRounds(src: MatchDto[]) {
    const grouped: Record<number, MatchDto[]> = {};
    src.forEach((m) => {
        (grouped[m.roundNumber] ??= []).push(m);
    });
    return Object.entries(grouped)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([round, matches]) => ({ round: Number(round), matches }));
}

export default function DoubleBracket({ matches }: BracketProps) {
    const winnerMatches = matches.filter((m) => m.bracketType === "winner");
    const loserMatches = matches.filter((m) => m.bracketType === "loser");
    const grandFinalMatches = matches.filter(
        (m) => m.bracketType === "grand_final"
    );

    const winnerRounds = createRounds(winnerMatches);
    const loserRounds = createRounds(loserMatches);

    const lastWinnerRound =
        winnerRounds[winnerRounds.length - 1]?.round ?? 0;
    const grandFinalRounds = createRounds(grandFinalMatches).map((r) => ({
        ...r,
        round: lastWinnerRound + r.round,
    }));

    const winnerWithGF = [...winnerRounds, ...grandFinalRounds];

    return (
        <div className="flex flex-col gap-3 w-full rounded-2xl h-screen bg-[#040D07] p-4">
            <BracketCanvas
                rounds={winnerWithGF}
                label="Winner Bracket + Grand Final"
                labelColor="text-green-400"
                lineColor="#4ade80"
            />
            <BracketCanvas
                rounds={loserRounds}
                label="Loser Bracket"
                labelColor="text-red-400"
                lineColor="#f87171"
            />
        </div>
    );
}
// Bracket.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { MatchNode } from "./MatchNode";
import type { MatchDto } from "../../models/match/MatchDto";

type BracketProps = {
    matches: MatchDto[];
    title?: string;
};

const MATCH_WIDTH = 180;
const MATCH_HEIGHT = 64;
const COLUMN_GAP = 140;
const BASE_VERTICAL_GAP = 28;
const MIN_SCALE = 0.35;
const MAX_SCALE = 1.2;

export default function Bracket({ matches , title}: BracketProps) {
    const containerRef = useRef(document.createElement("div"));
    const canvasRef = useRef(document.createElement("div"));
    const isDragging = useRef(false);
    const [dragging, setDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
    const [scale, setScale] = useState(1);

    const rounds = useMemo(() => {
        const grouped: Record<number, MatchDto[]> = {};
        matches.forEach((match) => {
            (grouped[match.roundNumber] ??= []).push(match);
        });
        return Object.entries(grouped)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([round, roundMatches]) => ({
                round: Number(round),
                matches: roundMatches,
            }));
    }, [matches]);

    const firstRoundCount = rounds[0]?.matches.length || 1;
    const totalHeight = firstRoundCount * (MATCH_HEIGHT + BASE_VERTICAL_GAP) * 2;

    const positionedMatches: { match: MatchDto; x: number; y: number }[] = [];

    rounds.forEach((round, roundIndex) => {
        const spacing =
            (MATCH_HEIGHT + BASE_VERTICAL_GAP) * Math.pow(2, roundIndex);
        const roundHeight = spacing * round.matches.length;
        const offsetY = (totalHeight - roundHeight) / 2;

        round.matches.forEach((match, index) => {
            positionedMatches.push({
                match,
                x: roundIndex * (MATCH_WIDTH + COLUMN_GAP),
                y: offsetY + index * spacing + spacing / 2 - MATCH_HEIGHT / 2,
            });
        });
    });

    const getMatchPosition = (matchId: number) =>
        positionedMatches.find((m) => m.match.matchId === matchId);

    const canvasWidth = rounds.length * (MATCH_WIDTH + COLUMN_GAP) + 200;
    const canvasHeight = totalHeight + 120;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            setScale((prev) =>
                Math.min(Math.max(prev - e.deltaY * 0.001, MIN_SCALE), MAX_SCALE)
            );
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => container.removeEventListener("wheel", handleWheel);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scaleX = container.clientWidth / canvasWidth;
        const scaleY = container.clientHeight / canvasHeight;
        const fitScale = Math.min(scaleX, scaleY, 1);
        setScale(Math.max(fitScale, MIN_SCALE));

        requestAnimationFrame(() => {
            container.scrollLeft =
                (canvasWidth * fitScale - container.clientWidth) / 2;
            container.scrollTop =
                (canvasHeight * fitScale - container.clientHeight) / 2;
        });
    }, [canvasWidth, canvasHeight]);

    const onMouseDown = (e: React.MouseEvent) => {
        const container = containerRef.current;
        if (!container) return;
        isDragging.current = true;
        setDragging(true);
        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            scrollLeft: container.scrollLeft,
            scrollTop: container.scrollTop,
        };
    };

    const onMouseMove = (e: React.MouseEvent) => {
        const container = containerRef.current;
        if (!container || !isDragging.current) return;
        container.scrollLeft =
            dragStart.current.scrollLeft - (e.clientX - dragStart.current.x);
        container.scrollTop =
            dragStart.current.scrollTop - (e.clientY - dragStart.current.y);
    };

    const stopDragging = () => {
        isDragging.current = false;
        setDragging(false);
    };

    return (
        <div className="relative w-full rounded-3xl bg-[#07110B] h-screen p-6 overflow-hidden">
            
            {/* TITLE */}
            {title && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
                    <span className="text-sm font-bold tracking-widest uppercase text-bgsecondary">
                        {title}
                    </span>
                </div>
            )}
            
            {/* ZOOM CONTROLS */}
            <div className="absolute top-4 right-4 z-50 flex gap-2">
                <button
                    onClick={() => setScale((s) => Math.min(s + 0.1, MAX_SCALE))}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-10 h-10 rounded-xl bg-black/60 text-white text-xl font-bold hover:bg-black/80"
                >
                    +
                </button>
                <button
                    onClick={() => setScale((s) => Math.max(s - 0.1, MIN_SCALE))}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-10 h-10 rounded-xl bg-black/60 text-white text-xl font-bold hover:bg-black/80"
                >
                    −
                </button>
            </div>

            {/* SCROLLABLE CONTAINER */}
            <div
                ref={containerRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={stopDragging}
                onMouseLeave={stopDragging}
                className={`w-full h-full overflow-auto relative select-none ${
                    dragging ? "cursor-grabbing" : "cursor-grab"
                }`}
            >
                {/* CANVAS */}
                <div
                    ref={canvasRef}
                    className="relative origin-top-left"
                    style={{
                        width: canvasWidth,
                        height: canvasHeight,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        paddingTop: 60,
                        paddingLeft: 60,
                    }}
                >
                    {/* SVG LINES */}
                    <svg
                        className="absolute top-0 left-0 pointer-events-none"
                        width={canvasWidth}
                        height={canvasHeight}
                    >
                        {positionedMatches.map((current) => {
                            if (!current.match.winnerToMatchId) return <></>;

                            const target = getMatchPosition(
                                current.match.winnerToMatchId
                            );
                            if (!target) return <></>;

                            const startX = current.x + MATCH_WIDTH;
                            const startY = current.y + MATCH_HEIGHT / 2;
                            const midX = startX + COLUMN_GAP / 2;
                            const endX = target.x;
                            const endY = target.y + MATCH_HEIGHT / 2;

                            return (
                                <path
                                    key={`${current.match.matchId}-${target.match.matchId}`}
                                    d={`M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`}
                                    stroke="#4ade80"
                                    strokeWidth="2.5"
                                    fill="none"
                                    strokeLinecap="round"
                                    opacity={0.8}
                                />
                            );
                        })}
                    </svg>

                    {/* MATCH NODES */}
                    {positionedMatches.map((item) => (
                        <div
                            key={item.match.matchId}
                            className="absolute"
                            style={{ left: item.x, top: item.y }}
                        >
                            <MatchNode match={item.match} isFinal={item.match.roundNumber === rounds[rounds.length - 1]?.round} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
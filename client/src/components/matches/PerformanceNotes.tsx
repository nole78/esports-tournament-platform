import { useEffect, useState } from "react";
import { matchApi } from "../../api_services/matches/MatchAPIService";

type PerformanceNotesProps = {
    matchId: number;
    playerId: number;
    playerName: string;
    performanceNotes: string;
    isCaptain: boolean;
    onClose: () => void;
    onSaved?: (performanceNotes: string) => void;
};

const MAX_LENGTH = 256;

export function PerformanceNotes({
    matchId,
    playerId,
    playerName,
    performanceNotes,
    isCaptain,
    onClose,
    onSaved,
}: PerformanceNotesProps) {
    const [draftNotes, setDraftNotes] = useState(performanceNotes);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDraftNotes(performanceNotes);
            setError("");
        }, 0);

    return () => clearTimeout(timeout);
    }, [performanceNotes]);

    const isDirty = draftNotes !== performanceNotes;

    const handleChange = (value: string) => {
        setError("");
        setDraftNotes(value.slice(0, MAX_LENGTH));
    };

    const handleSave = async () => {
        if (!isCaptain || !isDirty) {
            return;
        }

        setSaving(true);
        setError("");

        const response = await matchApi.changePerformanceNotes(matchId, playerId, {notes: draftNotes});

        setSaving(false);

        if (!response.success) {
            setError(response.message || "Failed to update performance notes");
            return;
        }

        onSaved?.(draftNotes);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div
                className="w-full max-w-2xl rounded-2xl border border-white/10 bg-secondary/90 p-5 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                        <p className="cursor-default text-sm text-white/60">Performance notes</p>
                        <h2 className="cursor-default text-lg font-bold text-bgsecondary">{playerName}</h2>
                    </div>
                    <button
                        type="button"
                        className="cursor-pointer rounded-lg bg-bgprimary px-3 py-1 text-sm text-primary transition-colors hover:bg-bgprimary/60"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>

                <label className="block text-sm text-white/70">
                    <span className="mb-2 block">Notes</span>
                    <textarea
                        value={draftNotes}
                        onChange={(event) => handleChange(event.target.value)}
                        disabled={!isCaptain}
                        rows={8}
                        className="w-full resize-none rounded-xl border border-white/10 bg-bgprimary/60 px-3 py-3 text-bgsecondary outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                        placeholder={isCaptain ? "Add performance notes for this player" : "Performance notes are not editable for your role"}
                    />
                </label>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="cursor-default text-sm text-white/60">
                        {draftNotes.length}/{MAX_LENGTH} characters
                    </div>

                    {isCaptain && (
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!isDirty || saving}
                            className="cursor-pointer rounded-lg bg-bgsecondary px-4 py-2 font-semibold text-bgprimary transition-colors hover:bg-bgsecondary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Change"}
                        </button>
                    )}
                </div>

                {!isCaptain && (
                    <p className="cursor-default mt-3 text-sm text-white/60">
                        Only captains can edit performance notes.
                    </p>
                )}

                {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            </div>
        </div>
    );
}

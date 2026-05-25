import { useState } from "react";
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { matchApi } from "../../api_services/matches/MatchAPIService";
import { Spinner } from "../ui/UI";
import { ProtectedRoute } from "../protected_route/ProtectedRoute";

type MatchResultProps = {
    matchId: number;
    onClose: () => void;
    onSuccess: () => void;
    initialBlue: number;
    initialRed: number;
};

export function MatchResult({
    matchId,
    onClose,
    onSuccess,
    initialBlue,
    initialRed,
}: MatchResultProps) {
    const [blueScore, setBlueScore] = useState<string>(String(initialBlue));
    const [redScore, setRedScore] = useState<string>(String(initialRed));
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    function handleInput(setter: Dispatch<SetStateAction<string>>) {
        return (event: ChangeEvent<HTMLInputElement>) => {
            const val = event.target.value.replace(/\D/g, "").slice(0, 1);
            setter(val);
        };
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        const payload = {
            teamRedScore: Number(redScore),
            teamBlueScore: Number(blueScore),
        };

        const res = await matchApi.setResult(matchId, payload);
        setLoading(false);

        if (res.success) {
            setSuccess("Result set successfully!");
            onSuccess();
            return;
        }

        setError(res.message || "Failed to set result");
    }

    return (
        <ProtectedRoute requiredRole="admin">
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">
                <div className="relative flex min-w-85 flex-col items-center rounded-2xl border border-white/10 bg-bgprimary p-8 shadow-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-3 top-3 text-xl text-white/40 transition-colors hover:text-white/80"
                    >
                        ×
                    </button>
                    <h2 className="mb-4 text-lg font-bold">Set Match Result</h2>
                    <form onSubmit={handleSubmit} className="mb-4 flex items-center gap-4">
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={blueScore}
                            onChange={handleInput(setBlueScore)}
                            className="h-12 w-12 rounded-full border border-primary bg-black/20 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-2xl font-bold">:</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={redScore}
                            onChange={handleInput(setRedScore)}
                            className="h-12 w-12 rounded-full border border-primary bg-black/20 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="ml-4 rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary/80"
                        >
                            {loading ? <Spinner size={18} /> : "Confirm"}
                        </button>
                    </form>
                    {success && <div className="mb-2 text-green-400">{success}</div>}
                    {error && <div className="mb-2 text-red-400">{error}</div>}
                </div>
            </div>
        </ProtectedRoute>
    );
}

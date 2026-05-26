import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TournamentFormat } from '../../types/tournament/TournamentFormat';
import { tournamentApi } from '../../api_services/tournament_list/TournamentAPIService';
import { ErrorBox, PageHeader } from '../ui/UI';
import { TournamentStatus } from '../../types/tournament/TournamentStatus';

export default function Settings() {
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);

    const [status, setStatus] = useState<TournamentStatus>();
    const [tournamentName, setTournamentName] = useState<string>("");
    const [format, setFormat] = useState<TournamentFormat>('single_elimination');
    const [maxTeams, setMaxTeams] = useState<string>("");
    const [applicationDeadline, setApplicationDeadline] = useState<string>("");
    const [prizeFund, setPrizeFund] = useState<string>("");

    const navigate = useNavigate();

    useEffect(() => {
    const fetchData = async () => {
      try {
        const tournamentRes = await tournamentApi.getById(Number(id));
        if (tournamentRes.success && tournamentRes.data) {
          setStatus(tournamentRes.data.tournamentStatus);
          setTournamentName(tournamentRes.data.tournamentName);
          setFormat(tournamentRes.data.tournamentFormat);
          setMaxTeams(tournamentRes.data.tournamentMaxTeams.toString());
          const date = new Date(tournamentRes.data.tournamentApplicationDeadline);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          setApplicationDeadline(`${year}-${month}-${day}`);
          setPrizeFund(tournamentRes.data.tournamentPrizeFund.toString());
        } else {
          setError("Failed to load tournament");
        }

        
      } catch (err) {
        setError("Failed to load tournament data! " + err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    const maxTeamsNum = Number(maxTeams);
    const prizeFundNum = Number(prizeFund);

    if(!tournamentName || tournamentName.trim().length === 0)
    {
        setError("Tournament name is mandatory");
        setSaving(false);
        return;
    }
    if(tournamentName.length < 3 || tournamentName.length > 120)
    {    
        setError("Tournament name must be between 3 and 120 characters long!");
        setSaving(false);
        return;
    }
    if(maxTeamsNum < 4 || maxTeamsNum > 256)
    {    
        setError("Maximum number of teams must be greater or equal to 4 and less or equal to 256")
        setSaving(false);
        return;
    }
    if(!format)
    {       
        setError("Invalid tournament format");
        setSaving(false);
        return;
    }
    if(format !== TournamentFormat.ROUND_ROBIN)
    {    
        if((maxTeamsNum & (maxTeamsNum - 1)) !== 0)
        {
            setError("Maximum number of teams must be a power of 2 (2, 4, 8, 16, 32, 64, ...) for formats other than round robin");
            setSaving(false);
            return;
        }
    }
    if(prizeFundNum <= 0)
    {    
        setError("Prize fund must be greater than 0");
        setSaving(false);
        return;
    }
    if(!applicationDeadline || new Date(applicationDeadline) <= new Date())
    {    
        setError("Application deadline must be in the future");
        setSaving(false);
        return;
    }

    const payload = {
        tournamentId: Number(id),
        tournamentName,
        tournamentFormat: format,
        tournamentMaxTeams: maxTeamsNum,
        tournamentApplicationDeadline: new Date(applicationDeadline),
        tournamentPrizeFund: prizeFundNum
    };      

    const res = await tournamentApi.update(Number(id), payload);

    setSaving(false);
    if (!res.success) {
      setError(res.message ?? "Failed to update tournament");
      return;
    }

    setSuccess(true);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this tournament? This action cannot be undone.`)) {
      return;
    }
    
    setDeleting(true);
    setError("");
    
    const res = await tournamentApi.delete(Number(id));
    
    setDeleting(false);
    if (!res.success) {
      setError(res.message ?? "Failed to delete tournament");
      return;
    }
    
    setSuccess(true);
    setTimeout(() => navigate("/admin/tournament_list"), 1500);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <p className="text-bgsecondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
    <PageHeader eyebrow="" title="Edit tournament" />      
        {error && <ErrorBox message={error} />}
        {success && (
        <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-300 text-sm px-4 py-3 rounded-xl">
            Tournament updated successfully!
        </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
                <label className="block text-xs text-bgprimary mb-2 font-medium">Tournament name</label>
                <input
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    placeholder="tournament_name"
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"
                />
            </div>

            <div>
                <label className="block text-xs text-bgprimary mb-2 font-medium">Format</label>
                <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as TournamentFormat)}
                    disabled={status === TournamentStatus.ACTIVE || status === TournamentStatus.COMPLETED}
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {Object.entries(TournamentFormat).map(([key, value]) => (
                    <option className="bg-lime-950" key={key} value={value}>
                        {key.replace(/_/g, " ")}
                    </option>
                ))}
            </select>
            {(status === TournamentStatus.ACTIVE || status === TournamentStatus.COMPLETED) && (
              <p className="text-xs text-yellow-400 mt-1">Cannot be changed after tournament has started</p>
            )}
            </div>

            <div>
                <label className="block text-xs text-bgprimary mb-2 font-medium">Maximum number of teams</label>
                <input
                    type="number"
                    value={maxTeams}
                    onChange={(e) => setMaxTeams(e.target.value)}
                    placeholder="max_teams"
                    disabled={status === TournamentStatus.ACTIVE || status === TournamentStatus.COMPLETED}
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {(status === TournamentStatus.ACTIVE || status === TournamentStatus.COMPLETED) && (
                    <p className="text-xs text-yellow-400 mt-1">Cannot be changed after tournament has started</p>
                )}
            </div>

            <div>
                <label className="block text-xs text-bgprimary mb-2 font-medium">Prize fund</label>
                <input
                    type="number"
                    value={prizeFund}
                    onChange={(e) => setPrizeFund(e.target.value)}
                    placeholder="prizeFund"
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm placeholder-bgsecondary/30 focus:outline-none focus:border-white/30 transition-colors"
                />
            </div>

            <div>
                <label className="block text-xs text-bgprimary mb-2 font-medium">Application deadline</label>
                <input
                    type="date"
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    disabled={status === TournamentStatus.ACTIVE || status === TournamentStatus.COMPLETED}
                    className="w-full bg-bgprimary/10 border border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ colorScheme: "dark" }}
                />
                {(status === TournamentStatus.ACTIVE || status === TournamentStatus.COMPLETED) && (
                    <p className="text-xs text-yellow-400 mt-1">Cannot be changed after tournament has started</p>
                )}
            </div>

            <div className="flex gap-2 mt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 cursor-pointer bg-bgprimary hover:bg-bgprimary/80 disabled:opacity-50 text-primary font-semibold rounded-xl py-3 text-sm transition-colors"
                >
                    {saving ? "Saving…" : "Save Changes"}
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 cursor-pointer bg-red-500/30 hover:bg-red-500/40 disabled:opacity-50 text-red-400 font-semibold rounded-xl py-3 text-sm transition-colors border border-red-500/50"
                >
                    {deleting ? "Deleting…" : "Delete Tournament"}
                </button>
            </div>
        </form>
        
    </div>
  );
}
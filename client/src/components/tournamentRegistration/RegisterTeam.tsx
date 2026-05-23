//import { useState } from "react";
import { PageHeader } from "../ui/UI";
//import type { TeamDto } from "../../models/team/TeamDto";

export default function RegisterTeam() {
  //const [teams, setTeams] = useState<TeamDto[]>([]);
  
  //const submit = async (e: React.FormEvent<HTMLFormElement>) => {}

  return (
    <div>
      <PageHeader eyebrow="" title="Register your team" />
      <div className="max-w-2xl">
        <form /*onSubmit={submit}*/ className="bg-primary border border-secondary/40 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Chose one of your teams</label>
            {/* <select 
              value={gameNameFilter} 
              onChange={(e) => setGameNameFilter(e.target.value)}
              className="bg-bgprimary/10 border w-1/3 border-secondary/50 rounded-xl px-4 py-3 text-bgsecondary text-sm focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50">
              <option value="" className='bg-lime-950'>
                  Any game
              </option>
              {games.map(game => (
                  <option className='bg-lime-950' key={game.gameId} value={game.gameName}>
                      {game.gameName}
                  </option>
              ))}
            </select> */}
          </div>

          <button className="w-full bg-linear-to-r from-blue-400 to-blue-600 text-white font-medium py-2 rounded-lg hover:shadow-lg hover:shadow-blue-400/30 transition-all">
            Register team
          </button>
        </form>
      </div>
    </div>
  );
}
export default function LandingPage(){

    return(
        <div className="w-1/2 justify-self-center flex flex-col justify-center">
            <div className="flex flex-col items-center gap-2">

                <span className="text-bgsecondary uppercase text-3xl font-semibold drop-shadow-lg">
                    Welcome to
                </span>

                <div className="relative font-extrabold tracking-wider">
                    <div className="absolute blur-xl opacity-90 text-7xl animate-pulse">
                        <span className="text-bgsecondary">
                            Pulse
                        </span>
                        <span className="text-bgprimary">
                            Grid
                        </span>
                    </div>
                    <div className="relative">
                        <span className="text-bgprimary text-7xl">
                            Pulse
                        </span>
                        <span className="text-bgsecondary text-7xl">
                            Grid
                        </span>
                    </div>
                </div>
            </div>
            <div className="border-3 border-t-bgprimary border-l-bgprimary border-r-bgsecondary border-b-bgsecondary shadow-[0_0_25px] shadow-bgprimary w-full rounded-full mt-8 p-25">
                <div className="text-bgsecondary text-16">
                    <div className="text-3xl border-b-2 border-bgsecondary">What is
                        <span className="text-bgprimary ml-2">
                            Pulse
                        </span>
                        <span className="text-bgsecondary">
                            Grid
                        </span>?</div>
                    <div className="mt-2 text-justify">PulseGrid is an E-sports platform built for players, teams, and tournament organizers. Explore a growing catalog of competitive games, discover active and upcoming tournaments, and follow registered teams from across the platform.
                         Create your own team, invite teammates, register for tournaments, and keep track of upcoming competitions with your personal watchlist. Whether you are a casual player or a competitive squad, PulseGrid brings the E-sports community together in one place.
                    </div>
                </div>
            </div>
        </div>
    )
}
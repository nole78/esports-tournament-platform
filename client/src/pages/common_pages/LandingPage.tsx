export default function LandingPage(){

    return(
        <div className="mx-auto flex max-w-5xl flex-col justify-center py-12 sm:py-20">
            <div className="max-w-3xl">
                <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-bgprimary">Competitive play, organized</p>
                <h1 className="text-pretty text-5xl font-black tracking-[-0.04em] text-bgsecondary sm:text-7xl">
                    Your next match starts in <span className="text-bgprimary">PulseGrid.</span>
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-bgsecondary/75">
                    A focused home for players, teams, and tournament organizers to find the games and competitions worth showing up for.
                </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {[
                    ["Discover", "Explore a growing catalog of competitive games."],
                    ["Compete", "Find active and upcoming tournaments."],
                    ["Follow", "Keep your next competitions in one watchlist."],
                ].map(([title, description]) => (
                    <article key={title} className="surface p-5">
                        <h2 className="text-lg font-bold text-bgsecondary">{title}</h2>
                        <p className="mt-2 text-sm leading-6 text-bgsecondary/65">{description}</p>
                    </article>
                ))}
            </div>
        </div>
    )
}
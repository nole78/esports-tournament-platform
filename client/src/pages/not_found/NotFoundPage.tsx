import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-primary flex items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-7xl text-secondary/20 mb-4 font-bold">404</p>
        <p className="text-secondary/60 text-sm mb-6">Page not found.</p>
        <Link to="/home" className="text-bgprimary text-sm hover:text-bgsecondary transition-colors">← Back to home</Link>
      </div>
    </main>
  );
}

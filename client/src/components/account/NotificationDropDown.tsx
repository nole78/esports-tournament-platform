import { useEffect, useRef, useState } from "react";
import TeamsInboxForm from "../../pages/user_forms/TeamsInboxForm";
import { EnvelopeOpen, EnvelopeClosed } from "../../components/heroIcons/EnvelopeIcons";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full text-white/70 transition-all duration-200 hover:bg-white/6">
        <div className="px-2 py-1 w-12 font-bold text-2xl rounded-4xl transition-all text-primary/60 hover:text-primary hover:bg-white/5 cursor-pointer">
            {open?
                <EnvelopeClosed/>:
                <EnvelopeOpen/>
            }
        </div>
      </button>
      {/* Dropdown */}
      {open && (
        <div className="absolute -right-32.5 top-14 z-50 w-76 overflow-visible rounded-3xl border-3 border-bgsecondary/10 bg-primary">
          {/* Facebook-style top arrow */}
          <div className="absolute -top-2 right-34.5 h-4 w-4 rotate-45 border-l-3 border-t-3 border-bgsecondary/10 bg-primary"/>
          {/* Header */}
          <div className="px-5 py-4 border-b-3 border-bgsecondary/10">
            <h2 className="text-xl font-bold text-secondary">
              Team Invites
            </h2>
          </div>
          {/* Scrollable content */}
          <div className="max-h-125 overflow-y-auto main-scroll">
            {/* <NotificationsPage /> */}
            <TeamsInboxForm/>
          </div>
        </div>
      )}
    </div>
  );
}
import { Home, List, Users, BarChart3 } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-4 py-2">
      <div className="flex items-center justify-around">
        <Link href="/">
          <button className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
            location === "/" ? "text-[#00D4AA]" : "text-gray-400 hover:text-[#2C3E50]"
          }`}>
            <Home size={20} />
            <span className="text-xs font-medium">Home</span>
          </button>
        </Link>
        <Link href="/activity">
          <button className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
            location === "/activity" ? "text-[#00D4AA]" : "text-gray-400 hover:text-[#2C3E50]"
          }`}>
            <List size={20} />
            <span className="text-xs">Activity</span>
          </button>
        </Link>
        <Link href="/friends">
          <button className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
            location === "/friends" ? "text-[#00D4AA]" : "text-gray-400 hover:text-[#2C3E50]"
          }`}>
            <Users size={20} />
            <span className="text-xs">Friends</span>
          </button>
        </Link>
        <button className="flex flex-col items-center space-y-1 p-2 text-gray-400 hover:text-[#2C3E50] transition-colors">
          <BarChart3 size={20} />
          <span className="text-xs">Reports</span>
        </button>
      </div>
    </nav>
  );
}

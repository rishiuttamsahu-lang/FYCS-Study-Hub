import { Home, Layers, Shield, Upload, User, Library } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

const Navbar = () => {
  const location = useLocation();
  const { isAdmin, user } = useApp();
  
  // Build nav items conditionally
  const navItems = [
    { icon: <Home size={22} />, label: "Home", path: "/" },
    { icon: <Library size={22} />, label: "Library", path: "/library" },
    ...(isAdmin ? [{ icon: <Upload size={22} />, label: "Upload", path: "/upload" }] : []),
    ...(isAdmin ? [{ icon: <Shield size={22} />, label: "Admin", path: "/admin" }] : []),
    { icon: <User size={22} />, label: "Profile", path: "/profile" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="glass-nav px-2 py-3">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive(item.path)
                ? "text-[#FFD700]"
                : "text-zinc-300 hover:text-white/80"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
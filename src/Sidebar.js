import React from 'react';
import { Link } from 'react-router-dom';
import { Target, LayoutDashboard, Users, Wallet, BarChart2, FileText, Settings, GaugeCircle, MessageSquare } from 'lucide-react';

const Sidebar = () => {
  return (
    <nav className="w-48 h-screen flex flex-col items-start py-4 px-2">
      <div className="mb-8 px-2">
        <span className="text-xl font-bold text-blue-600">MOH</span>
      </div>
      <div className="flex-1 flex flex-col space-y-2 w-full">
        <SidebarLink to="/dashboard" icon={<GaugeCircle size={20} />} label="Dashboard" />
        <SidebarLink to="/projects" icon={<LayoutDashboard size={20} />} label="Projects" />
        <SidebarLink to="/teams" icon={<Users size={20} />} label="Teams" />
        <SidebarLink to="/budgets" icon={<Wallet size={20} />} label="Budgets" />
        <SidebarLink to="/reports" icon={<BarChart2 size={20} />} label="Reports" />
        <SidebarLink to="/files" icon={<FileText size={20} />} label="Files" />
        <SidebarLink to="/chatbot" icon={<MessageSquare size={20} />} label="Chat" />
      </div>
      <div className="mt-auto w-full">
        <SidebarLink to="/settings" icon={<Settings size={20} />} label="Settings" />
      </div>
    </nav>
  );
};

const SidebarLink = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center space-x-3 text-grey-600 hover:text-blue-800 transition-colors duration-200 w-full px-2 py-2 rounded hover:bg-blue-50">
    {React.cloneElement(icon, { strokeWidth: 2.5 })}
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

export default Sidebar;
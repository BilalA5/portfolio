import { useState } from "react";

function Home() {
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("all");
  const [projects, setProjects] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('s.bilal.ahmed927@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000); 
  };



}
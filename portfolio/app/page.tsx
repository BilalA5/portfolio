import { useState } from "react";

function Home() {
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("all");
  const [projects, setProjects] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }

}
import { useState } from 'react';
import './styles/Navbar.css';

export default function Navbar() {
  const [activeTab, setActiveTab] = useState('Layout Builder');
  const [activeIcon, setActiveIcon] = useState('search');
  const [showMenu, setShowMenu] = useState(false);

  const navItems = ['Dashboard', 'Layout Builder', 'Crafted', 'Apps', 'Layouts'];
  const icons = [
    { name: 'search', symbol: '🔍' },
    { name: 'stats', symbol: '📊' },
    { name: 'grid', symbol: '🔲' },
    { name: 'moon', symbol: '🌙' },
  ];

  return (
    <div className="navbar">
      <span className="hamburger" onClick={() => setShowMenu(!showMenu)}>☰</span>

      <div className={`nav-left ${showMenu ? 'show' : ''}`}>
        {navItems.map((item) => (
          <a
            key={item}
            href="#"
            className={activeTab === item ? 'active' : ''}
            onClick={() => {
              setActiveTab(item);
              setShowMenu(false); 
            }}
          >
            {item}
          </a>
        ))}
      </div>

      <div className="nav-right">
        {icons.map((icon) => (
          <span
            key={icon.name}
            className={`icon ${activeIcon === icon.name ? 'active-icon' : ''}`}
            onClick={() => setActiveIcon(icon.name)}
          >
            {icon.symbol}
          </span>
        ))}
        <img
          src="https://randomuser.me/api/portraits/men/75.jpg"
          className="profile-pic"
          alt="Profile"
        />
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LucideIcon, ChevronDown } from 'lucide-react';

interface NavigationItem {
  icon: LucideIcon;
  label: string;
  href: string;
  dropdown?: boolean;
  dropdownItems?: Array<{
    label: string;
    href: string;
  }>;
}

interface NavigationProps {
  items: NavigationItem[];
}

export default function Navigation({ items }: NavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDropdownClick = (href: string) => {
    const [path, hash] = href.split('#');
    const categoryId = hash?.replace('category-', '');
    
    if (location.pathname === path && categoryId) {
      // If we're already on the products page, just scroll to the category
      const element = document.getElementById(`category-${categoryId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Navigate to the products page with the category in state
      navigate(path, { 
        state: { scrollToCategory: `category-${categoryId}` }
      });
    }
    
    setDropdownOpen(false);
  };

  return (
    <nav className="flex space-x-6">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <div
            key={item.href}
            className="relative"
          >
            {item.dropdown ? (
              <div>
                <Link
                  to={item.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-haleon-black bg-haleon-lime bg-opacity-10'
                      : 'text-haleon-gray-600 hover:text-haleon-black hover:bg-haleon-lime hover:bg-opacity-5'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {item.label}
                </Link>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="ml-1 p-1 rounded-full hover:bg-haleon-gray-100 transition-colors"
                  aria-label="Toggle categories dropdown"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {dropdownOpen && item.dropdownItems && item.dropdownItems.length > 0 && (
                  <>
                    {/* Invisible overlay to handle clicking outside */}
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    
                    {/* Dropdown menu */}
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                      <div className="py-1">
                        {item.dropdownItems.map((dropdownItem) => (
                          <button
                            key={dropdownItem.href}
                            onClick={() => handleDropdownClick(dropdownItem.href)}
                            className="block w-full text-left px-4 py-2 text-sm text-haleon-black hover:bg-haleon-gray-100"
                          >
                            {dropdownItem.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to={item.href}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'text-haleon-black bg-haleon-lime bg-opacity-10'
                    : 'text-haleon-gray-600 hover:text-haleon-black hover:bg-haleon-lime hover:bg-opacity-5'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
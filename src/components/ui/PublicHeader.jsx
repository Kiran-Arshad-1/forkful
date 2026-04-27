import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';


const PublicHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location?.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const isActive = (path) => location?.pathname === path;

  return (
    <>
      <header
        className={`public-header transition-shadow duration-250 ${scrolled ? 'shadow-lg' : ''}`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/vendor-login" className="public-header-logo" aria-label="ForkFul - Go to homepage">
            <img
              src="/assets/images/IG_Post-1772727015258.png"
              alt="ForkFul logo - Jamaica's food discovery platform"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Primary navigation">
            {navItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`px-4 py-2 rounded-md font-body text-sm font-medium transition-all duration-250 ${
                  isActive(item?.path)
                    ? 'text-yellow-300 bg-white/10' :'text-white/80 hover:text-yellow-300 hover:bg-white/10'
                }`}
                aria-current={isActive(item?.path) ? 'page' : undefined}
              >
                {item?.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/vendor-login')}
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-yellow-300 border border-white/30 hover:border-yellow-400 rounded-lg transition-all duration-250"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/vendor-signup')}
              className="px-4 py-2 text-sm font-bold rounded-lg transition-all duration-250 flex items-center gap-2"
              style={{ background: '#C9A84C', color: '#0F1A5C' }}
            >
              Get Started
              <Icon name="ArrowRight" size={14} color="#0F1A5C" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-md text-white/70 hover:text-yellow-300 hover:bg-white/10 transition-all duration-250"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={22} />
          </button>
        </div>
      </header>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="mobile-overlay md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            className="fixed top-16 left-0 right-0 z-navigation md:hidden"
            style={{ background: '#0F1A5C', borderBottom: '1px solid rgba(201,168,76,0.3)' }}
            role="dialog"
            aria-label="Mobile navigation menu"
          >
            <nav className="flex flex-col p-4 gap-1" role="navigation">
              {navItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md font-body text-sm font-medium transition-all duration-250 min-h-[44px] ${
                    isActive(item?.path)
                      ? 'text-yellow-300 bg-white/10' :'text-white/70 hover:text-yellow-300 hover:bg-white/10'
                  }`}
                  aria-current={isActive(item?.path) ? 'page' : undefined}
                >
                  {item?.label}
                </Link>
              ))}
              <div className="mt-2 pt-3 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(201,168,76,0.3)' }}>
                <button
                  onClick={() => navigate('/vendor-login')}
                  className="w-full py-2.5 text-sm font-medium text-white border rounded-lg transition-all duration-250"
                  style={{ borderColor: 'rgba(201,168,76,0.5)' }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/vendor-signup')}
                  className="w-full py-2.5 text-sm font-bold rounded-lg transition-all duration-250"
                  style={{ background: '#C9A84C', color: '#0F1A5C' }}
                >
                  Get Started Free
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default PublicHeader;
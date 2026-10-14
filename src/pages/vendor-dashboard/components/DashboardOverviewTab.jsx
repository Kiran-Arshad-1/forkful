import React from 'react';
import Icon from 'components/AppIcon';

const DashboardOverviewTab = ({
  hasBusiness = false,
  businessCount = 0,
  approvalStatus = 'pending',
  onNavigateToTab,
  onAddBusiness,
}) => {
  return (
    <div className="w-full space-y-6 lg:space-y-8">
      {/* 2-Column Main Layout: Left Content (70%) + Right Sidebar (30%) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left / Center Main Content */}
        <div className="xl:col-span-8 space-y-6">
          {/* Welcome Hero Banner */}
          <div
            className="relative rounded-3xl p-6 sm:p-8 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0A2463 0%, #061538 100%)', // Royal Navy to Deep Navy
              border: '1px solid #1D4ED8', // Blue Border
              boxShadow: '0 16px 36px -12px rgba(6, 21, 56, 0.8)',
            }}
          >
            {/* Background decorative glows */}
            <div
              className="absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none blur-3xl"
              style={{ background: 'rgba(251, 195, 59, 0.12)' }}
            />
            <div
              className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full pointer-events-none blur-3xl"
              style={{ background: 'rgba(10, 36, 99, 0.5)' }}
            />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-md space-y-3">
                <span
                  className="inline-block text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{
                    background: '#3C351E', // Gold Tint
                    color: '#FBC33B', // ForkFul Gold
                    border: '1px solid #FBC33B',
                  }}
                >
                  Welcome to ForkFul
                </span>
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                  Let’s Get Your Restaurant On The Map!
                </h1>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#DCE6FF' }}>
                  {hasBusiness
                    ? 'Your restaurant is on ForkFul! Manage your menu, photos, and reviews below to keep your listing fresh and attractive.'
                    : "You're all set! Now it's time to add your business details and start reaching hungry customers."}
                </p>
              </div>

              {/* Storefront Graphic / Illustration */}
              <div className="flex-shrink-0 w-36 h-36 sm:w-44 sm:h-44 relative flex items-center justify-center">
                <div
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl flex items-center justify-center shadow-2xl relative"
                  style={{
                    background: '#3C351E',
                    border: '2px solid #FBC33B',
                  }}
                >
                  <Icon name="Store" size={56} color="#FBC33B" />
                  <div
                    className="absolute -top-3 -right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: '#FBC33B', color: '#061538' }}
                  >
                    <Icon name="MapPin" size={18} color="#061538" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Setup Progress Stepper (Informational Roadmap) */}
          <div
            className="rounded-2xl p-5 sm:p-6"
            style={{
              background: '#0D2F83', // Royal Blue
              border: '1px solid #1D4ED8', // Blue Border
            }}
          >
            <div className="mb-4">
              <h3 className="text-base font-bold text-white">Your Setup Progress</h3>
              <p className="text-xs" style={{ color: '#9FB5F5' }}>
                Complete these steps to get your restaurant live.
              </p>
            </div>

            {/* Stepper items (Informational only - non-clickable) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {[
                { step: 1, title: 'Add Business Details' },
                { step: 2, title: 'Add Menu Items' },
                { step: 3, title: 'Upload Photos & Gallery' },
                { step: 4, title: 'Wait for Admin Approval' },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex flex-col gap-2 p-3 rounded-xl select-none"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={
                        item.step === 1
                          ? { background: '#FBC33B', color: '#061538' } // Step 1 Highlight
                          : { background: '#0A2463', color: '#9FB5F5', border: '1px solid #254477' }
                      }
                    >
                      {item.step}
                    </div>
                    <div
                      className="flex-1 h-0.5 rounded-full"
                      style={{
                        background: '#254477',
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-white mt-1">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white">Quick Actions</h3>
            <p className="text-xs" style={{ color: '#9FB5F5' }}>
              Start setting up your restaurant in just a few clicks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Card 1: Business */}
              <div
                className="flex flex-col justify-between p-4 rounded-2xl"
                style={{
                  background: '#0D2F83', // Royal Blue
                  border: '1px solid #1D4ED8', // Blue Border
                }}
              >
                <div>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background: '#3C351E',
                      border: '1px solid #FBC33B',
                    }}
                  >
                    <Icon name="Store" size={18} color="#FBC33B" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {hasBusiness ? 'Your Businesses' : 'Add First Business'}
                  </h4>
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#DCE6FF' }}>
                    {hasBusiness
                      ? 'Manage location, contacts, and opening hours.'
                      : 'Register your restaurant or café with complete details.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (hasBusiness) {
                      onNavigateToTab('business-profile');
                    } else {
                      onAddBusiness();
                    }
                  }}
                  className="mt-4 w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all hover:brightness-110 shadow-md active:scale-95"
                  style={{
                    background: '#FBC33B', // ForkFul Gold
                    color: '#061538', // Deep Navy
                  }}
                >
                  <Icon name="Plus" size={14} color="#061538" strokeWidth={2.5} />
                  <span>{hasBusiness ? 'Manage Business' : '+ Add Business'}</span>
                </button>
              </div>

              {/* Card 2: Menu */}
              <div
                className="flex flex-col justify-between p-4 rounded-2xl"
                style={{
                  background: '#0D2F83', // Royal Blue
                  border: '1px solid #1D4ED8', // Blue Border
                }}
              >
                <div>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background: '#3C351E',
                      border: '1px solid #FBC33B',
                    }}
                  >
                    <Icon name="Utensils" size={18} color="#FBC33B" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Manage Menu</h4>
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#DCE6FF' }}>
                    Add dishes, prices and categories for your restaurant.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTab('menu')}
                  className="mt-4 w-full py-2 px-3 rounded-xl text-xs font-semibold text-white transition-all hover:bg-[#17439B]"
                  style={{
                    background: '#123B96', // Bright Navy Blue
                    border: '1px solid #254477',
                  }}
                >
                  <span>Manage Menu</span>
                </button>
              </div>

              {/* Card 3: Photos */}
              <div
                className="flex flex-col justify-between p-4 rounded-2xl"
                style={{
                  background: '#0D2F83', // Royal Blue
                  border: '1px solid #1D4ED8', // Blue Border
                }}
              >
                <div>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background: '#3C351E',
                      border: '1px solid #FBC33B',
                    }}
                  >
                    <Icon name="Camera" size={18} color="#FBC33B" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Upload Photos</h4>
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#DCE6FF' }}>
                    Showcase your restaurant with high-quality photos.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTab('photos')}
                  className="mt-4 w-full py-2 px-3 rounded-xl text-xs font-semibold text-white transition-all hover:bg-[#17439B]"
                  style={{
                    background: '#123B96', // Bright Navy Blue
                    border: '1px solid #254477',
                  }}
                >
                  <span>Upload Photos</span>
                </button>
              </div>

              {/* Card 4: Approval Status */}
              <div
                className="flex flex-col justify-between p-4 rounded-2xl"
                style={{
                  background: '#0D2F83', // Royal Blue
                  border: '1px solid #1D4ED8', // Blue Border
                }}
              >
                <div>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background: '#3C351E',
                      border: '1px solid #FBC33B',
                    }}
                  >
                    <Icon name="ShieldCheck" size={18} color="#FBC33B" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Track Approval</h4>
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#DCE6FF' }}>
                    Check the status of your business approval from admin.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTab('business-profile')}
                  className="mt-4 w-full py-2 px-3 rounded-xl text-xs font-semibold text-white transition-all hover:bg-[#17439B]"
                  style={{
                    background: '#123B96', // Bright Navy Blue
                    border: '1px solid #254477',
                  }}
                >
                  <span>Check Status</span>
                </button>
              </div>
            </div>
          </div>

          {/* Need Help Banner */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl gap-4"
            style={{
              background: '#0A2463', // Royal Navy
              border: '1px solid #1D4ED8', // Blue Border
            }}
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: '#3C351E',
                  border: '1px solid #FBC33B',
                }}
              >
                <Icon name="HelpCircle" size={20} color="#FBC33B" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Need Help Getting Started?</h4>
                <p className="text-xs" style={{ color: '#9FB5F5' }}>
                  Our support team is here to help you set up your restaurant and answer any questions.
                </p>
              </div>
            </div>
            <a
              href="mailto:support@forkful.com"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#17439B] transition-all flex-shrink-0"
              style={{
                border: '1px solid #FBC33B',
                color: '#FBC33B',
              }}
            >
              <span>Contact Support</span>
              <Icon name="ArrowRight" size={13} color="#FBC33B" />
            </a>
          </div>
        </div>

        {/* Right Column: Why Add Your Business & Inspiration */}
        <div className="xl:col-span-4 space-y-6">
          {/* Card: Why Add Your Business? */}
          <div
            className="rounded-2xl p-6 space-y-5"
            style={{
              background: '#0D2F83', // Royal Blue
              border: '1px solid #1D4ED8', // Blue Border
            }}
          >
            <h3 className="text-base font-bold text-white">Why Add Your Business?</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: '#3C351E',
                    border: '1px solid #FBC33B',
                  }}
                >
                  <Icon name="Users" size={17} color="#FBC33B" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Reach more customers</h4>
                  <p className="text-xs mt-0.5" style={{ color: '#9FB5F5' }}>
                    Get discovered by food lovers in your area and boost your visibility.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: '#3C351E',
                    border: '1px solid #FBC33B',
                  }}
                >
                  <Icon name="Sliders" size={17} color="#FBC33B" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Manage everything</h4>
                  <p className="text-xs mt-0.5" style={{ color: '#9FB5F5' }}>
                    Update menu, photos, hours and reviews — all in one single place.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: '#3C351E',
                    border: '1px solid #FBC33B',
                  }}
                >
                  <Icon name="TrendingUp" size={17} color="#FBC33B" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Grow your revenue</h4>
                  <p className="text-xs mt-0.5" style={{ color: '#9FB5F5' }}>
                    More visibility means more orders, food trail stops, and bookings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Need Inspiration? */}
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{
              background: '#0D2F83', // Royal Blue
              border: '1px solid #1D4ED8', // Blue Border
            }}
          >
            <div className="flex items-center gap-2">
              <Icon name="Lightbulb" size={18} color="#FBC33B" />
              <h3 className="text-base font-bold text-white">Need Inspiration?</h3>
            </div>

            <div className="h-32 rounded-xl overflow-hidden relative shadow-inner" style={{ border: '1px solid #254477' }}>
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"
                alt="Restaurant dining atmosphere"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, #0D2F83 0%, transparent 70%)' }}
              />
            </div>

            <p className="text-xs leading-relaxed" style={{ color: '#DCE6FF' }}>
              Create a great profile with high-quality photos, clear menu and accurate details to attract more customers.
            </p>

            <button
              onClick={() => onNavigateToTab('photos')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#17439B] transition-all"
              style={{
                border: '1px solid #FBC33B',
                color: '#FBC33B',
              }}
            >
              <span>View Best Practices</span>
              <Icon name="ArrowRight" size={13} color="#FBC33B" />
            </button>
          </div>

          {/* Card: Questions? */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center text-center space-y-3"
            style={{
              background: '#0D2F83', // Royal Blue
              border: '1px solid #1D4ED8', // Blue Border
            }}
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{
                background: '#3C351E',
                border: '1px solid #FBC33B',
              }}
            >
              <Icon name="Headphones" size={20} color="#FBC33B" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Questions?</h4>
              <p className="text-xs mt-1" style={{ color: '#9FB5F5' }}>Our support team is ready to help.</p>
            </div>
            <a
              href="mailto:support@forkful.com"
              className="w-full py-2 px-4 rounded-xl text-xs font-bold text-white hover:bg-[#17439B] transition-all block text-center"
              style={{
                background: '#123B96', // Bright Navy Blue
                border: '1px solid #254477',
              }}
            >
              Get Help
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewTab;

'use client'

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* TOP STATS GRID - 4 cards */}
        <section className="grid grid-cols-4 gap-4">
          {/* Card 1: Enrolled Courses */}
          <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition">
            <div className="bg-orange-100 rounded-xl p-3 flex-shrink-0">
              <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">957</p>
              <p className="text-xs text-gray-500">Enrolled Courses</p>
            </div>
          </div>

          {/* Card 2: Active Courses */}
          <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition">
            <div className="bg-blue-100 rounded-xl p-3 flex-shrink-0">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12m-1 0a6 6 0 018.5-8.5M9 12l5.5-5.5m1 0a6 6 0 01-8.5 8.5" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">19</p>
              <p className="text-xs text-gray-500">Active Courses</p>
            </div>
          </div>

          {/* Card 3: Course Instructors */}
          <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition">
            <div className="bg-amber-100 rounded-xl p-3 flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.314 0-6 1.343-6 3v2h12v-2c0-1.657-2.686-3-6-3z"/>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">241</p>
              <p className="text-xs text-gray-500">Course Instructors</p>
            </div>
          </div>

          {/* Card 4: Completed Courses */}
          <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition">
            <div className="bg-green-100 rounded-xl p-3 flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">951</p>
              <p className="text-xs text-gray-500">Completed Courses</p>
            </div>
          </div>
        </section>

        {/* SECOND STATS ROW - 4 cards */}
        <section className="grid grid-cols-4 gap-4">
          {/* Card 1: Students */}
          <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition">
            <div className="bg-red-100 rounded-xl p-3 flex-shrink-0">
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" fill="currentColor"/>
                <path d="M4 14c0-2.21 3.58-4 8-4s8 1.79 8 4v4H4v-4z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">1,674,767</p>
              <p className="text-xs text-gray-500">Students</p>
            </div>
          </div>

          {/* Card 2: Online Courses */}
          <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition">
            <div className="bg-lime-100 rounded-xl p-3 flex-shrink-0">
              <svg className="w-6 h-6 text-lime-600" fill="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-xs text-gray-500">Online Courses</p>
            </div>
          </div>

          {/* Card 3: USD Total Earning */}
          <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition">
            <div className="bg-slate-100 rounded-xl p-3 flex-shrink-0">
              <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 11h20" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">$7,461,767</p>
              <p className="text-xs text-gray-500">USD Total Earning</p>
            </div>
          </div>

          {/* Card 4: Course Sold */}
          <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition">
            <div className="bg-purple-100 rounded-xl p-3 flex-shrink-0">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">56,489</p>
              <p className="text-xs text-gray-500">Course Sold</p>
            </div>
          </div>
        </section>

        {/* PROFILE SECTION */}
        <section className="bg-gray-400 rounded-2xl p-6 flex items-center justify-between">
          {/* Left side - Profile */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex-shrink-0 overflow-hidden border-2 border-white">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop" alt="Anas" className="w-full h-full object-cover" />
            </div>
            <div className="text-white">
              <p className="font-bold text-sm">Anas Moudnib</p>
              <p className="text-xs opacity-90">Anas.Moudnib@gmail.com</p>
            </div>
          </div>

          {/* Middle - Progress */}
          <div className="flex items-center gap-3 flex-1 mx-8">
            <span className="text-white text-xs font-medium whitespace-nowrap">1/4 Steps</span>
            <div className="flex-1 bg-gray-300 rounded-full h-2 overflow-hidden">
              <div className="bg-yellow-400 h-full w-1/4"></div>
            </div>
            <span className="text-white text-xs font-medium whitespace-nowrap">25% Completed</span>
          </div>

          {/* Right side - Buttons */}
          <div className="flex items-center gap-2">
            <button className="bg-yellow-400 text-gray-900 font-semibold px-5 py-2 rounded-lg hover:bg-yellow-500 transition text-sm">
              Edit Biography
            </button>
            <button className="text-white hover:opacity-75 transition p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              </svg>
            </button>
          </div>
        </section>

        {/* MAIN CONTENT GRID - Recent Courses, Create, Scheduled */}
        <section className="grid grid-cols-3 gap-6">
          {/* LEFT: Recent Courses Results with Pie Chart */}
          <div className="col-span-2 bg-white rounded-2xl p-6 border-l-4 border-yellow-400 shadow-sm">
            <h3 className="font-bold text-base mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gray-900 rounded-full"></span>
              Recent Courses results
            </h3>

            <div className="grid grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="flex items-center justify-center h-56">
                <svg viewBox="0 0 100 100" className="w-40 h-40">
                  {/* Orange segment */}
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#F97316" strokeWidth="14" strokeDasharray="55.3 251.3" transform="rotate(-90 50 50)" />
                  {/* Green segment */}
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#10B981" strokeWidth="14" strokeDasharray="32.9 251.3" strokeDashoffset="-55.3" transform="rotate(-90 50 50)" />
                  {/* Pink segment */}
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#EC4899" strokeWidth="14" strokeDasharray="18.7 251.3" strokeDashoffset="-88.2" transform="rotate(-90 50 50)" />
                  {/* Cyan segment */}
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#06B6D4" strokeWidth="14" strokeDasharray="25.1 251.3" strokeDashoffset="-106.9" transform="rotate(-90 50 50)" />
                  {/* Yellow segment */}
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#FCD34D" strokeWidth="14" strokeDasharray="3.8 251.3" strokeDashoffset="-132" transform="rotate(-90 50 50)" />
                  {/* Gray segment */}
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#D1D5DB" strokeWidth="14" strokeDasharray="115.9 251.3" strokeDashoffset="-135.8" transform="rotate(-90 50 50)" />
                </svg>
              </div>

              {/* Legend and Stats */}
              <div className="space-y-3">
                {[
                  { color: 'bg-orange-500', text: '220 students', desc: '19% Students passing with A grade' },
                  { color: 'bg-teal-600', text: '130 students', desc: '19% Students passing with B grade' },
                  { color: 'bg-pink-400', text: '70 students', desc: '19% Students passing with C grade' },
                  { color: 'bg-cyan-500', text: '89 students', desc: '19% Students passing with D grade' },
                  { color: 'bg-yellow-300', text: '12 students', desc: '19% Students failing the test' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 ${item.color} rounded-sm`}></div>
                      <span className="text-sm text-gray-700">{item.text}</span>
                    </div>
                    <p className="text-xs text-gray-400 ml-5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats at bottom */}
            <div className="border-t border-gray-200 mt-6 pt-6 flex gap-12">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">1381</p>
                <p className="text-xs text-gray-500">Students attended the test</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">92</p>
                <p className="text-xs text-gray-500">Students didn&apos;t attend the test</p>
              </div>
            </div>

            {/* Bottom border */}
            <div className="border-b-4 border-yellow-400 mt-6 -mx-6 -mb-6"></div>
          </div>

          {/* RIGHT: Create Section */}
          <div className="space-y-6">
            {/* Create Card */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <h3 className="font-bold text-base mb-4">Create</h3>
              <div className="bg-yellow-100 rounded-xl p-8 mb-4 flex items-center justify-center h-24">
                <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                  <path d="M12 9v6M9 12h6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <button className="w-full bg-yellow-400 text-gray-900 font-semibold py-2.5 rounded-full hover:bg-yellow-500 transition text-sm">
                Create test
              </button>
            </div>

            {/* Scheduled Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-base mb-6 text-center">Scheduled</h3>
              <div className="flex justify-center gap-3 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">00</p>
                  <p className="text-xs text-gray-500">hr</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">:</p>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">42</p>
                  <p className="text-xs text-gray-500">min</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">:</p>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">10</p>
                  <p className="text-xs text-gray-500">sec</p>
                </div>
              </div>
              <div className="text-center mb-6">
                <p className="font-semibold text-sm text-gray-900">Geography</p>
                <p className="text-xs text-gray-500">Created on: 12 May,24</p>
              </div>
              <button className="w-full bg-yellow-400 text-gray-900 font-semibold py-2.5 rounded-full hover:bg-yellow-500 transition text-sm">
                Set another
              </button>
            </div>
          </div>
        </section>

        {/* BOTTOM SECTION - Course Rating, Profile View, Revenue */}
        <section className="grid grid-cols-3 gap-6">
          {/* Overall Course Rating */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-base">Overall Course Rating</h3>
              <div className="relative">
                <select className="text-xs text-gray-600 border border-gray-200 rounded px-2 py-1 bg-white cursor-pointer appearance-none pr-6">
                  <option>This week</option>
                  <option>This month</option>
                  <option>All time</option>
                </select>
                <svg className="absolute right-1.5 top-1.5 w-4 h-4 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              {/* Rating Box */}
              <div className="bg-yellow-300 rounded-lg p-4 text-center min-w-28">
                <p className="text-4xl font-bold text-gray-900">4.6</p>
                <p className="text-xs text-gray-800 font-medium mt-2">Overall Rating</p>
              </div>

              {/* Line Chart */}
              <div className="flex-1 relative h-28">
                <svg viewBox="0 0 300 100" className="w-full h-full" preserveAspectRatio="none">
                  <polyline
                    points="0,60 20,50 40,55 60,45 80,50 100,40 120,45 140,35 160,40 180,30 200,35 220,25 240,30 260,20 280,25 300,15"
                    fill="none"
                    stroke="#FCD34D"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                  <polyline
                    points="0,100 20,50 40,55 60,45 80,50 100,40 120,45 140,35 160,40 180,30 200,35 220,25 240,30 260,20 280,25 300,15"
                    fill="#FEF3C7"
                    opacity="0.3"
                  />
                </svg>
              </div>
            </div>

            {/* Star Ratings */}
            <div className="space-y-2.5 border-t border-gray-200 pt-4">
              {[
                { stars: 5, percent: 56 },
                { stars: 4, percent: 37 },
                { stars: 3, percent: 8 },
                { stars: 2, percent: 1 },
                { stars: 1, percent: '<1' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex text-yellow-400 w-20">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className="text-lg">{j < item.stars ? '★' : '☆'}</span>
                    ))}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-yellow-400 h-full" style={{ width: `${item.percent}%` }}></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 w-8 text-right">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Profile View - Bar Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-base">Profile View</h3>
              <div className="relative">
                <select className="text-xs text-gray-600 border border-gray-200 rounded px-2 py-1 bg-white cursor-pointer appearance-none pr-6">
                  <option>Today</option>
                  <option>Yesterday</option>
                  <option>This week</option>
                </select>
                <svg className="absolute right-1.5 top-1.5 w-4 h-4 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
              </div>
            </div>

            <div className="h-56 flex items-end justify-center gap-1">
              {[30, 50, 40, 60, 45, 35, 55, 50, 40, 60, 35, 25].map((height, i) => (
                <div key={i} className="flex-1 bg-gray-200 rounded-sm hover:bg-yellow-300 transition" style={{ height: `${height}%` }}></div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-2xl font-bold text-gray-900">$7,443</p>
              <p className="text-xs text-gray-500">USD Dollar you earned.</p>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base mb-6">Revenue</h3>

            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-gray-900">$165,750.23</p>
              <p className="text-xs text-gray-500 mt-2">Won from 262 Deals</p>
            </div>

            {/* Map Illustration */}
            <div className="h-32 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 150 80" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FBBF24" stopOpacity="1" />
                    <stop offset="100%" stopColor="#D97706" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <path
                  d="M 45 20 L 60 18 L 75 22 L 78 25 L 75 30 L 70 32 L 65 35 L 60 38 L 55 40 L 50 38 L 48 35 L 45 32 Z M 55 42 L 65 45 L 60 50 L 50 48 Z"
                  fill="url(#mapGradient)"
                />
              </svg>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

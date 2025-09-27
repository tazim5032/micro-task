import { useState, useEffect } from "react";
import {
  Crown,
  Coins,
  CheckCircle,
  TrendingUp,
  Medal,
  Star,
} from "lucide-react";

// Enhanced dummy data with avatars
const topEarnersData = [
  {
    id: 1,
    name: "John Doe",
    avatar: "JD",
    coins: 500,
    tasksCompleted: 15,
    rank: 1,
    gradient: "from-yellow-400 to-orange-500",
    bgGradient: "from-yellow-50 to-orange-50",
    badge: "Gold Elite",
    growth: "+12%",
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "JS",
    coins: 480,
    tasksCompleted: 14,
    rank: 2,
    gradient: "from-gray-300 to-gray-500",
    bgGradient: "from-gray-50 to-gray-100",
    badge: "Silver Pro",
    growth: "+8%",
  },
  {
    id: 3,
    name: "Alice Johnson",
    avatar: "AJ",
    coins: 460,
    tasksCompleted: 13,
    rank: 3,
    gradient: "from-amber-600 to-yellow-700",
    bgGradient: "from-amber-50 to-yellow-50",
    badge: "Bronze Star",
    growth: "+15%",
  },
  {
    id: 4,
    name: "Bob Brown",
    avatar: "BB",
    coins: 440,
    tasksCompleted: 12,
    rank: 4,
    gradient: "from-blue-500 to-indigo-600",
    bgGradient: "from-blue-50 to-indigo-50",
    badge: "Rising Star",
    growth: "+20%",
  },
  {
    id: 5,
    name: "Emma Wilson",
    avatar: "EW",
    coins: 420,
    tasksCompleted: 11,
    rank: 5,
    gradient: "from-purple-500 to-pink-600",
    bgGradient: "from-purple-50 to-pink-50",
    badge: "Achiever",
    growth: "+10%",
  },
  {
    id: 6,
    name: "Michael Lee",
    avatar: "ML",
    coins: 400,
    tasksCompleted: 10,
    rank: 6,
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-50 to-teal-50",
    badge: "Newcomer",
    growth: "+25%",
  },
];

const TopEarners = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedCoins, setAnimatedCoins] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate coin counts
          topEarnersData.forEach((earner, index) => {
            setTimeout(() => {
              let currentCoins = 0;
              const increment = earner.coins / 30;
              const timer = setInterval(() => {
                currentCoins += increment;
                if (currentCoins >= earner.coins) {
                  currentCoins = earner.coins;
                  clearInterval(timer);
                }
                setAnimatedCoins((prev) => ({
                  ...prev,
                  [earner.id]: Math.floor(currentCoins),
                }));
              }, 50);
            }, index * 100);
          });
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("top-earners-section");
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-6 h-6 text-blue-500" />;
    }
  };

  return (
    <section
      id="top-earners-section"
      className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section header */}
        <div
          className={`text-center mb-20 transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent">
              Top
            </span>
            <span className="block bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Earners
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Meet our highest performing community members and get inspired by
            their success stories
          </p>
        </div>

        {/* Top 3 Featured Section */}
        <div className="mb-16">
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-8 transform transition-all duration-1000 delay-300 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            {topEarnersData.slice(0, 3).map((earner, index) => (
              <div
                key={earner.id}
                className={`relative group transform transition-all duration-500 hover:scale-105 ${
                  index === 0
                    ? "md:-translate-y-4"
                    : index === 1
                    ? "md:-translate-y-2"
                    : ""
                }`}
                onMouseEnter={() => setHoveredCard(earner.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Rank badge */}
                <div
                  className={`absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 p-3 rounded-2xl bg-gradient-to-r ${earner.gradient} shadow-lg`}
                >
                  {getRankIcon(earner.rank)}
                </div>

                {/* Card */}
                <div
                  className={`
                  relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 pt-12 shadow-lg border border-white/50
                  hover:shadow-2xl transition-all duration-500
                  ${
                    hoveredCard === earner.id ? "ring-2 ring-yellow-500/20" : ""
                  }
                `}
                >
                  {/* Gradient overlay */}
                  <div
                    className={`
                    absolute inset-0 bg-gradient-to-br ${earner.bgGradient} rounded-3xl opacity-0 
                    group-hover:opacity-100 transition-opacity duration-500
                  `}
                  ></div>

                  {/* Content */}
                  <div className="relative z-10 text-center">
                    {/* Avatar */}
                    <div
                      className={`
                      relative mx-auto w-24 h-24 rounded-full bg-gradient-to-r ${
                        earner.gradient
                      } 
                      flex items-center justify-center text-white font-bold text-2xl mb-6
                      shadow-lg transform transition-all duration-500
                      ${hoveredCard === earner.id ? "scale-110 rotate-3" : ""}
                    `}
                    >
                      {earner.avatar}

                      {/* Rank number */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-slate-900 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                        #{earner.rank}
                      </div>
                    </div>

                    {/* Name and badge */}
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {earner.name}
                    </h3>
                    <div
                      className={`inline-flex px-3 py-1 rounded-full bg-gradient-to-r ${earner.gradient} text-white text-sm font-semibold mb-6`}
                    >
                      {earner.badge}
                    </div>

                    {/* Stats */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-white/50 rounded-2xl p-4">
                        <div className="flex items-center space-x-3">
                          <Coins className="w-5 h-5 text-yellow-600" />
                          <span className="font-semibold text-slate-700">
                            Coins
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900">
                            {animatedCoins[earner.id] || 0}
                          </div>
                          <div className="text-sm text-emerald-600 font-semibold">
                            {earner.growth} this month
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-white/50 rounded-2xl p-4">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                          <span className="font-semibold text-slate-700">
                            Tasks
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                          {earner.tasksCompleted}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Glow effect */}
                  <div
                    className={`
                    absolute inset-0 rounded-3xl bg-gradient-to-r ${earner.gradient} opacity-0 
                    group-hover:opacity-20 transition-opacity duration-500 -z-10 blur-xl
                  `}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Remaining earners */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transform transition-all duration-1000 delay-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {topEarnersData.slice(3).map((earner) => (
            <div
              key={earner.id}
              className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              onMouseEnter={() => setHoveredCard(earner.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div
                  className={`
                  w-16 h-16 rounded-full bg-gradient-to-r ${earner.gradient} 
                  flex items-center justify-center text-white font-bold text-lg
                  shadow-md transform transition-all duration-300
                  ${hoveredCard === earner.id ? "scale-110" : ""}
                `}
                >
                  {earner.avatar}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900">{earner.name}</h4>
                    <div className="flex items-center space-x-1">
                      {getRankIcon(earner.rank)}
                      <span className="text-sm font-semibold text-slate-600">
                        #{earner.rank}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Coins className="w-4 h-4" />
                      <span>{animatedCoins[earner.id] || 0} coins</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>{earner.tasksCompleted} tasks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`
          text-center mt-20 transform transition-all duration-1000 delay-700
          ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
        `}
        >
          <div className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-gradient-to-r from-yellow-50 to-orange-50 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Ready to Join the Leaderboard?
              </h3>
              <p className="text-slate-600">
                Start completing tasks and climb your way to the top!
              </p>
            </div>
            <button className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-yellow-700 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 shadow-lg">
              <TrendingUp className="w-5 h-5" />
              <span>Start Earning</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopEarners;

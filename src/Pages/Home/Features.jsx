import { useState, useEffect } from "react";
import {
  Coins,
  CheckSquare,
  Shield,
  Clock,
  Star,
  Headphones,
  ArrowUpRight,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Coins,
    title: "Earn Coins by Completing Tasks",
    description:
      "Complete diverse tasks and earn coins that convert into real money. Maximize your earnings with our rewarding platform.",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
    stat: "2.5M+ coins earned",
    delay: 0,
  },
  {
    icon: CheckSquare,
    title: "Create and Manage Tasks",
    description:
      "Post and manage tasks effortlessly with our intuitive interface. Set deadlines, track progress, and achieve results.",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50",
    stat: "50K+ tasks created",
    delay: 0.1,
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description:
      "Protected transactions with our advanced security system. Your earnings are safe, secure, and delivered promptly.",
    gradient: "from-red-500 to-pink-500",
    bgGradient: "from-red-50 to-pink-50",
    stat: "99.9% security rate",
    delay: 0.2,
  },
  {
    icon: Clock,
    title: "Flexible Work Opportunities",
    description:
      "Work on your terms with flexible scheduling. Choose tasks that fit your lifestyle and availability perfectly.",
    gradient: "from-purple-500 to-indigo-500",
    bgGradient: "from-purple-50 to-indigo-50",
    stat: "24/7 availability",
    delay: 0.3,
  },
  {
    icon: Star,
    title: "Quality Assurance",
    description:
      "Our comprehensive rating system ensures reliable partnerships and maintains the highest quality standards.",
    gradient: "from-yellow-500 to-orange-500",
    bgGradient: "from-yellow-50 to-orange-50",
    stat: "4.8/5 avg rating",
    delay: 0.4,
  },
  {
    icon: Headphones,
    title: "24/7 Expert Support",
    description:
      "Round-the-clock assistance from our dedicated support team. Get help whenever you need it, wherever you are.",
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-50 to-rose-50",
    stat: "< 2min response",
    delay: 0.5,
  },
];

const Features = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("features-section");
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  return (
    <div
      id="features-section"
      className="relative bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 py-24 overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section header */}
        <div
          className={`text-center mb-20 transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent">
              Platform Key
            </span>
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Discover powerful features designed to maximize your earning
            potential and streamline your workflow
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={index}
                className={`group relative transform transition-all duration-700 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                }`}
                style={{
                  transitionDelay: isVisible ? `${feature.delay}s` : "0s",
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Feature card */}
                <div
                  className={`
                  relative h-full bg-white/70 backdrop-blur-sm rounded-3xl p-8 
                  border border-white/50 shadow-lg hover:shadow-2xl
                  transform transition-all duration-500 hover:scale-105 hover:-translate-y-2
                  ${isHovered ? "ring-2 ring-blue-500/20" : ""}
                `}
                >
                  {/* Gradient overlay */}
                  <div
                    className={`
                    absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-0 
                    group-hover:opacity-100 transition-opacity duration-500
                  `}
                  ></div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon container */}
                    <div
                      className={`
                      inline-flex p-4 rounded-2xl mb-6 shadow-lg transform transition-all duration-500
                      bg-gradient-to-r ${feature.gradient}
                      ${isHovered ? "scale-110 rotate-3" : ""}
                    `}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-slate-800 transition-colors">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 leading-relaxed mb-6 group-hover:text-slate-700 transition-colors">
                      {feature.description}
                    </p>

                    {/* Stats and CTA */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient} animate-pulse`}
                        ></div>
                        <span className="text-sm font-semibold text-slate-700">
                          {feature.stat}
                        </span>
                      </div>

                      <div
                        className={`
                        p-2 rounded-xl bg-gradient-to-r ${feature.gradient} opacity-0 
                        group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0
                        transition-all duration-300 cursor-pointer
                      `}
                      >
                        <ArrowUpRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Hover effect border */}
                  <div
                    className={`
                    absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-0 
                    group-hover:opacity-20 transition-opacity duration-500 -z-10 blur-xl
                  `}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA section */}
        <div
          className={`
          text-center mt-20 transform transition-all duration-1000 delay-700
          ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
        `}
        >
          <div className="inline-flex items-center space-x-6 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="text-left">
              <h3 className="text-xl font-bold text-slate-900">
                Ready to get started?
              </h3>
              <p className="text-slate-600">
                Join thousands already earning on our platform
              </p>
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 shadow-lg">
              <span>Start Earning</span>
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;

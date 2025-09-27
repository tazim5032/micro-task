import { useState, useEffect } from 'react';
import { Clock, DollarSign, Briefcase, Users, Star, ArrowRight } from 'lucide-react';

const ModernHeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const slides = [
    {
      id: 1,
      title: "Time is Money",
      subtitle: "Maximize Your Earnings",
      description: "Timeliness is key to earning more on our platform. Build your reputation for reliability and unlock opportunities for higher pay rates.",
      icon: Clock,
      gradient: "from-blue-600 via-purple-600 to-indigo-800",
      stats: "98% on-time delivery rate"
    },
    {
      id: 2,
      title: "Submit Tasks & Earn",
      subtitle: "Flexible Income Stream",
      description: "Join thousands earning extra income by completing diverse tasks from home. Get paid for your skills and dedication.",
      icon: DollarSign,
      gradient: "from-emerald-500 via-teal-600 to-cyan-700",
      stats: "$2.5M+ paid to freelancers"
    },
    {
      id: 3,
      title: "Post Tasks Simply",
      subtitle: "Find Skilled Talent",
      description: "Effortlessly connect with skilled professionals ready to tackle your projects. From simple tasks to complex solutions.",
      icon: Briefcase,
      gradient: "from-orange-500 via-red-500 to-pink-600",
      stats: "50K+ completed projects"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const currentSlideData = slides[currentSlide];
  const IconComponent = currentSlideData.icon;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900">
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.gradient} transition-all duration-1000 ease-in-out`}>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Geometric patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-white/30 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-40 right-32 w-24 h-24 border border-white/20 rotate-12 animate-pulse"></div>
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen px-6 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left content */}
            <div className={`space-y-8 transform transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
              
              {/* Icon and subtitle */}
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <span className="text-white/80 text-lg font-medium tracking-wide">
                  {currentSlideData.subtitle}
                </span>
              </div>

              {/* Main heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                <span className="block">{currentSlideData.title.split(' ').slice(0, -1).join(' ')}</span>
                <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {currentSlideData.title.split(' ').slice(-1)}
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl text-white/90 leading-relaxed max-w-lg">
                {currentSlideData.description}
              </p>

              {/* Stats */}
              <div className="flex items-center space-x-2 text-white/80">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-semibold">{currentSlideData.stats}</span>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="group bg-white text-slate-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/90 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2">
                  <span>Get Started Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-200">
                  Learn More
                </button>
              </div>
            </div>

            {/* Right content - Feature cards */}
            <div className={`lg:block hidden transform transition-all duration-700 delay-200 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
              <div className="grid grid-cols-2 gap-6">
                
                {/* Feature card 1 */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">Active Community</h3>
                  <p className="text-white/70 text-sm">Join 100k+ active freelancers and clients</p>
                </div>

                {/* Feature card 2 */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 mt-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">Fair Payments</h3>
                  <p className="text-white/70 text-sm">Secure and timely compensation</p>
                </div>

                {/* Feature card 3 */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 col-span-2">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">Diverse Opportunities</h3>
                      <p className="text-white/70 text-sm">From quick tasks to long-term projects</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide indicators */}
          <div className="flex justify-center space-x-3 mt-12">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => {
                    setCurrentSlide(index);
                    setIsVisible(true);
                  }, 300);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ModernHeroSection;
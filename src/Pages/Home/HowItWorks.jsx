import { useState, useEffect } from 'react';
import { UserPlus, CheckSquare, Trophy, ArrowRight, Sparkles, Play } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Register",
    description: "Sign up for an account to access our platform and start your earning journey with us.",
    gradient: "from-blue-500 to-indigo-600",
    bgGradient: "from-blue-50 to-indigo-100",
    details: "Quick 2-minute signup process",
    color: "blue"
  },
  {
    icon: CheckSquare,
    number: "02",
    title: "Complete Tasks",
    description: "Browse available tasks, complete them with excellence, and submit for review by our quality team.",
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-50 to-teal-100",
    details: "1000+ tasks available daily",
    color: "emerald"
  },
  {
    icon: Trophy,
    number: "03",
    title: "Earn Rewards",
    description: "Get rewarded for completed tasks and redeem your earnings for cash or exciting rewards.",
    gradient: "from-yellow-500 to-orange-600",
    bgGradient: "from-yellow-50 to-orange-100",
    details: "Instant payments & rewards",
    color: "yellow"
  }
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
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

    const section = document.getElementById('how-it-works-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  return (
    <section id="how-it-works-section" className="relative py-24 bg-white overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-float opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section header */}
        <div className={`text-center mb-20 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent">
              How It 
            </span>
            <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Get started in just three simple steps and begin your journey to earning rewards
          </p>
        </div>

        {/* Steps container */}
        <div className="relative">
          
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-emerald-200 to-yellow-200 transform -translate-y-1/2 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-yellow-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: isVisible ? '100%' : '0%' }}
            ></div>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = activeStep === index;
              
              return (
                <div
                  key={index}
                  className={`
                    relative group transform transition-all duration-700
                    ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
                    ${isActive ? 'scale-105' : 'hover:scale-102'}
                  `}
                  style={{ 
                    transitionDelay: isVisible ? `${index * 0.2}s` : '0s'
                  }}
                  onMouseEnter={() => setActiveStep(index)}
                >
                  
                  {/* Step card */}
                  <div className={`
                    relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50
                    transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-2
                    ${isActive ? 'ring-2 ring-purple-500/20 shadow-2xl' : ''}
                  `}>
                    
                    {/* Active gradient overlay */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-br ${step.bgGradient} rounded-3xl opacity-0
                      ${isActive ? 'opacity-100' : 'group-hover:opacity-50'} transition-opacity duration-500
                    `}></div>

                    {/* Content */}
                    <div className="relative z-10 text-center">
                      
                      {/* Step number */}
                      <div className={`
                        inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6
                        bg-gradient-to-r ${step.gradient} shadow-lg transform transition-all duration-500
                        ${isActive ? 'scale-110 rotate-3' : 'group-hover:scale-105'}
                      `}>
                        <span className="text-2xl font-bold text-white">{step.number}</span>
                      </div>

                      {/* Icon */}
                      <div className={`
                        inline-flex p-4 rounded-2xl mb-6 transform transition-all duration-500
                        bg-white/70 backdrop-blur-sm shadow-md
                        ${isActive ? 'scale-110 bg-white' : 'group-hover:scale-105'}
                      `}>
                        <IconComponent className={`w-8 h-8 text-${step.color}-500`} />
                      </div>

                      {/* Title */}
                      <h3 className={`
                        text-2xl font-bold mb-4 transition-colors duration-300
                        ${isActive ? 'text-slate-900' : 'text-slate-800 group-hover:text-slate-900'}
                      `}>
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className={`
                        text-slate-600 leading-relaxed mb-6 transition-colors duration-300
                        ${isActive ? 'text-slate-700' : 'group-hover:text-slate-700'}
                      `}>
                        {step.description}
                      </p>

                      {/* Details */}
                      <div className="flex items-center justify-center space-x-2">
                        <Sparkles className={`w-4 h-4 text-${step.color}-500`} />
                        <span className={`text-sm font-semibold text-${step.color}-600`}>
                          {step.details}
                        </span>
                      </div>
                    </div>

                    {/* Glow effect for active step */}
                    {isActive && (
                      <div className={`
                        absolute inset-0 rounded-3xl bg-gradient-to-r ${step.gradient} opacity-20 
                        blur-xl -z-10 animate-pulse
                      `}></div>
                    )}
                  </div>

                  {/* Arrow connector (desktop only) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
                      <div className={`
                        p-2 rounded-full bg-white shadow-lg border transition-all duration-500
                        ${isActive ? 'scale-110 bg-purple-50 border-purple-200' : 'group-hover:scale-105'}
                      `}>
                        <ArrowRight className={`w-4 h-4 text-slate-400 ${isActive ? 'text-purple-500' : ''}`} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className={`
          text-center mt-20 transform transition-all duration-1000 delay-1000
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
        `}>
          <div className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-gradient-to-r from-purple-50 to-pink-50 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Ready to Start Earning?</h3>
              <p className="text-slate-600">Join our community and complete your first task today</p>
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 shadow-lg">
              <UserPlus className="w-5 h-5" />
              <span>Get Started Now</span>
            </button>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center space-x-3 mt-12">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeStep 
                  ? 'bg-purple-600 scale-125' 
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;
import { useState, useEffect } from "react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonialsData = [
  {
    id: 1,
    name: "John Doe",
    title: "CEO, Company ABC",
    avatar: "JD",
    testimonial:
      "This service is fantastic! It has helped us tremendously in managing our tasks more efficiently.",
    rating: 5,
  },
  {
    id: 2,
    name: "Jane Smith",
    title: "CTO, Company XYZ",
    avatar: "JS",
    testimonial:
      "An amazing experience! The customer support is top-notch and the platform is very user-friendly.",
    rating: 5,
  },
  {
    id: 3,
    name: "Mark Johnson",
    title: "Manager, Company 123",
    avatar: "MJ",
    testimonial:
      "Highly recommend this service to anyone looking to streamline their workflow and improve productivity.",
    rating: 5,
  },
];

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonialsData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonialsData.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length
    );
  };

  const currentTestimonial = testimonialsData[currentSlide];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="text-slate-800">What Our </span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Clients Say
            </span>
          </h2>
          <p className="text-slate-600 text-lg">
            Real feedback from our valued community
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="relative bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-slate-200">
          {/* Quote Icon */}
          <div className="absolute top-6 left-6 opacity-10">
            <Quote className="w-16 h-16 text-blue-500" />
          </div>

          <div className="relative z-10">
            {/* Rating */}
            <div className="flex justify-center mb-6">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-yellow-400 fill-current"
                />
              ))}
            </div>

            {/* Testimonial Text */}
            <blockquote className="text-xl md:text-2xl text-slate-700 text-center mb-8 leading-relaxed">
              &ldquo;{currentTestimonial.testimonial}&rdquo;
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {currentTestimonial.avatar}
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-slate-900 text-lg">
                  {currentTestimonial.name}
                </h4>
                <p className="text-slate-500">{currentTestimonial.title}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>

            {/* Dots */}
            <div className="flex space-x-2">
              {testimonialsData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? "bg-blue-600" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

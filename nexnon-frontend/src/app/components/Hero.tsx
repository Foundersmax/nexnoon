import { Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

export default function Hero() {
  return (
    <section className="relative overflow-hidden -mt-16 min-h-[600px] h-[80vh] flex items-center">
      {/* Background Image with Modern Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1758270704534-fd9715bffc0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjbGFzc3Jvb20lMjB0ZWNobm9sb2d5JTIwc3R1ZGVudHN8ZW58MXx8fHwxNzY4ODQ1OTgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Live classes background"
          className="w-full h-full object-cover"
        />
        {/* Lighter gradient overlay to show more of the image */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/75 via-slate-800/70 to-[#889dd1]/60"></div>
        
        {/* Subtle geometric accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="100,0 100,100 50,100" fill="white"/>
          </svg>
        </div>
      </div>

      <div className="w-[90vw] mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Content */}
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white text-sm sm:text-base rounded-full mb-6">
              Online Live Classes
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 sm:mb-10">
            Learn Live, Grow Fast
          </h1>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <Input
                type="text"
                placeholder="What do you want to learn today?"
                className="w-full pl-12 pr-24 sm:pr-32 py-4 sm:py-6 text-sm sm:text-base rounded-full border-2 border-white/20 focus:border-white/20 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-white/20 transition-colors bg-white/95 backdrop-blur-sm text-black"
              />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-4 sm:px-6 text-sm sm:text-base bg-black text-white hover:bg-gray-800 border-0"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 px-4">
            <span className="text-xs sm:text-sm text-gray-300">Popular:</span>
            {["Web Development", "Design", "Marketing", "Business"].map((tag) => (
              <button
                key={tag}
                className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-full hover:bg-white/20 hover:border-teal-400 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
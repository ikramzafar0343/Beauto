import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CinematicThinking } from "./CinematicThinking";
import { 
  Loader2, 
  Sparkles, 
} from "lucide-react";

interface ThinkingIndicatorProps {
  query: string;
  visible: boolean;
}

export function ThinkingIndicator({ query, visible }: ThinkingIndicatorProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
    } else {
      // Keep visible for a moment to allow plan to finish "top to end"
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/98 dark:bg-[#050505]/98 backdrop-blur-3xl overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full h-full flex flex-col items-center justify-center relative"
      >
        {/* Top Left Branding */}
        <div className="absolute top-10 left-10 flex items-center gap-4 text-[#343434] dark:text-white">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full" />
            <motion.div 
              className="absolute inset-0 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <Sparkles className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-black tracking-[0.4em] uppercase">Beauto Intelligence</span>
            <span className="text-[9px] font-medium tracking-[0.2em] text-blue-500/50 uppercase">v4.0 Cinematic_Engine</span>
          </div>
        </div>

          <div className="w-full h-full flex items-center justify-center">
            <CinematicThinking query={query} visible={visible} />
          </div>

        {/* Bottom Right Mode */}
        <div className="absolute bottom-10 right-10 flex items-center gap-4 text-[11px] font-black tracking-[0.4em] text-[#343434]/20 dark:text-white/20">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <motion.div 
                key={i} 
                className="w-1.5 h-1.5 rounded-full bg-blue-500/50" 
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>
          <span className="uppercase">Autopilot_Mode_Active</span>
        </div>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = +targetDate - +new Date();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div 
        className="relative bg-[#0D0D0D]/80 backdrop-blur-sm rounded-xl w-20 h-20 md:w-28 md:h-28 flex items-center justify-center border border-[#D4AF37] shadow-lg"
        style={{ 
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' 
        }}
      >
        <span 
          className="text-3xl md:text-5xl text-[#FFD966]"
          style={{ fontWeight: 700 }}
        >
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-sm md:text-base mt-2 text-white/90 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex gap-3 md:gap-6 justify-center">
      <TimeBox value={timeLeft.days} label="Days" />
      <TimeBox value={timeLeft.hours} label="Hours" />
      <TimeBox value={timeLeft.minutes} label="Minutes" />
      <TimeBox value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}

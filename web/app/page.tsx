import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import Problem from "@/components/sections/Problem";
import HowItWorks from "@/components/sections/HowItWorks";
import Worlds from "@/components/sections/Worlds";
import SkillData from "@/components/sections/SkillData";
import Scorecard from "@/components/sections/Scorecard";
import Vision from "@/components/sections/Vision";
import FinalCTA from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Problem />
      <HowItWorks />
      <Worlds />
      <SkillData />
      <Scorecard />
      <Vision />
      <FinalCTA />
    </>
  );
}

'use client';

import ActiveSession from "@/components/shared/ActiveSession";
import { RevealWrapper } from "next-reveal";

export default function DashboardPage() {

  return (
    <RevealWrapper delay={100} duration={500} origin="top" distance="20px" reset={false}>
    <div className="pt-8 xl:pt-0">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Панель управління</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Вітаємо на вашій персональній панелі управління!
      </p>
      <ActiveSession />
    </div>
  </RevealWrapper>
  );
}


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Настраиваем внутренний фокус...",
  "Ищем саногенные паттерны...",
  "Снижаем уровень патогенного напряжения...",
  "Консультируемся с теорией Орлова...",
  "Разбираем когнитивные узлы...",
  "Создаем пространство для принятия...",
  "Трансформируем реакцию в осознание...",
  "Подбираем целительные образы..."
];

const LoadingIndicator: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative w-20 h-20">
         <div className="absolute inset-0 border-4 border-teal-500/20 rounded-full"></div>
         <div className="absolute inset-0 border-4 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
      <h2 className="text-2xl font-black mt-8 text-white tracking-tight uppercase">Осознание...</h2>
      <p className="mt-2 text-gray-500 text-sm font-medium transition-opacity duration-500 italic">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingIndicator;

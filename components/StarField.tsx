"use client";

import React, { useEffect, useState } from 'react';
import styles from './StarField.module.css';

interface Star {
  id: number;
  top: string;
  left: string;
  size: number; // Star size in pixels
  animationDelay: string;
}

const StarField: React.FC = () => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const starCount = 100; // Adjust for star density
      const generatedStars: Star[] = [];
      for (let i = 0; i < starCount; i++) {
        const size = Math.random() * 2 + 1; // Star size between 1px and 3px
        generatedStars.push({
          id: i,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          size,
          animationDelay: `${Math.random() * 5}s`,
        });
      }
      setStars(generatedStars);
    };

    generateStars();
  }, []);

  return (
    <div className={styles.starfield}>
      {stars.map((star) => (
        <div
          key={star.id}
          className={styles.star}
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.animationDelay,
          }}
        />
      ))}
    </div>
  );
};

export default StarField;

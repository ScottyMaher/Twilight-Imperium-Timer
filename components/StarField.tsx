"use client";

import React, { useEffect, useState } from 'react';
import styles from './StarField.module.css';

interface Star {
  id: number;
  top: string;
  left: string;
  size: number;
  animationDelay: string;
  staticOpacity: number;
}

interface StarFieldProps {
  animated?: boolean;
}

const StarField: React.FC<StarFieldProps> = ({ animated = true }) => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const starCount = 100;
    const generatedStars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      const size = Math.random() * 2 + 1;
      generatedStars.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size,
        animationDelay: `${Math.random() * 5}s`,
        staticOpacity: Math.random() * 0.6 + 0.2, // 0.2 to 0.8
      });
    }
    setStars(generatedStars);
  }, []);

  return (
    <div className={styles.starfield}>
      {stars.map((star) => (
        <div
          key={star.id}
          className={`${styles.star} ${animated ? styles.animated : ''}`}
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            ...(animated
              ? { animationDelay: star.animationDelay }
              : { opacity: star.staticOpacity }),
          }}
        />
      ))}
    </div>
  );
};

export default StarField;

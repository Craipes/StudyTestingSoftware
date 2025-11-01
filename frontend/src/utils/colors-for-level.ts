export const getLevelColor = (level: number, maxLevel: number = 100) => {
  const percentage = Math.min(level / maxLevel, 1); 

  // Зелений -> Жовтий -> Помаранчевий -> Червоний -> Фіолетовий
  let r, g, b;

  if (percentage <= 0.25) { 
    r = Math.round(255 * (percentage / 0.25));
    g = 255;
    b = 0;
  } else if (percentage <= 0.5) { 
    r = 255;
    g = Math.round(255 * (1 - ((percentage - 0.25) / 0.25)));
    b = 0;
  } else if (percentage <= 0.75) {
    r = 255;
    g = 0;
    b = Math.round(255 * ((percentage - 0.5) / 0.25)); 
  } else { 
    r = Math.round(255 * (1 - ((percentage - 0.75) / 0.25))); 
    g = 0;
    b = 255;
  }

  return `rgb(${r}, ${g}, ${b})`;
};
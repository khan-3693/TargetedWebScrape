export function createConfetti() {
  const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
  }
}

function createConfettiPiece(color: string) {
  const confetti = document.createElement('div');
  confetti.style.position = 'fixed';
  confetti.style.width = '10px';
  confetti.style.height = '10px';
  confetti.style.backgroundColor = color;
  confetti.style.left = Math.random() * window.innerWidth + 'px';
  confetti.style.top = '-20px';
  confetti.style.opacity = '1';
  confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
  confetti.style.zIndex = '9999';
  confetti.style.pointerEvents = 'none';
  confetti.style.borderRadius = '2px';

  document.body.appendChild(confetti);

  const fallDuration = Math.random() * 3 + 2;
  const fallDistance = window.innerHeight + 20;
  const drift = (Math.random() - 0.5) * 200;

  confetti.animate(
    [
      {
        transform: `translate(0, 0) rotate(0deg)`,
        opacity: 1,
      },
      {
        transform: `translate(${drift}px, ${fallDistance}px) rotate(${Math.random() * 720}deg)`,
        opacity: 0,
      },
    ],
    {
      duration: fallDuration * 1000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    }
  ).onfinish = () => {
    confetti.remove();
  };
}

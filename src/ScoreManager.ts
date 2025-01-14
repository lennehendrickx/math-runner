export class ScoreManager {
    private score: number = 0;
    private scoreElement: HTMLDivElement;
    private scoreContainer: HTMLDivElement;
    private speedElement: HTMLDivElement;

    constructor() {
        // Create container with Barbie-style background
        this.scoreContainer = document.createElement('div');
        this.scoreContainer.style.position = 'absolute';
        this.scoreContainer.style.top = '20px';
        this.scoreContainer.style.left = '20px';
        this.scoreContainer.style.padding = '15px 30px';
        this.scoreContainer.style.background = 'linear-gradient(45deg, #FF69B4, #FF1493)';
        this.scoreContainer.style.borderRadius = '25px';
        this.scoreContainer.style.boxShadow = '0 4px 15px rgba(255, 105, 180, 0.5)';
        this.scoreContainer.style.border = '3px solid #FFF';

        // Create score element with fancy styling
        this.scoreElement = document.createElement('div');
        this.scoreElement.style.color = 'white';
        this.scoreElement.style.fontSize = '32px';
        this.scoreElement.style.fontFamily = "'Comic Sans MS', cursive";
        this.scoreElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';
        this.scoreElement.style.fontWeight = 'bold';

        // Create speed element
        this.speedElement = document.createElement('div');
        this.speedElement.style.color = 'white';
        this.speedElement.style.fontSize = '24px';
        this.speedElement.style.fontFamily = "'Comic Sans MS', cursive";
        this.speedElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';
        this.speedElement.style.marginTop = '5px';

        this.scoreContainer.appendChild(this.scoreElement);
        this.scoreContainer.appendChild(this.speedElement);
        document.body.appendChild(this.scoreContainer);
        
        this.updateDisplay();
        this.updateSpeed(1); // Initial speed display

        // Add sparkle animation
        this.addSparkleEffect();
    }

    private addSparkleEffect() {
        const sparkle = document.createElement('style');
        sparkle.textContent = `
            @keyframes sparkle {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(sparkle);
        this.scoreContainer.style.animation = 'sparkle 2s infinite';
    }

    addPoints(points: number): void {
        this.score += points;
        this.updateDisplay();
        this.showPointsAnimation('+' + points, '#FFB6C1');
    }

    subtractPoints(points: number): void {
        this.score -= points;
        this.updateDisplay();
        this.showPointsAnimation('-' + points, '#FF69B4');
    }

    private updateDisplay(): void {
        this.scoreElement.textContent = `Score: ${this.score} ✨`;
    }

    private showPointsAnimation(text: string, color: string) {
        const animation = document.createElement('div');
        animation.textContent = text;
        animation.style.position = 'absolute';
        animation.style.left = '100px';
        animation.style.top = '50px';
        animation.style.fontSize = '24px';
        animation.style.fontWeight = 'bold';
        animation.style.color = color;
        animation.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';
        animation.style.transition = 'all 0.5s ease-out';
        animation.style.opacity = '1';
        animation.style.fontFamily = "'Comic Sans MS', cursive";

        document.body.appendChild(animation);

        // Animate
        setTimeout(() => {
            animation.style.transform = 'translateY(-50px)';
            animation.style.opacity = '0';
        }, 50);

        // Remove after animation
        setTimeout(() => {
            document.body.removeChild(animation);
        }, 500);
    }

    updateSpeed(multiplier: number): void {
        const speedPercentage = Math.round(multiplier * 100);
        this.speedElement.textContent = `Speed: ${speedPercentage}% 🚀`;
        
        // Add color coding for speed
        if (multiplier === 1) {
            this.speedElement.style.color = '#FFFFFF';  // White for normal speed
        } else if (multiplier < 1) {
            this.speedElement.style.color = '#FFD700';  // Gold for slow speed
        }
    }
} 
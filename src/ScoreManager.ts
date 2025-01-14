export class ScoreManager {
    private score: number = 0;
    private scoreElement: HTMLDivElement;
    private speedElement: HTMLDivElement;
    private scoreContainer: HTMLDivElement;

    constructor() {
        // Create container with improved styling
        this.scoreContainer = document.createElement('div');
        this.scoreContainer.style.position = 'absolute';
        this.scoreContainer.style.top = '20px';
        this.scoreContainer.style.left = '20px';
        this.scoreContainer.style.padding = '20px 30px';
        this.scoreContainer.style.background = 'linear-gradient(135deg, #FF69B4, #FF1493)';
        this.scoreContainer.style.borderRadius = '15px';
        this.scoreContainer.style.boxShadow = '0 4px 15px rgba(255, 105, 180, 0.5)';
        this.scoreContainer.style.border = '2px solid rgba(255, 255, 255, 0.5)';
        this.scoreContainer.style.backdropFilter = 'blur(5px)';
        this.scoreContainer.style.minWidth = '200px';
        this.scoreContainer.style.textAlign = 'center';

        // Create score element with improved styling
        this.scoreElement = document.createElement('div');
        this.scoreElement.style.color = 'white';
        this.scoreElement.style.fontSize = '32px';
        this.scoreElement.style.fontFamily = "'Fredoka', sans-serif";
        this.scoreElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';
        this.scoreElement.style.fontWeight = '600';
        this.scoreElement.style.marginBottom = '5px';
        this.scoreElement.style.letterSpacing = '1px';

        // Create speed element with improved styling
        this.speedElement = document.createElement('div');
        this.speedElement.style.color = 'white';
        this.speedElement.style.fontSize = '22px';
        this.speedElement.style.fontFamily = "'Fredoka', sans-serif";
        this.speedElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';
        this.speedElement.style.fontWeight = '400';
        this.speedElement.style.opacity = '0.9';
        this.speedElement.style.letterSpacing = '0.5px';

        // Add divider between score and speed
        const divider = document.createElement('div');
        divider.style.width = '80%';
        divider.style.height = '2px';
        divider.style.background = 'rgba(255, 255, 255, 0.3)';
        divider.style.margin = '10px auto';
        divider.style.borderRadius = '1px';

        this.scoreContainer.appendChild(this.scoreElement);
        this.scoreContainer.appendChild(divider);
        this.scoreContainer.appendChild(this.speedElement);
        document.body.appendChild(this.scoreContainer);
        
        this.updateDisplay();
        this.updateSpeed(1);

        // Add hover effect
        this.scoreContainer.addEventListener('mouseenter', () => {
            this.scoreContainer.style.transform = 'scale(1.02)';
            this.scoreContainer.style.transition = 'transform 0.2s ease-out';
        });

        this.scoreContainer.addEventListener('mouseleave', () => {
            this.scoreContainer.style.transform = 'scale(1)';
        });
    }

    private updateDisplay(): void {
        this.scoreElement.textContent = `Score: ${this.score} ✨`;
    }

    updateSpeed(multiplier: number): void {
        const speedPercentage = Math.round(multiplier * 100);
        this.speedElement.textContent = `Speed: ${speedPercentage}% 🚀`;
        
        if (multiplier === 1) {
            this.speedElement.style.color = '#FFFFFF';
        } else if (multiplier < 1) {
            this.speedElement.style.color = '#FFD700';
        }
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

    private showPointsAnimation(text: string, color: string) {
        const animation = document.createElement('div');
        animation.textContent = text;
        animation.style.position = 'absolute';
        animation.style.left = '100px';
        animation.style.top = '50px';
        animation.style.fontSize = '28px';
        animation.style.fontWeight = '600';
        animation.style.fontFamily = "'Fredoka', sans-serif";
        animation.style.color = color;
        animation.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';
        animation.style.transition = 'all 0.5s ease-out';
        animation.style.opacity = '1';

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

    getScore(): number {
        return this.score;
    }
} 
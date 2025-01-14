export class ScoreManager {
    private score: number = 0;
    private scoreElement: HTMLDivElement;
    private speedElement: HTMLDivElement;
    private multiplierElement: HTMLDivElement;
    private scoreContainer: HTMLDivElement;

    constructor() {
        // Create container with improved styling
        this.scoreContainer = document.createElement('div');
        this.scoreContainer.style.position = 'absolute';
        this.scoreContainer.style.top = '20px';
        this.scoreContainer.style.left = '20px';
        this.scoreContainer.style.padding = '20px 30px';
        this.scoreContainer.style.background = 'linear-gradient(135deg, rgba(255, 105, 180, 0.9), rgba(255, 20, 147, 0.9))';
        this.scoreContainer.style.borderRadius = '20px';
        this.scoreContainer.style.boxShadow = '0 4px 20px rgba(255, 105, 180, 0.6)';
        this.scoreContainer.style.border = '2px solid rgba(255, 255, 255, 0.6)';
        this.scoreContainer.style.backdropFilter = 'blur(10px)';
        this.scoreContainer.style.minWidth = '220px';
        this.scoreContainer.style.textAlign = 'center';

        // Create score label
        const scoreLabel = document.createElement('div');
        scoreLabel.style.color = 'rgba(255, 255, 255, 0.9)';
        scoreLabel.style.fontSize = '18px';
        scoreLabel.style.fontFamily = "'Fredoka', sans-serif";
        scoreLabel.style.marginBottom = '4px';
        scoreLabel.textContent = 'SCORE';

        // Create score element with improved styling
        this.scoreElement = document.createElement('div');
        this.scoreElement.style.color = 'white';
        this.scoreElement.style.fontSize = '38px';
        this.scoreElement.style.fontFamily = "'Fredoka', sans-serif";
        this.scoreElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';
        this.scoreElement.style.fontWeight = '600';
        this.scoreElement.style.marginBottom = '15px';
        this.scoreElement.style.letterSpacing = '2px';

        // Create score container
        const scoreContainer = document.createElement('div');
        scoreContainer.appendChild(scoreLabel);
        scoreContainer.appendChild(this.scoreElement);

        // Add divider between score and speed
        const divider = document.createElement('div');
        divider.style.width = '80%';
        divider.style.height = '2px';
        divider.style.background = 'rgba(255, 255, 255, 0.3)';
        divider.style.margin = '15px auto';
        divider.style.borderRadius = '1px';

        // Create speed label
        const speedLabel = document.createElement('div');
        speedLabel.style.color = 'rgba(255, 255, 255, 0.9)';
        speedLabel.style.fontSize = '18px';
        speedLabel.style.fontFamily = "'Fredoka', sans-serif";
        speedLabel.style.marginBottom = '8px';
        speedLabel.textContent = 'SPEED';

        // Create speed meter container
        const speedMeterContainer = document.createElement('div');
        speedMeterContainer.style.width = '100%';
        speedMeterContainer.style.height = '24px';
        speedMeterContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        speedMeterContainer.style.borderRadius = '12px';
        speedMeterContainer.style.overflow = 'hidden';
        speedMeterContainer.style.position = 'relative';

        // Create speed meter bar
        const speedMeter = document.createElement('div');
        speedMeter.style.width = '100%';
        speedMeter.style.height = '100%';
        speedMeter.style.backgroundColor = '#FFD700';
        speedMeter.style.borderRadius = '12px';
        speedMeter.style.transition = 'width 0.3s ease-out';

        // Create speed text element
        this.speedElement = document.createElement('div');
        this.speedElement.style.position = 'absolute';
        this.speedElement.style.width = '100%';
        this.speedElement.style.textAlign = 'center';
        this.speedElement.style.top = '50%';
        this.speedElement.style.left = '50%';
        this.speedElement.style.transform = 'translate(-50%, -50%)';
        this.speedElement.style.color = 'white';
        this.speedElement.style.fontSize = '14px';
        this.speedElement.style.fontFamily = "'Fredoka', sans-serif";
        this.speedElement.style.fontWeight = '600';
        this.speedElement.style.textShadow = '1px 1px 2px rgba(0,0,0,0.3)';
        this.speedElement.style.mixBlendMode = 'difference';
        this.speedElement.style.zIndex = '1';

        speedMeterContainer.appendChild(speedMeter);
        speedMeterContainer.appendChild(this.speedElement);

        // Create multiplier element with improved styling
        this.multiplierElement = document.createElement('div');
        this.multiplierElement.style.position = 'absolute';
        this.multiplierElement.style.top = '-15px';
        this.multiplierElement.style.right = '-15px';
        this.multiplierElement.style.backgroundColor = '#FFD700';
        this.multiplierElement.style.color = '#FF1493';
        this.multiplierElement.style.padding = '8px 12px';
        this.multiplierElement.style.borderRadius = '15px';
        this.multiplierElement.style.fontSize = '16px';
        this.multiplierElement.style.fontFamily = "'Fredoka', sans-serif";
        this.multiplierElement.style.fontWeight = '600';
        this.multiplierElement.style.boxShadow = '0 2px 10px rgba(255, 215, 0, 0.5)';
        this.multiplierElement.style.transform = 'rotate(15deg)';
        this.multiplierElement.style.display = 'none';

        // Add all elements to the container
        this.scoreContainer.appendChild(scoreContainer);
        this.scoreContainer.appendChild(divider);
        this.scoreContainer.appendChild(speedLabel);
        this.scoreContainer.appendChild(speedMeterContainer);
        this.scoreContainer.appendChild(this.multiplierElement);
        document.body.appendChild(this.scoreContainer);

        // Add hover effect
        this.scoreContainer.addEventListener('mouseenter', () => {
            this.scoreContainer.style.transform = 'scale(1.02)';
            this.scoreContainer.style.boxShadow = '0 6px 25px rgba(255, 105, 180, 0.8)';
            this.scoreContainer.style.transition = 'all 0.2s ease-out';
        });

        this.scoreContainer.addEventListener('mouseleave', () => {
            this.scoreContainer.style.transform = 'scale(1)';
            this.scoreContainer.style.boxShadow = '0 4px 20px rgba(255, 105, 180, 0.6)';
        });

        this.updateScore();
        this.updateSpeed(1);
        this.updateMultiplier(1);
    }

    addPoints(points: number): void {
        this.score += points;
        this.updateScore();
        this.showPointsAnimation('+' + points, '#FFB6C1');
    }

    subtractPoints(points: number): void {
        this.score = Math.max(0, this.score - points);
        this.updateScore();
        this.showPointsAnimation('-' + points, '#FF69B4');
    }

    private updateScore(): void {
        this.scoreElement.textContent = this.score.toString();
    }

    updateSpeed(multiplier: number): void {
        const percentage = Math.round(multiplier * 100);
        this.speedElement.textContent = `${percentage}%`;
    }

    updateMultiplier(multiplier: number): void {
        if (multiplier > 1) {
            this.multiplierElement.textContent = `${multiplier}x`;
            this.multiplierElement.style.display = 'block';
            // Add pulse animation
            this.multiplierElement.style.animation = 'pulse 1s infinite';
        } else {
            this.multiplierElement.style.display = 'none';
        }
    }

    private showPointsAnimation(text: string, color: string): void {
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
} 
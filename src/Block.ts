import * as THREE from 'three';
import { Player } from './Player';
import { createTextSprite } from './TextSprite';

export class Block {
    private mesh: THREE.Group;
    private speed: number = 1.5;
    private position: THREE.Vector3;
    private correctAnswer: number;
    private wrongAnswer: number;
    private isRightSideCorrect: boolean;
    private question: string;
    private isAnimating: boolean = false;
    private leftAnswerSprite: THREE.Sprite;
    private rightAnswerSprite: THREE.Sprite;
    private lastHighlightedSide: 'none' | 'left' | 'right' = 'none';
    private player: Player | null = null;

    constructor(num1: number, num2: number) {
        this.mesh = new THREE.Group();
        this.position = new THREE.Vector3(0, 0.5, -30);
        
        this.question = `${num1} × ${num2}`;
        this.correctAnswer = num1 * num2;
        
        // Generate wrong answer close to the correct answer
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
            attempts++;
            
            if (attempts >= maxAttempts) {
                // Fallback: if we can't find a close number, generate one further away
                const sign = Math.random() > 0.5 ? 1 : -1;
                this.wrongAnswer = this.correctAnswer + (sign * (Math.floor(Math.random() * 5) + 4));
                break;
            }
            
            // Try to generate a number close to the correct answer
            const offset = Math.floor(Math.random() * 7) - 3; // -3 to +3
            if (offset === 0) continue;
            
            const potentialWrongAnswer = this.correctAnswer + offset;
            
            // Validate the wrong answer
            if (potentialWrongAnswer > 0 && potentialWrongAnswer <= 100) {
                this.wrongAnswer = potentialWrongAnswer;
                break;
            }
            
        } while (true);

        // Randomly decide which side is correct
        this.isRightSideCorrect = Math.random() > 0.5;

        this.createBlock();
    }

    private createBlock(): void {
        // Create question sprite above the center
        const questionSprite = createTextSprite(this.question);
        questionSprite.position.set(0, 2.5, 0);

        // Create larger answer sprites that span the road halves
        this.leftAnswerSprite = createTextSprite(
            String(this.isRightSideCorrect ? this.wrongAnswer : this.correctAnswer)
        );
        this.leftAnswerSprite.position.set(-2, 0.5, 0);
        this.leftAnswerSprite.scale.set(2.5, 2.5, 2.5);  // Increased from 1.5 to 2.5

        this.rightAnswerSprite = createTextSprite(
            String(this.isRightSideCorrect ? this.correctAnswer : this.wrongAnswer)
        );
        this.rightAnswerSprite.position.set(2, 0.5, 0);
        this.rightAnswerSprite.scale.set(2.5, 2.5, 2.5);  // Increased from 1.5 to 2.5

        // Add everything to the main mesh group
        this.mesh.add(questionSprite);
        this.mesh.add(this.leftAnswerSprite);
        this.mesh.add(this.rightAnswerSprite);
        this.mesh.position.copy(this.position);
    }

    getMesh(): THREE.Group {
        return this.mesh;
    }

    getPosition(): THREE.Vector3 {
        return this.position.clone();
    }

    update(deltaTime: number, player: Player): void {
        this.position.z += this.speed * deltaTime;
        this.mesh.position.copy(this.position);
        this.player = player;

        // Update answer highlighting based only on x-position
        const playerPos = player.getPosition();
        if (playerPos.x <= -0.7) {
            this.highlightAnswer('left');
        } else if (playerPos.x >= 0.7) {
            this.highlightAnswer('right');
        } else {
            this.highlightAnswer('none');
        }
    }

    private highlightAnswer(side: 'none' | 'left' | 'right'): void {
        if (this.lastHighlightedSide === side) return;

        const baseScale = 2.5;  // Increased from 1.5 to 2.5
        const highlightScale = 3.5;  // Increased from 2.5 to 3.5
        
        // Always keep non-highlighted items at original size
        this.leftAnswerSprite.scale.set(baseScale, baseScale, baseScale);
        this.rightAnswerSprite.scale.set(baseScale, baseScale, baseScale);
        
        // Reset materials to default
        (this.leftAnswerSprite.material as THREE.SpriteMaterial).color.setHex(0xFFFFFF);
        (this.rightAnswerSprite.material as THREE.SpriteMaterial).color.setHex(0xFFFFFF);

        // Only scale up and add glow to the currently highlighted item
        if (side === 'left') {
            this.leftAnswerSprite.scale.set(highlightScale, highlightScale, highlightScale);
            (this.leftAnswerSprite.material as THREE.SpriteMaterial).color.setHex(0xFFFF00);
        } else if (side === 'right') {
            this.rightAnswerSprite.scale.set(highlightScale, highlightScale, highlightScale);
            (this.rightAnswerSprite.material as THREE.SpriteMaterial).color.setHex(0xFFFF00);
        }

        this.lastHighlightedSide = side;
    }

    checkCollision(player: Player): boolean {
        const playerPos = player.getPosition();
        const blockPos = this.position;
        
        // Collision check with just the z-position since there's no physical block
        return Math.abs(playerPos.z - blockPos.z) < 0.5;
    }

    isCorrectSide(isRightSide: boolean): boolean {
        return isRightSide === this.isRightSideCorrect;
    }

    checkScoring(player: Player): 'none' | 'correct' | 'incorrect' {
        if (this.isAnimating) return 'none';
        
        const playerPos = player.getPosition();
        const blockPos = this.position;
        
        if (Math.abs(playerPos.z - blockPos.z) < 0.8) {
            if (playerPos.x <= -0.7) {
                const result = this.isRightSideCorrect ? 'incorrect' : 'correct';
                this.playResultAnimation(result);
                return result;
            } else if (playerPos.x >= 0.7) {
                const result = this.isRightSideCorrect ? 'correct' : 'incorrect';
                this.playResultAnimation(result);
                return result;
            }
        }
        return 'none';
    }

    private playResultAnimation(result: 'correct' | 'incorrect'): void {
        this.isAnimating = true;
        const duration = 500;
        const startTime = Date.now();
        
        // Animation function
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (result === 'correct') {
                // Pulse green and scale up
                const scale = 2.5 + Math.sin(progress * Math.PI) * 0.5;  // Adjusted base scale
                const targetSprite = this.isRightSideCorrect ? this.rightAnswerSprite : this.leftAnswerSprite;
                targetSprite.scale.set(scale, scale, scale);
                (targetSprite.material as THREE.SpriteMaterial).color.setHex(0x00FF00);
            } else {
                // Shake and flash red
                const shake = Math.sin(progress * Math.PI * 8) * (1 - progress) * 0.5;
                const targetSprite = this.isRightSideCorrect ? this.leftAnswerSprite : this.rightAnswerSprite;
                targetSprite.position.x = (this.isRightSideCorrect ? -2 : 2) + shake;
                (targetSprite.material as THREE.SpriteMaterial).color.setHex(0xFF0000);
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Reset everything
                const baseScale = 2.5;  // Reset to new base scale
                this.leftAnswerSprite.scale.set(baseScale, baseScale, baseScale);
                this.rightAnswerSprite.scale.set(baseScale, baseScale, baseScale);
                this.leftAnswerSprite.position.x = -2;
                this.rightAnswerSprite.position.x = 2;
                (this.leftAnswerSprite.material as THREE.SpriteMaterial).color.setHex(0xFFFFFF);
                (this.rightAnswerSprite.material as THREE.SpriteMaterial).color.setHex(0xFFFFFF);
                this.isAnimating = false;
            }
        };

        animate();
    }
} 
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
        // Create main block with gradient material
        const geometry = new THREE.BoxGeometry(2, 1, 1);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xFF69B4, // Hot pink
            shininess: 100,
            specular: 0xFFFFFF
        });
        const blockMesh = new THREE.Mesh(geometry, material);

        // Add glow effect
        const glowGeometry = new THREE.BoxGeometry(2.2, 1.2, 1.2);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF1493,
            transparent: true,
            opacity: 0.3
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        blockMesh.add(glowMesh);

        // Create question sprite above the block
        const questionSprite = createTextSprite(this.question);
        questionSprite.position.set(0, 2.5, 0); // Moved higher up from 2 to 2.5

        // Create answer sprites with more distance from block
        this.leftAnswerSprite = createTextSprite(
            String(this.isRightSideCorrect ? this.wrongAnswer : this.correctAnswer)
        );
        this.leftAnswerSprite.position.set(-2, 0.5, 0);
        this.leftAnswerSprite.scale.set(1.5, 1.5, 1.5);

        this.rightAnswerSprite = createTextSprite(
            String(this.isRightSideCorrect ? this.correctAnswer : this.wrongAnswer)
        );
        this.rightAnswerSprite.position.set(2, 0.5, 0);
        this.rightAnswerSprite.scale.set(1.5, 1.5, 1.5);

        this.mesh.add(blockMesh);
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

        const baseScale = 1.5;
        const highlightScale = 2.0;
        
        // Always keep non-highlighted items at original size
        this.leftAnswerSprite.scale.set(baseScale, baseScale, baseScale);
        this.rightAnswerSprite.scale.set(baseScale, baseScale, baseScale);

        // Only scale up the currently highlighted item
        if (side === 'left') {
            this.leftAnswerSprite.scale.set(highlightScale, highlightScale, highlightScale);
        } else if (side === 'right') {
            this.rightAnswerSprite.scale.set(highlightScale, highlightScale, highlightScale);
        }

        this.lastHighlightedSide = side;
    }

    checkCollision(player: Player): boolean {
        const playerPos = player.getPosition();
        const blockPos = this.position;
        
        // Block is 2 units wide (-1 to 1) and 1 unit deep
        return (
            Math.abs(playerPos.x) < 1 && // Player is in block's x-range
            Math.abs(playerPos.z - blockPos.z) < 0.5 // Closer collision check in z-direction
        );
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
        
        // Get all meshes and their materials
        const meshMaterials: { 
            mesh: THREE.Mesh, 
            material: THREE.MeshPhongMaterial | THREE.MeshBasicMaterial,
            originalColor?: THREE.Color 
        }[] = [];

        this.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const material = child.material as THREE.MeshPhongMaterial | THREE.MeshBasicMaterial;
                if (material) {
                    meshMaterials.push({ 
                        mesh: child, 
                        material,
                        originalColor: material.color.clone()
                    });
                }
            }
        });

        // Animation function
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (result === 'correct') {
                // Pulse green and scale up
                const scale = 1 + Math.sin(progress * Math.PI) * 0.3;
                this.mesh.scale.set(scale, scale, scale);
                
                meshMaterials.forEach(({ material }) => {
                    material.color.setHex(0x00FF00);
                    if (material instanceof THREE.MeshPhongMaterial) {
                        material.emissive.setHex(0x00FF00);
                        material.emissiveIntensity = Math.sin(progress * Math.PI) * 0.5;
                    }
                });
            } else {
                // Shake and flash red
                const shake = Math.sin(progress * Math.PI * 8) * (1 - progress) * 0.5;
                this.mesh.position.x = this.position.x + shake;
                
                meshMaterials.forEach(({ material }) => {
                    material.color.setHex(0xFF0000);
                    if (material instanceof THREE.MeshPhongMaterial) {
                        material.emissive.setHex(0xFF0000);
                        material.emissiveIntensity = Math.sin(progress * Math.PI) * 0.5;
                    }
                });
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Reset everything
                this.mesh.scale.set(1, 1, 1);
                this.mesh.position.copy(this.position);
                meshMaterials.forEach(({ material, originalColor }) => {
                    if (originalColor) {
                        material.color.copy(originalColor);
                    }
                    if (material instanceof THREE.MeshPhongMaterial) {
                        material.emissive.setHex(0x000000);
                        material.emissiveIntensity = 0;
                    }
                });
                this.isAnimating = false;
            }
        };

        animate();
    }
} 
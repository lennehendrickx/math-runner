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

    constructor(num1: number, num2: number) {
        this.mesh = new THREE.Group();
        this.position = new THREE.Vector3(0, 0.5, -30);
        
        this.question = `${num1} × ${num2}`;
        this.correctAnswer = num1 * num2;
        
        // Generate wrong answer (different from correct answer)
        do {
            this.wrongAnswer = (Math.floor(Math.random() * 81) + 1);
        } while (this.wrongAnswer === this.correctAnswer);

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
        const leftAnswer = createTextSprite(
            String(this.isRightSideCorrect ? this.wrongAnswer : this.correctAnswer)
        );
        leftAnswer.position.set(-3, 0.5, 0); // Changed from -1.5 to -3, added height

        const rightAnswer = createTextSprite(
            String(this.isRightSideCorrect ? this.correctAnswer : this.wrongAnswer)
        );
        rightAnswer.position.set(3, 0.5, 0); // Changed from 1.5 to 3, added height

        this.mesh.add(blockMesh);
        this.mesh.add(questionSprite);
        this.mesh.add(leftAnswer);
        this.mesh.add(rightAnswer);
        this.mesh.position.copy(this.position);
    }

    getMesh(): THREE.Group {
        return this.mesh;
    }

    getPosition(): THREE.Vector3 {
        return this.position.clone();
    }

    update(deltaTime: number): void {
        this.position.z += this.speed * deltaTime;
        this.mesh.position.copy(this.position);
    }

    checkCollision(player: Player): boolean {
        const playerPos = player.getPosition();
        const blockPos = this.position;
        
        // Block is 2 units wide (-1 to 1)
        return (
            Math.abs(playerPos.x) < 1 && // Player is in block's x-range
            Math.abs(playerPos.z - blockPos.z) < 0.8 // Close enough in z-direction
        );
    }

    isCorrectSide(isRightSide: boolean): boolean {
        return isRightSide === this.isRightSideCorrect;
    }

    checkScoring(player: Player): 'none' | 'correct' | 'incorrect' {
        if (this.isAnimating) return 'none';
        
        const playerPos = player.getPosition();
        const blockPos = this.position;
        
        if (Math.abs(playerPos.z - blockPos.z) < 1) {
            if (playerPos.x <= -1) {
                const result = this.isRightSideCorrect ? 'incorrect' : 'correct';
                this.playResultAnimation(result);
                return result;
            } else if (playerPos.x >= 1) {
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
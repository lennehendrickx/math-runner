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
        // Create main hay bale block
        const geometry = new THREE.BoxGeometry(2, 1, 1);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xF4D03F, // Hay yellow color
            shininess: 5,     // Less shiny for a matte straw look
            specular: 0x111111, // Minimal specular highlight
            flatShading: true   // For a rougher look
        });
        const blockMesh = new THREE.Mesh(geometry, material);

        // Add darker edges to simulate hay texture
        const edgeGeometry = new THREE.EdgesGeometry(geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ 
            color: 0xD4B02F,  // Slightly darker than the base color
            linewidth: 2
        });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        blockMesh.add(edges);

        // Add horizontal lines to simulate hay strands
        const hayLinesGeometry = new THREE.BufferGeometry();
        const hayLines = [];
        const numLines = 8;
        for (let i = 0; i < numLines; i++) {
            const y = -0.4 + (i * 0.1);  // Spread lines vertically
            hayLines.push(-1, y, 0.501);  // Front face
            hayLines.push(1, y, 0.501);
            hayLines.push(-1, y, -0.501); // Back face
            hayLines.push(1, y, -0.501);
        }
        hayLinesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(hayLines, 3));
        const hayLinesMaterial = new THREE.LineBasicMaterial({ color: 0xD4B02F });
        const hayLinesObject = new THREE.LineSegments(hayLinesGeometry, hayLinesMaterial);
        blockMesh.add(hayLinesObject);

        // Add vertical lines
        const verticalLinesGeometry = new THREE.BufferGeometry();
        const verticalLines = [];
        const numVerticals = 10;
        for (let i = 0; i < numVerticals; i++) {
            const x = -1 + (i * 0.2);
            verticalLines.push(x, -0.5, 0.501);  // Front face
            verticalLines.push(x, 0.5, 0.501);
            verticalLines.push(x, -0.5, -0.501); // Back face
            verticalLines.push(x, 0.5, -0.501);
        }
        verticalLinesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(verticalLines, 3));
        const verticalLinesMaterial = new THREE.LineBasicMaterial({ color: 0xD4B02F });
        const verticalLinesObject = new THREE.LineSegments(verticalLinesGeometry, verticalLinesMaterial);
        blockMesh.add(verticalLinesObject);

        // Add subtle glow effect
        const glowGeometry = new THREE.BoxGeometry(2.2, 1.2, 1.2);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xF4D03F,
            transparent: true,
            opacity: 0.15
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        blockMesh.add(glowMesh);

        // Create question sprite above the block
        const questionSprite = createTextSprite(this.question);
        questionSprite.position.set(0, 2.5, 0);

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
        const highlightScale = 2.5;
        
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
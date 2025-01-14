import * as THREE from 'three';

export class FlowerEffect {
    private scene: THREE.Scene;
    private flowers: THREE.Group[] = [];
    private growthProgress: number[] = [];
    private readonly GROWTH_DURATION = 1000;
    private readonly MAX_FLOWERS = 50;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    private createFlower(): THREE.Group {
        const flower = new THREE.Group();

        // Create stem with better material
        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8);
        const stemMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x228B22,  // Forest green
            shininess: 10
        });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.6;
        flower.add(stem);

        // Create petals with more vibrant colors and better shape
        const petalColors = [
            0xFF69B4,  // Hot Pink
            0xFF1493,  // Deep Pink
            0xFFB6C1,  // Light Pink
            0xFF69B4,  // Hot Pink
            0xFFA07A,  // Light Salmon
            0xFFC0CB,  // Pink
            0xFF8C00,  // Dark Orange
            0xFFDAB9   // Peach
        ];

        // Create two layers of petals for fuller appearance
        [0.8, 0.6].forEach((scale, layer) => {
            const petalCount = layer === 0 ? 8 : 6;
            for (let i = 0; i < petalCount; i++) {
                const petalGeometry = new THREE.CircleGeometry(0.25, 5);
                const petalMaterial = new THREE.MeshPhongMaterial({ 
                    color: petalColors[Math.floor(Math.random() * petalColors.length)],
                    side: THREE.DoubleSide,
                    shininess: 30
                });
                const petal = new THREE.Mesh(petalGeometry, petalMaterial);
                petal.position.y = 1.2;
                petal.rotation.y = (i / petalCount) * Math.PI * 2;
                petal.rotation.x = Math.PI / 3;
                petal.scale.multiplyScalar(scale);
                flower.add(petal);
            }
        });

        // Create center with more detail
        const centerGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const centerMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFD700,  // Gold
            shininess: 50
        });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = 1.2;
        flower.add(center);

        // Add some leaves to the stem
        const leafGeometry = new THREE.CircleGeometry(0.15, 4);
        const leafMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x32CD32,  // Lime Green
            side: THREE.DoubleSide,
            shininess: 10
        });

        [-1, 1].forEach(side => {
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.set(0.1 * side, 0.4, 0);
            leaf.rotation.z = Math.PI / 4 * side;
            leaf.rotation.x = Math.PI / 3;
            flower.add(leaf);
        });

        // Start with scale 0 to grow
        flower.scale.set(0, 0, 0);
        
        return flower;
    }

    spawnFlowers(): void {
        // Remove old flowers if we have too many
        while (this.flowers.length >= this.MAX_FLOWERS) {
            const oldFlower = this.flowers.shift();
            const oldProgress = this.growthProgress.shift();
            if (oldFlower) {
                this.scene.remove(oldFlower);
            }
        }

        // Add 3-5 new flowers in random positions
        const numNewFlowers = Math.floor(Math.random() * 3) + 3;
        
        for (let i = 0; i < numNewFlowers; i++) {
            const flower = this.createFlower();
            
            // Random position near the road with better spacing
            const side = Math.random() < 0.5 ? -1 : 1;
            const x = (7 + Math.random() * 8) * side;  // Further from road
            const z = -Math.random() * 80;  // Spread out more
            
            flower.position.set(x, 0, z);
            flower.rotation.y = Math.random() * Math.PI * 2;
            
            this.scene.add(flower);
            this.flowers.push(flower);
            this.growthProgress.push(0);
        }
    }

    update(): void {
        const deltaTime = 16.67;
        
        for (let i = this.flowers.length - 1; i >= 0; i--) {
            const flower = this.flowers[i];
            this.growthProgress[i] = Math.min(this.growthProgress[i] + deltaTime, this.GROWTH_DURATION);
            
            // Smoother growth animation
            const progress = this.growthProgress[i] / this.GROWTH_DURATION;
            const scale = THREE.MathUtils.smoothstep(progress, 0, 1);
            
            flower.scale.set(scale, scale, scale);
            
            // Add gentle swaying motion
            const sway = Math.sin(Date.now() * 0.002 + flower.position.x) * 0.05;
            flower.rotation.z = sway;
        }
    }
} 
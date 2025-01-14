import * as THREE from 'three';

export class FlowerEffect {
    private scene: THREE.Scene;
    private flowers: THREE.Group[] = [];
    private growthProgress: number[] = [];
    private readonly GROWTH_DURATION = 1000; // 1 second to grow
    private readonly MAX_FLOWERS = 50;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    private createFlower(): THREE.Group {
        const flower = new THREE.Group();

        // Create stem
        const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
        const stemMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.75;
        flower.add(stem);

        // Create petals
        const petalColors = [0xFF69B4, 0xFFB6C1, 0xFFC0CB, 0xFF1493]; // Pink variations
        const petalGeometry = new THREE.CircleGeometry(0.3, 5);
        
        for (let i = 0; i < 8; i++) {
            const petalMaterial = new THREE.MeshPhongMaterial({ 
                color: petalColors[Math.floor(Math.random() * petalColors.length)],
                side: THREE.DoubleSide
            });
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            petal.position.y = 1.5;
            petal.rotation.y = (i / 8) * Math.PI * 2;
            petal.rotation.x = Math.PI / 4;
            flower.add(petal);
        }

        // Create center
        const centerGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const centerMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFF00 });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = 1.5;
        flower.add(center);

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
            
            // Random position near the road
            const side = Math.random() < 0.5 ? -1 : 1;
            const x = (6 + Math.random() * 10) * side;
            const z = -Math.random() * 100;
            
            flower.position.set(x, 0, z);
            flower.rotation.y = Math.random() * Math.PI * 2;
            
            this.scene.add(flower);
            this.flowers.push(flower);
            this.growthProgress.push(0);
        }
    }

    update(): void {
        const deltaTime = 16.67; // Approximately 60 FPS
        
        for (let i = this.flowers.length - 1; i >= 0; i--) {
            const flower = this.flowers[i];
            this.growthProgress[i] = Math.min(this.growthProgress[i] + deltaTime, this.GROWTH_DURATION);
            
            // Smooth growth animation
            const progress = this.growthProgress[i] / this.GROWTH_DURATION;
            const scale = THREE.MathUtils.smoothstep(progress, 0, 1);
            
            flower.scale.set(scale, scale, scale);
            
            // Add gentle swaying motion
            const sway = Math.sin(Date.now() * 0.002 + flower.position.x) * 0.1;
            flower.rotation.z = sway;
        }
    }
} 
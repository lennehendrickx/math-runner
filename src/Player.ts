import * as THREE from 'three';

export class Player {
    private mesh: THREE.Group;
    private speed: number = 5;
    private position: THREE.Vector3;
    private readonly MIN_Z = 0;      // Closest to camera
    private readonly MAX_Z = 4;      // Furthest from camera
    private readonly MIN_X = -3.5;   // Leftmost position
    private readonly MAX_X = 3.5;    // Rightmost position

    constructor() {
        this.mesh = new THREE.Group();
        this.position = new THREE.Vector3(0, 0.5, 0);

        // Create unicorn body
        const bodyGeometry = new THREE.CapsuleGeometry(0.3, 0.6, 4, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFB6C1,  // Light pink
            shininess: 100 
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.5;

        // Create legs
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.05, 0.4);
        const legMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFF69B4,  // Hot pink
            shininess: 100 
        });

        // Create 4 legs
        const positions = [
            { x: -0.2, z: -0.2 },
            { x: -0.2, z: 0.2 },
            { x: 0.2, z: -0.2 },
            { x: 0.2, z: 0.2 }
        ];

        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos.x, 0.2, pos.z);
            this.mesh.add(leg);
        });

        // Create head
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFB6C1,  // Light pink
            shininess: 100 
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0.4, 0.7, 0);

        // Create horn
        const hornGeometry = new THREE.ConeGeometry(0.08, 0.3, 8);
        const hornMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,  // Gold
            metalness: 0.5,
            roughness: 0.3
        });
        const horn = new THREE.Mesh(hornGeometry, hornMaterial);
        horn.position.set(0.1, 0.2, 0);
        horn.rotation.z = -Math.PI / 4;
        head.add(horn);

        // Create mane
        const maneGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const maneMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFF1493,  // Deep pink
            shininess: 100 
        });
        const mane = new THREE.Mesh(maneGeometry, maneMaterial);
        mane.position.set(-0.1, 0.1, 0);
        mane.scale.set(1, 0.8, 1);
        head.add(mane);

        // Create tail
        const tailGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
        const tailMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFF1493,  // Deep pink
            shininess: 100 
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(-0.5, 0.5, 0);
        tail.rotation.z = Math.PI / 4;

        // Add all parts to the group
        this.mesh.add(body);
        this.mesh.add(head);
        this.mesh.add(tail);

        // Set initial position
        this.mesh.position.copy(this.position);
    }

    getMesh(): THREE.Group {
        return this.mesh;
    }

    getPosition(): THREE.Vector3 {
        return this.position.clone();
    }

    handleInput(key: string): void {
        switch (key) {
            case 'ArrowLeft':
                if (this.position.x > this.MIN_X) {
                    this.position.x -= 0.5;
                }
                break;
            case 'ArrowRight':
                if (this.position.x < this.MAX_X) {
                    this.position.x += 0.5;
                }
                break;
            case 'ArrowUp':
                if (this.position.z > this.MIN_Z) {
                    this.position.z -= 0.5;
                }
                break;
            case 'ArrowDown':
                if (this.position.z < this.MAX_Z) {
                    this.position.z += 0.5;
                }
                break;
        }
    }

    update(deltaTime: number): void {
        this.mesh.position.copy(this.position);
        // Add a gentle bobbing motion
        this.mesh.position.y += Math.sin(Date.now() * 0.005) * 0.05;
    }
} 
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
        this.position = new THREE.Vector3(0, 0.5, 2);

        // Create sheep body (fluffy and round)
        const bodyGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xF5F5F5,  // White
            roughness: 1,     // Maximum roughness for wool effect
            metalness: 0      // No metallic effect for wool
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        
        // Add wool tufts to make it fluffier
        const addWoolTuft = (x: number, y: number, z: number, scale: number = 1) => {
            const tuftGeometry = new THREE.SphereGeometry(0.2 * scale, 8, 8);
            const tuft = new THREE.Mesh(tuftGeometry, bodyMaterial);
            tuft.position.set(x, y, z);
            body.add(tuft);
        };

        // Add multiple wool tufts around the body
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            addWoolTuft(
                Math.cos(angle) * 0.3,
                Math.random() * 0.2,
                Math.sin(angle) * 0.3,
                0.8 + Math.random() * 0.4
            );
        }

        // Create legs (slightly shorter and cuter)
        const legGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.3);
        const legMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x222222,  // Dark grey
            shininess: 30 
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
            leg.position.set(pos.x, 0.15, pos.z);
            this.mesh.add(leg);
        });

        // Create head (slightly smaller and rounder)
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x222222,  // Dark grey
            shininess: 30 
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0.3, 0.7, 0);
        head.scale.set(0.8, 0.8, 0.8);

        // Add eyes
        const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFFFF,
            shininess: 100 
        });
        const pupilMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x000000,
            shininess: 100 
        });

        [-1, 1].forEach(side => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(0.15, 0.05, 0.12 * side);
            eye.scale.set(0.6, 1, 0.6);
            
            const pupil = new THREE.Mesh(
                new THREE.SphereGeometry(0.02, 8, 8),
                pupilMaterial
            );
            pupil.position.z = 0.04;
            eye.add(pupil);
            
            head.add(eye);
        });

        // Add ears (floppy and cute)
        const earGeometry = new THREE.CapsuleGeometry(0.08, 0.12, 4, 8);
        const earMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x222222,  // Dark grey
            shininess: 30 
        });

        [-1, 1].forEach(side => {
            const ear = new THREE.Mesh(earGeometry, earMaterial);
            ear.position.set(-0.05, 0.15, 0.15 * side);
            ear.rotation.set(0.3, 0, 0.4 * side);
            head.add(ear);
        });

        // Add all parts to the group
        this.mesh.add(body);
        this.mesh.add(head);

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
        // Add a slight tilt when moving
        if (this.position.x !== 0) {
            const tiltAmount = Math.min(Math.abs(this.position.x) * 0.1, 0.2);
            this.mesh.rotation.z = -Math.sign(this.position.x) * tiltAmount;
        } else {
            this.mesh.rotation.z = 0;
        }
    }
} 
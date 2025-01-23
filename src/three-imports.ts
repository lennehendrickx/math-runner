// Single import and export of Three.js
import * as THREE from 'three';
export { THREE };

// Also export individual commonly used items
export const {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Mesh,
    Group,
    Vector3,
    // Add other commonly used Three.js classes here
} = THREE; 
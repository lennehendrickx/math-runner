import * as THREE from 'three';
import { Game } from './Game';

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    game.animate();
}); 
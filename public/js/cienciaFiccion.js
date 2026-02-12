import { Producto } from './producto.js';

export class CienciaFiccion extends Producto {
    #autor;

    constructor(nombre, precio, descripcion, imagen, autor) {
        super(nombre, precio, descripcion, imagen);
        this.#autor = autor;
    }

    get autor() {
        return this.#autor;
    }

    set autor(value) {
        this.#autor = value;
    }
}
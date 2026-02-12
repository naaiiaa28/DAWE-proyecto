import { Producto } from './producto.js';

export class Comic extends Producto {
    #ilustrador;

    constructor(nombre, precio, descripcion, imagen, ilustrador) {
        super(nombre, precio, descripcion, imagen);
        this.#ilustrador = ilustrador;
    }

    get ilustrador() {
        return this.#ilustrador;
    }

    set ilustrador(value) {
        this.#ilustrador = value;
    }
}
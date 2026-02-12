import { Producto } from './producto.js';

export class Ensayo extends Producto {
    #editor;

    constructor(nombre, precio, descripcion, imagen, editor) {
        super(nombre, precio, descripcion, imagen);
        this.#editor = editor;
    }

    get editor() {
        return this.#editor;
    }

    set editor(value) {
        this.#editor = value;
    }
}
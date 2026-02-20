const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// La carpeta 'public' está un nivel arriba de 'js'
const publicPath = path.join(__dirname, '..');

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(publicPath));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Ruta de prueba para verificar que funciona
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor DAWE funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor en todas las interfaces (0.0.0.0) para acceso externo
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor DAWE corriendo en http://0.0.0.0:${PORT}`);
    console.log(`📁 Sirviendo archivos desde: ${publicPath}`);
    console.log(`🌐 Accede desde el navegador: http://localhost:${PORT}`);
});

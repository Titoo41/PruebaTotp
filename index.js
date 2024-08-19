const express = require('express');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const app = express();
app.use(express.urlencoded({ extended: true }));

// Simulación de base de datos en memoria para guardar el secreto
let secreto;

// Ruta para mostrar el código QR
app.get('/', (req, res) => {
    // Generar el secreto para el usuario
    secreto = speakeasy.generateSecret({ name: 'MiApp' });

    // Generar el código QR basado en la URL OTPAuth
    qrcode.toDataURL(secreto.otpauth_url, (err, data) => {
        if (err) throw err;

        // Mostrar el código QR en la página
        res.send(`
            <h2>Escanea este código QR en tu app de autenticación</h2>
            <img src="${data}" alt="Código QR">
            <p>Luego ingresa el código en la siguiente página.</p>
            <form action="/verificar" method="POST">
                <input type="text" name="codigo" placeholder="Código de autenticación" required>
                <button type="submit">Verificar</button>
            </form>
        `);
    });
});

// Ruta para verificar el código TOTP ingresado
app.post('/verificar', (req, res) => {
    const codigoIngresado = req.body.codigo;

    // Verificación del código TOTP
    const verificado = speakeasy.totp.verify({
        secret: secreto.base32, // Usar el secreto almacenado
        encoding: 'base32',
        token: codigoIngresado
    });

    if (verificado) {
        res.send('Código correcto. ¡Acceso concedido!');
    } else {
        res.send('Código incorrecto. Inténtalo de nuevo.');
    }
});

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));

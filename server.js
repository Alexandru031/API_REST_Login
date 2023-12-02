// Create express app
const https = require('https');
const fs = require('fs');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cryptoJS = require("crypto-js");
const path = require("path");

const app = express();
const PORT = 3000;
const HTTPS_PORT = 3443;

var username_guardado = "";

// CREA EL PROTOCOLO HTTPS CON LOS CERTIFICADOS PARA ACCEDER ES "https:/localhost:3443/..."
https.createServer({
  cert: fs.readFileSync('certificados/ca.crt'),
  key: fs.readFileSync('certificados/ca.key')
},app).listen(HTTPS_PORT, function(){
 console.log(`Servidor https correindo en el puerto ${HTTPS_PORT}`);
});

// Conectar a la base de datos SQLite3
const db = new sqlite3.Database('db.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Conectado a la base de datos SQLite en disco');
  }
});

// Crear tabla si no existe
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, email TEXT, password TEXT, anotaciones TEXT,token TEXT)");
});

// Configurar middleware para parsear el body de las solicitudes
app.use(express.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// MOSTRAR LA PAGINA DE REGISTRAR
app.get('/registrar', (req, res) => {
  res.sendFile(__dirname + '/registrar.html');
});

// MOSTRAR LA PAGINA DE LOGIN
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// MOSTRAR LA PAGINA DE ACCEDER
app.get('/acceder', (req, res) => {
  res.sendFile(__dirname + '/acceder.html');
});

// GUARDAR EL REGISTRO EN LA BASE DE DATOS
app.post('/guardarUsuario/', (req, res) => {
  const { username_registrar, email, contrasena, contrasena_intento, anotacion} = req.body;
  if (contrasena != contrasena_intento) {
    res.status(400).json({"error":"La contraseña no es lo mismo"});
    return res.redirect("/registrar")
  }
  if (!validarEmail(email)) {
    res.status(400).json({"error":"El email es incorrecto"});
    return res.redirect("/registrar")
  }
  if (contrasena.length < 8) {
    res.status(400).json({"error":"La contraseña debe tener al menos 8 caracteres"});
    return res.redirect("/registrar")
  }

    // GENERA TOKEN
    const token = jwt.sign({ 
    name: username_registrar,
    password: contrasena
}, "secreto")

  // ENCRIPTAR ANOTACION
  var ciphertext = cryptoJS.AES.encrypt(anotacion, "secreto").toString();

  // ALMACENAR LOS DATOS EN BASE DE DATOS
  db.run('INSERT INTO usuarios (nombre, email, password, anotaciones ,token) VALUES (?, ?, ?, ?, ?)', [username_registrar, email, bcrypt.hashSync(contrasena, 10), ciphertext, token], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.redirect('/login'); // Redireccionar a la página del formulario después de guardar
  });

  function validarEmail(email) {
    let pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return pattern.test(email); // Verificar si el email coincide con el patrón
  }
});

// MOSTRAR JSON DE USUARIOS
app.get("/api/usuarios", (req, res, next) => {
  var sql = "select * from usuarios"
  var params = []
  db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "data":rows
      })
    });
});

// MOSTRAR DATOS DE USUARIO AL ACCEDER A UN USUARIO
app.post('/accederUsuario', (req, res) => {
  const { username_login, contrasena_login } = req.body;
  var sql = "SELECT nombre, password, anotaciones FROM usuarios WHERE nombre = ?";
  var params = [username_login];
  
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    
    if (!row) {
      res.status(400).json({ "error": "Usuario no encontrado" });
      return;
    }
    bcrypt.compare(contrasena_login, row.password, (bcryptErr, result) => {
      if (bcryptErr) {
        res.status(500).json({ "error": bcryptErr.message });
        return;
      }
      
      if (!result) {
        res.status(400).json({ "error": "La contraseña es incorrecta" });
        return;
      }
      var bytes  = cryptoJS.AES.decrypt(row.anotaciones, 'secreto');
      var originalText = bytes.toString(cryptoJS.enc.Utf8);
      res.render('acceder', {anotacion: originalText});
    });
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
// Create express app
// index.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

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
  db.run("CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, email TEXT, password TEXT)");
});

// Configurar middleware para parsear el body de las solicitudes
app.use(express.urlencoded({ extended: true }));

// MOSTRAR LA PAGINA DE REGISTRAR
app.get('/registrar', (req, res) => {
  res.sendFile(__dirname + '/registrar.html');
});

// MOSTRAR LA PAGINA DE LOGIN
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// GUARDAR DATOS EN LA BASES DE DATOS
app.post('/guardarUsuario', (req, res) => {
  const { username_registrar, email, contrasena, contrasena_intento} = req.body;
  if (contrasena != contrasena_intento) {
    return res.redirect("/registrar")
  }

  db.run('INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)', [username_registrar, email, contrasena], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.redirect('/login'); // Redireccionar a la página del formulario después de guardar
  });
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

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
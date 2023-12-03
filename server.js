// Create express app
const https = require("https");
const fs = require("fs");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cryptoJS = require("crypto-js");
const path = require("path");
var db = require("./database.js");

const app = express();
const PORT = 3000;
const HTTPS_PORT = 3443;

var name_Usuario = "";

// CREA EL PROTOCOLO HTTPS CON LOS CERTIFICADOS PARA ACCEDER ES "https:/localhost:3443/..."
https
  .createServer(
    {
      cert: fs.readFileSync("certificados/ca.crt"),
      key: fs.readFileSync("certificados/ca.key"),
    },
    app
  )
  .listen(HTTPS_PORT, function () {
    console.log(`Servidor https correindo en el puerto ${HTTPS_PORT}`);
  });

// Configurar middleware para parsear el body de las solicitudes
app.use(express.urlencoded({ extended: true }));

// AÑADE VIEW ENGINE DE EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// MOSTRAR LA PAGINA DE REGISTRAR
app.get("/registrar", (req, res) => {
  res.sendFile(__dirname + "/registrar.html");
});

// MOSTRAR LA PAGINA DE LOGIN
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.post("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

// MOSTRAR LA PAGINA DE ACCEDER
app.get("/acceder", (req, res) => {
  res.sendFile(__dirname + "/views/acceder.ejs");
});

// MOSTRAR LA PAGINA DE ANOTACION
app.get("/anotacion", (req, res) => {
  res.sendFile(__dirname + "/anotacion.html");
});

// GUARDAR EL REGISTRO EN LA BASE DE DATOS
app.post("/guardarUsuario/", (req, res) => {
  const {
    username_registrar,
    email,
    contrasena,
    contrasena_intento,
  } = req.body;
  if (contrasena != contrasena_intento) {
    res.status(400).json({ error: "La contraseña no es lo mismo" });
    return res.redirect("/registrar");
  }
  if (!validarEmail(email)) {
    res.status(400).json({ error: "El email es incorrecto" });
    return res.redirect("/registrar");
  }
  if (contrasena.length < 8) {
    res
      .status(400)
      .json({ error: "La contraseña debe tener al menos 8 caracteres" });
    return res.redirect("/registrar");
  }

  // GENERA TOKEN
  const token = jwt.sign(
    {
      name: username_registrar,
      password: contrasena,
    },
    "secreto"
  );

  // ALMACENAR LOS DATOS EN BASE DE DATOS
  db.run(
    "INSERT INTO usuarios (name, email, password ,token) VALUES (?, ?, ?, ?)",
    [username_registrar, email, bcrypt.hashSync(contrasena, 10), token],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      var sql_select_id = "SELECT id, name FROM usuarios WHERE name = ?";
      var params_select = [username_registrar];

      db.get(sql_select_id, params_select, (err, row_select) => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }

        if (!row_select) {
          res.status(400).json({ error: "Usuario no encontrado" });
          return;
        }
            res.redirect('/login'); // Redireccionar a la página del formulario después de guardar
      });
    }
  );

  function validarEmail(email) {
    let pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return pattern.test(email); // Verificar si el email coincide con el patrón
  }
});

// MOSTRAR JSON DE USUARIOS
app.get("/api/usuarios", (req, res, next) => {
  var sql_usuarios = "select * from usuarios";
  var sql_anotaciones = "select * from anotaciones";
  var params = [];
  db.all(sql_usuarios, params, (err, rows1) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    db.all(sql_anotaciones, params, (err, rows2) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        "usuarios": rows1,
        "anotaciones": rows2
      });
    });
  });
});

// MOSTRAR DATOS DE USUARIO AL ACCEDER A UN USUARIO
app.post("/accederUsuario", (req, res) => {
  const { username_login, contrasena_login } = req.body;
  var sql =
    "SELECT id, name, password FROM usuarios WHERE name = ?";
  var params = [username_login];

  db.get(sql, params, (err, row1) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (!row1) {
      res.status(400).json({ error: "Usuario no encontrado" });
      return;
    }

    name_Usuario = username_login
// Dentro de tu ruta /accederUsuario
db.all("SELECT id, anotacion FROM anotaciones WHERE user_id = ?", [row1.id], (err, ant) => {
  if (err) {
    return res.status(500).json({ error: err.message });
  }

  bcrypt.compare(contrasena_login, row1.password, (bcryptErr, result) => {
    if (bcryptErr) {
      res.status(500).json({ error: bcryptErr.message });
      return;
    }

    if (!result) {
      res.status(400).json({ error: "La contraseña es incorrecta" });
      return;
    }

    // Desencriptar cada anotación en 'ant'
    const decryptedAnotaciones = ant.map(anotacion => {
      const bytes = cryptoJS.AES.decrypt(anotacion.anotacion, 'secreto');
      const decryptedData = bytes.toString(cryptoJS.enc.Utf8);
      return { id: anotacion.id, anotacion: decryptedData };
    });

    res.render("acceder", { anotaciones: decryptedAnotaciones, nombre: row1.name }); // Envía las anotaciones a la vista
  });
});
  });
});

// AÑADIR UNA ANOTACIÓN
app.post("/anadirAnotaciones", (req, res) => {
  const { texto_anotacion } = req.body;

  var sql = "SELECT id, name, password FROM usuarios WHERE name = ?";
  var params = [name_Usuario];

  db.get(sql, params, (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Encriptar Anotación
    let encriptar = cryptoJS.AES.encrypt(texto_anotacion, 'secreto').toString();

    db.run(
      "INSERT INTO anotaciones (user_id, anotacion) VALUES (?, ?)",
      [row.id, encriptar], // Reemplaza id_Usuario por row.id
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        db.all("SELECT id, anotacion FROM anotaciones WHERE user_id = ?", [row.id], (err, ant) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
            // Desencriptar cada anotación en 'ant'
              const decryptedAnotaciones = ant.map(anotacion => {
              const bytes = cryptoJS.AES.decrypt(anotacion.anotacion, 'secreto');
              const decryptedData = bytes.toString(cryptoJS.enc.Utf8);
              return { id: anotacion.id, anotacion: decryptedData };
            });
        
            res.render("acceder", { anotaciones: decryptedAnotaciones, nombre: row.name }); // Envía las anotaciones a la vista
          });
          });
        });

      });

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
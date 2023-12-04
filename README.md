# Bienvenidos al Repositorio GitHub de la API REST de Login

Antes de probar mi proyecto de login, quiero mostraros una pequeña guía para que podáis identificar claramente cada archivo del proyecto. Sin más preámbulos, empecemos:

## ¿Para qué sirve este repositorio?

Este repositorio exhibe un sistema de login que permite crear una cuenta de usuario, acceder al usuario validando los datos y crear anotaciones para almacenar en bases de datos. Utilicé **HTML5**, **CSS3**, **JavaScript** y **SQL** para su desarrollo, empleando **Node.js** y **Express.js** como entorno principal. Además, instalé diferentes dependencias en el proyecto Node.js, entre las cuales se encuentran: **https**, **fs**, **sqlite3**, **bcrypt**, **jsonwebtoken**, **crypto.js**, **mkcert**, **ejs** y **path**. El desarrollo del proyecto se extendió aproximadamente por 1 semana. Quedan mejoras pendientes en funcionalidades y corrección de errores.

## ¿Cómo abrir el proyecto?

Si estás interesado en abrir mi proyecto, necesitas cumplir con estos requisitos:

- Tener instalado **Node.js** y **Express.js**.
- Contar con un sistema de gestión de paquetes como `npm` o `yarn`.
- Haber instalado algunas dependencias mencionadas anteriormente.

Una vez tengas estos requisitos, ejecuta `npm run start` desde la línea de comandos, como `git` o `terminal`, y accede al navegador web mediante la siguiente URL: `https://localhost:3443/login` o `http://localhost:3000/login`.


### Carpeta de Certificados

Esta carpeta almacena los certificados de clave pública y privada necesarios para acceder a la API mediante el protocolo HTTPS. Contiene 2 archivos: la clave pública `ca.crt` y la clave privada `ca.key`, generados con la paquetería **mkcert** de Node.js utilizando tan solo 4 comandos.

### Carpeta de Views

Se trata de una carpeta aparte que contiene el archivo `acceder.ejs`. Este archivo es diferente ya que utiliza la extensión `.ejs`, permitiendo la ejecución de una dependencia de **Node.js** llamada **ejs**. Su función es mostrar los datos almacenados en la base de datos desde `server.js`, lo que facilita la visualización de los datos almacenados en la base de datos SQLite.

<p align="center">
  <img src="https://github.com/Alexandru031/API_REST_Login/blob/main/img_readme/anotaciones.PNG" alt="Descripción de la imagen" width="500px">
</p>

### Página de Anotación

El archivo `anotación.html` es un archivo `.html` que permite visualizar y añadir texto de anotación para un usuario. Muestra 2 botones que permiten borrar o añadir anotaciones. Una vez añadida una anotación, se redirecciona a `acceder.ejs`.


<p align="center">
  <img src="https://github.com/Alexandru031/API_REST_Login/blob/main/img_readme/anadir.PNG" alt="Descripción de la imagen" width="500px">
</p>


### Crear la tabla de base de datos

El archivo `database.js` es un archivo `.js` que facilita la creación de las tablas de la base de datos en caso de que no existan o estén vacías. Utiliza la dependencia de **sqlite3** de Node.js para crear un archivo `db.squlite` que contiene 2 tablas (*Usuarios* y *Anotaciones*) junto con los datos almacenados.

### Página de Login

El archivo `login.html` es un archivo `.html` que permite visualizar el formulario de login para acceder a la cuenta de usuario. Antes de conceder el acceso, valida los datos existentes en la base de datos. Una vez validados, redirecciona a `acceder.ejs`.

<p align="center">
  <img src="https://github.com/Alexandru031/API_REST_Login/blob/main/img_readme/login.PNG" alt="Descripción de la imagen" width="500px">
</p>

### Página de Registrar

El archivo `registrar.html` es un archivo `.html` que muestra el formulario de registro y creación de una cuenta de usuario. Solicita *Nombre de Usuario*, *Correo Electrónico*, *Contraseña* e *Intento de Contraseña*. Además, incluye 2 botones que permiten crear la cuenta de usuario y guardar los datos en la base de datos, o borrar todos los datos del formulario. Una vez creada la cuenta, se redirecciona a `login.html`.

<p align="center">
  <img src="https://github.com/Alexandru031/API_REST_Login/blob/main/img_readme/registrar.PNG" alt="Descripción de la imagen" width="500px">
</p>

### Archivo de API Rest

El archivo `server.js` es un archivo `.js` que centraliza las llamadas a la API REST para:
- Crear la base de datos conectándose con `database.js`.
- Guardar los datos.
- Gestionar las redirecciones de archivos y acceso a estos.
- Encriptar y desencriptar datos.
- Generar tokens para cada usuario.
- Verificar la seguridad de los datos y el acceso a los protocolos de seguridad.
- Mostrar errores de los datos y de la base de datos.
- Seleccionar los datos almacenados en la base de datos.

Es el archivo central que contiene todas las instrucciones de la API REST.

### Archivo de Validación de Datos (Fase en Desarrollo)

El archivo `validaciones.js` es un archivo `.js` que verifica la validez de los datos antes de enviarlos al servidor. Se encuentra en fase de desarrollo, por lo tanto, su implementación aún está en progreso y no se debe tomar en cuenta por el momento.

Con esta explicación, ahora podéis probar el código. Recuerda crear una cuenta en `registrar.html` antes de acceder al login, o si ya la tienes, no habrá problema.

¡Muchas gracias por el interés y espero que os haya gustado! 😊

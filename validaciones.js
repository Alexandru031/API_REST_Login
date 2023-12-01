/*document.getElementById("formulario").addEventListener("submit", (event) => {
  // cancela el comportamiento por defecto
  event.preventDefault();

  // Obtener los valores de los campos dentro del evento submit
  //let contra = form.querySelector("#contrasena").value;
  let email = form.querySelector("#email").value;

  if (!validarEmail(email)) {
    // Si el email no pasa la validación, muestra una alerta
    alert("El email es incorrecto");
  } else {
    // Si pasa la validación, se envía el formulario
    form.submit();
  }
});

function validarEmail(email) {
  let pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return pattern.test(email); // Verificar si el email coincide con el patrón
*/

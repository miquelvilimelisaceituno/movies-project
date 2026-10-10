# language: es
Característica: Favoritos del usuario
  Como usuario con sesión iniciada
  quiero marcar películas como favoritas
  para encontrarlas después en mi lista

  Escenario: Sin sesión no hay favoritos
    Dado que no he iniciado sesión
    Entonces mi lista de favoritos está vacía
    Y no se consulta Firestore

  Escenario: Ver mis favoritos
    Dado que he iniciado sesión como "Ana"
    Y "La llegada" y "Dune" son mis favoritas
    Entonces veo "La llegada" y "Dune", de la más reciente a la más antigua

  Escenario: Distinguir cargando de lista vacía
    Dado que he iniciado sesión como "Ana"
    Cuando Firestore todavía no ha respondido
    Entonces los favoritos están cargando
    Cuando Firestore responde sin documentos
    Entonces mi lista de favoritos está vacía

  Escenario: Error al leer los favoritos
    Dado que he iniciado sesión como "Ana"
    Cuando Firestore rechaza la lectura
    Entonces se informa de un error

  Escenario: Añadir una favorita
    Dado que he iniciado sesión como "Ana"
    Y "La llegada" no es favorita
    Cuando la marco como favorita
    Entonces se guarda en "users/u1/favorites/329865" con la fecha del servidor

  Escenario: Quitar una favorita
    Dado que he iniciado sesión como "Ana"
    Y "La llegada" es favorita
    Cuando la desmarco
    Entonces se borra su documento

  Escenario: El cambio no se guarda
    Dado que he iniciado sesión como "Ana"
    Cuando Firestore rechaza la escritura
    Entonces la operación falla y no se da por guardada

  Escenario: Cerrar sesión o cambiar de cuenta
    Dado que he iniciado sesión como "Ana" y tengo favoritas
    Cuando cierro sesión o entro como "Bea"
    Entonces se deja de escuchar la lista de "Ana"
    Y no se muestran sus favoritas

# language: es
Característica: Navegación principal
  Como cinéfilo
  Quiero un menú siempre visible
  Para moverme entre las secciones de Movies

  Escenario: Ver el menú en cualquier página
    Cuando entro en cualquier página de la aplicación
    Entonces veo arriba los enlaces «Inicio» y «Explorar»
    Y a su lado el menú de usuario

  Escenario: Ir a una sección
    Dado que estoy en la página de bienvenida
    Cuando pulso «Explorar»
    Entonces se abre /explorar sin recargar la aplicación

  Escenario: Saber en qué sección estoy
    Cuando estoy en /explorar
    Entonces el enlace «Explorar» aparece destacado y marcado como página actual
    Y el enlace «Inicio» no

  Escenario: Saltar al contenido con el teclado
    Dado que acabo de abrir una página
    Cuando pulso Tab
    Entonces aparece el enlace «Saltar al contenido»
    Y al activarlo el foco pasa al contenido principal

# Colección de Postman

La fuente de verdad de la colección son **estos archivos**, no lo que cada uno tenga cargado en su
Postman. Si tocás la colección en la app, el cambio no existe para el resto hasta que lo exportes
acá y lo mandes en un PR.

| Archivo | Qué es |
|---|---|
| `req2ticket.postman_collection.json` | La colección: 81 requests en 5 carpetas (Auth, Users, Epics, Sprints, Tickets) + una subcarpeta `Validaciones` en las tres últimas, con tests |
| `req2ticket.local.postman_environment.json` | El environment `req2ticket - Local`: solo `baseUrl` |

## Importar

1. Postman → **Import** → arrastrá los dos archivos.
2. Arriba a la derecha, seleccioná el environment **req2ticket - Local**.
3. Levantá la API: `dotnet run --project src/Web` (queda en `http://localhost:5080`).
4. Corré **Auth → Login correcto** antes que nada. Sin eso, el resto da 401.

## El token

La API pide JWT en todos los endpoints salvo `/api/auth/login` y `/api/auth/register`.

La colección tiene auth de tipo **Bearer** con el valor `{{token}}` a nivel colección, así que
todas las requests lo heredan sin que haya que tocarlas una por una. La variable la escribe el
test de `Login correcto`. Las pocas requests que no tienen que mandarlo — los logins, los
registros y los dos casos de 401 — lo declaran explícitamente con `noauth`.

Si empezás a ver 401 en todos lados, es que el token venció (`Jwt:ExpiresHours`, 8 por
defecto): volvé a correr el login.

`Registro nuevo` usa `beta+{{$timestamp}}@req2ticket.com` para que la colección se pueda correr
muchas veces seguidas sin chocar con el registro de la corrida anterior, y guarda su token en
`viewerToken`. Eso es lo que hace posible los casos `Viewer no puede crear épicas / tickets /
sprints -> 403`, que prueban que la autorización mira el rol y no solo la sesión.

## Actualizar la colección (cuando agregás o cambiás un endpoint)

1. Editá la request en Postman.
2. Click derecho sobre la colección → **Export** → formato **Collection v2.1** → guardá pisando
   `req2ticket.postman_collection.json`.
3. Lo mismo con el environment si lo tocaste (los tres puntitos del environment → **Export**).
4. Commiteá y abrí el PR junto con el cambio del back que lo motivó.

## Volver a importar sin duplicar

Los dos archivos tienen un `id` fijo (`_postman_id` en la colección, `id` en el environment). Si ya
los tenés importados y traés una versión actualizada, Postman detecta que es la misma y te ofrece
**Replace**. Elegí siempre esa opción: si le das a importar como nueva, terminás con dos colecciones
iguales en el sidebar.

**No cambies esos `id` al exportar.** Si tu export los pisa con otros valores, restauralos a mano
antes de commitear — si no, el resto del equipo va a empezar a ver duplicados.

## Cómo están armadas las variables

Las variables de colección (`baseUrl`, `seedEmail`, `seedPassword`, `userId`, `epicId`, `epicCode`,
`sprintId`, `ticketId`, `ticketCode`, `backlogTicketId`) viven adentro del JSON de la colección, así que
la colección funciona aunque no selecciones ningún environment. El environment define **solo**
`baseUrl` y pisa la de la colección: es el único valor que cambia si algún día apuntamos a un server
que no sea local.

Varias de esas variables las escriben los tests solos durante la corrida:

- `Login correcto` guarda `userId`
- `Crear épica (completa)` guarda `epicId` y `epicCode`, y las usan las requests de GET by id,
  GET by code, PUT y DELETE
- `Crear sprint` guarda `sprintId`
- `Crear historia de usuario (en un sprint)` guarda `ticketId` y `ticketCode`;
  `Crear tarea que cuelga de la historia` guarda `childTicketId`; `Crear bug` guarda
  `bugTicketId`; `Crear fix que cuelga del bug` guarda `fixTicketId`; y
  `Crear ticket (sin sprint, va al backlog)` guarda `backlogTicketId`

Por eso la colección se puede correr entera con el **Runner** de arriba a abajo. Los valores que
están hardcodeados en el JSON son solo defaults para cuando corrés una request suelta.

Las requests que cruzan entidades (`Tickets de la épica`, `Tickets del sprint`, y la creación de
tickets) apuntan a ids del seed —épica 1, sprint 2— y no a los recién creados: así siguen andando
cuando las corrés sueltas, sin depender de que la request anterior haya pasado. Las carpetas
`Sprints` y `Tickets` borran al final todo lo que crearon, así que la base queda como estaba.

La carpeta `Tickets` cubre los cuatro tipos (userStory, task, bug, fix), el `parentId` que los
encadena y el `extraFields` de cada uno. Dos casos que conviene no romper: una clave que no es
del tipo del ticket tiene que dar 400 nombrándola, y borrar un ticket padre tiene que llevarse
a sus hijos.

## Ojo con las contraseñas

`seedPassword` está en texto plano porque es la credencial del seed de una base SQLite local. En la
base ya no se guarda así: desde la rama del JWT las contraseñas van hasheadas con BCrypt, y lo que
queda acá es solo el texto plano que hay que mandarle al login para obtener el token.

El día que la colección apunte a un entorno que no sea local, esa variable no va más acá: va al
environment marcada como `secret`, y el environment con el valor real no se commitea.

## Alternativa sin Postman

`api/src/Web/Web.http` cubre los mismos casos y se corre desde VS Code con la extensión REST Client,
sin instalar nada más. Si tocás un endpoint, conviene actualizar los dos.

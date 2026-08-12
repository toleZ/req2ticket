# Colección de Postman

La fuente de verdad de la colección son **estos archivos**, no lo que cada uno tenga cargado en su
Postman. Si tocás la colección en la app, el cambio no existe para el resto hasta que lo exportes
acá y lo mandes en un PR.

| Archivo | Qué es |
|---|---|
| `req2ticket.postman_collection.json` | La colección: 22 requests en 3 carpetas + subcarpeta `Validaciones`, con tests |
| `req2ticket.local.postman_environment.json` | El environment `req2ticket - Local`: solo `baseUrl` |

## Importar

1. Postman → **Import** → arrastrá los dos archivos.
2. Arriba a la derecha, seleccioná el environment **req2ticket - Local**.
3. Levantá la API: `dotnet run --project src/Web` (queda en `http://localhost:5080`).

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

Las variables de colección (`baseUrl`, `seedEmail`, `seedPassword`, `userId`, `epicId`, `epicCode`)
viven adentro del JSON de la colección, así que la colección funciona aunque no selecciones ningún
environment. El environment define **solo** `baseUrl` y pisa la de la colección: es el único valor
que cambia si algún día apuntamos a un server que no sea local.

Tres de esas variables las escriben los tests solos durante la corrida:

- `Login correcto` guarda `userId`
- `Crear épica (completa)` guarda `epicId` y `epicCode`, y las usan las requests de GET by id,
  GET by code, PUT y DELETE

Por eso la colección se puede correr entera con el **Runner** de arriba a abajo. Los valores que
están hardcodeados en el JSON son solo defaults para cuando corrés una request suelta.

## Ojo con las contraseñas

`seedPassword` está en texto plano porque son las credenciales del seed de una base SQLite local y
el login todavía es simulado. Cuando haya auth de verdad, esa variable no va más en la colección:
va al environment marcada como `secret`, y el environment con el valor real no se commitea.

## Alternativa sin Postman

`api/src/Web/Web.http` cubre los mismos casos y se corre desde VS Code con la extensión REST Client,
sin instalar nada más. Si tocás un endpoint, conviene actualizar los dos.

const express = require('express');
const router = express.Router();

const admin = require('../helpers/firebase');
const FieldValue = require('firebase-admin').firestore.FieldValue;
const db = admin.firestore()

const ROUTES_COLLECTION_NAME = 'routes';
const ROUTES_INDEX_DOCUMENT_ID = 'ids';

/*
* Routes microservise. Basic CRUD
*
*/

/*
* pull all routes identifiers
*/
router.get('/', async (req, res, next) => {
  try {
    const routeDocsnapshot = await db.collection(ROUTES_COLLECTION_NAME).doc(ROUTES_INDEX_DOCUMENT_ID).get();
    if (!routeDocsnapshot.exists) {
      // Document does not exists.
      res.status(404);
      res.send({ message: 'Route IDS document not found, constant support ASAP.' })
      return
    }

    const queryData = routeDocsnapshot.data();
    res.status(200);
    res.send({ ...queryData });
  } catch (error) {
    res.status(500);
    res.send({ error });
  }
  return;
});

/*
* pull a route by ID, if the route does not exits, returns error
*/
router.get('/:routeId', async (req, res, next) => {
  try {
    const routeDocsnapshot = await db.collection(ROUTES_COLLECTION_NAME).doc(req.params.routeId).get();
    if (!routeDocsnapshot.exists) {
      // Document does not exists.
      res.status(404);
      res.send({ message: 'Route does not exist.' })
      return
    }

    const queryData = routeDocsnapshot.data();
    res.status(200);
    res.send({ ...queryData });
  } catch (error) {
    res.status(500);
    res.send({ error });
  }
  return;
});

/*
* Creates a new route, if the route exist, returns an error.
*/
router.post('/', async (req, res, next) => {
  const newRoute = req.body;
  const newRouteId = newRoute.properties.route_id_ruta_zonal;
  try {
    const routeDocRef = db.collection(ROUTES_COLLECTION_NAME).doc(`${newRouteId}`);
    const routeDocsnapshot = await routeDocRef.get();
    if (routeDocsnapshot.exists) {
      // Document does exists.
      res.status(500);
      res.send({ message: 'Route already exists.' })
      return
    }
    const setRouteResult = await routeDocRef.set({...newRoute});
    if (!setRouteResult) {
      res.status(500);
      res.send({message: 'Error writing new route'});
      return;
    }

    const updateRouteIndexResult = await db.collection(ROUTES_COLLECTION_NAME).doc(ROUTES_INDEX_DOCUMENT_ID).update({
      [newRoute.properties.route_id_ruta_zonal]: {
        name: newRoute.properties.codigo_definitivo_ruta_zonal,
        denomination: newRoute.properties.denominacion_ruta_zonal
      }
    })

    if (!updateRouteIndexResult) {
      res.status(500);
      res.send({message: 'Error writing new route index, index may be out of date.'});
      return;
    }

    res.status(201);
    res.send({ message: 'OK' });
  } catch (error) {
    res.status(500);
    console.log(error)
    res.send({message: 'Internal error'});
  }
  return;
});

/*
* Replaces the existing data of a route, if the route doesn't exist, returns error.
*/
router.put('/:routeId', async (req, res, next) => {
  const newRoute = req.body;
  const newRouteId = newRoute.properties.route_id_ruta_zonal;
  try {
    const routeDocRef = db.collection(ROUTES_COLLECTION_NAME).doc(`${newRouteId}`);
    const routeDocsnapshot = await routeDocRef.get();
    if (!routeDocsnapshot.exists) {
      // Document does exists.
      res.status(404);
      res.send({ message: 'Route does not exist.' })
      return
    }

    const setResult = await routeDocRef.set({...newRoute});
    if (!setResult) {
      res.status(500);
      res.send({message: 'Error writing'});
      return;
    }

    const updateRouteIndexResult = await db.collection(ROUTES_COLLECTION_NAME).doc(ROUTES_INDEX_DOCUMENT_ID).update({
      [newRoute.properties.route_id_ruta_zonal]: {
        name: newRoute.properties.codigo_definitivo_ruta_zonal,
        denomination: newRoute.properties.denominacion_ruta_zonal
      }
    })

    if (!updateRouteIndexResult) {
      res.status(500);
      res.send({message: 'Error updating new route index, index may be out of date.'});
      return;
    }

    res.status(201);
    res.send({ message: 'OK' });
  } catch (error) {
    res.status(500);
    console.log(error)
    res.send({message: 'Internal error'});
  }
  return;
});

/*
* Delete a route, if the route doesn't exist, returns error.
*/
router.delete('/:routeId', async (req, res, next) => {
  const routeId = req.params.routeId;

  if (!routeId) {
    // No routeID present, return error
    res.status(400);
    res.send({ message: "Bad requets." });
    return
  }

  try {
    const routeDocRef = db.collection(ROUTES_COLLECTION_NAME).doc(routeId);
    const routeDocsnapshot = await routeDocRef.get();
    if (!routeDocsnapshot.exists) {
      // Document does not exists.
      res.status(404);
      res.send({ message: 'Route does not exist.' })
      return
    }

    const deleteResult = await routeDocRef.delete();

    if (!deleteResult) {
      res.status(500);
      res.send({message: 'Error deleting route, index may be out of date.'});
      return;
    }

    const updateRouteIndexResult = await db.collection(ROUTES_COLLECTION_NAME).doc(ROUTES_INDEX_DOCUMENT_ID).update({
      [routeId]: FieldValue.delete()
    })

    if (!updateRouteIndexResult) {
      res.status(500);
      res.send({message: 'Error updating new route index, index may be out of date.'});
      return;
    }

    res.status(200);
    res.send({ message: 'OK' });
  } catch (error) {
    res.status(500);
    console.log(error)
    res.send({ error });
  }
  return;
});

module.exports = router;

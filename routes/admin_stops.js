const express = require('express');
const router = express.Router();

const admin = require('../helpers/firebase');
const FieldValue = require('firebase-admin').firestore.FieldValue;
const db = admin.firestore()

const STOPS_COLLECTION_NAME = 'stops';
const STOPS_INDEX_DOCUMENT_ID = 'index';

/*
* Stops microservise. Basic CRUD
*
*/

/*
* Pull all Stops identifiers
*/
router.get('/', async (req, res, next) => {
  try {
    const stopSnapshot = await db.collection(STOPS_COLLECTION_NAME).doc(STOPS_INDEX_DOCUMENT_ID).get();
    const data = stopSnapshot.data()
    res.status(200);
    res.send({ ...data });

  } catch (error) {
    res.status(500);
    console.error(error)
    res.send({ error });
  }
  return;
});

/*
* pull a stop by ID, if the stop does not exits, returns error
*/
router.get('/:stopId', async (req, res, next) => {
  try {
    const stopSnapshot = await db.collection(STOPS_COLLECTION_NAME).doc(req.params.stopId).get();
    if (!stopSnapshot.exists) {
      // Document does not exists.
      res.status(404);
      res.send({ message: 'Stop does not exist.' })
      return
    }

    const queryData = stopSnapshot.data();
    res.status(200);
    res.send({ ...queryData });
  } catch (error) {
    res.status(500);
    res.send({ error });
  }
  return;
});

/*
* Creates a new stop, if the route exist, returns an error.
*/
router.post('/', async (req, res, next) => {
  const newStop = req.body;
  const newStopId = newStop.cenefa_paradero;
  try {
    const stopDocRef = db.collection(STOPS_COLLECTION_NAME).doc(`${newStopId}`);
    const stopDocsnapshot = await stopDocRef.get();
    if (stopDocsnapshot.exists) {
      // Document does exists.
      res.status(500);
      res.send({ message: 'Stop already exists.' })
      return
    }
    const setStopResult = await stopDocRef.set({ ...newStop });
    if (!setStopResult) {
      res.status(500);
      res.send({ message: 'Error writing new stop' });
      return;
    }

    const updateStopIndexResult = await db.collection(STOPS_COLLECTION_NAME).doc(STOPS_INDEX_DOCUMENT_ID).update({
      cenefas: FieldValue.arrayUnion(newStopId)
    })

    if (!updateStopIndexResult) {
      res.status(500);
      res.send({ message: 'Error writing new stop index, index may be out of date.' });
      return;
    }

    res.status(201);
    res.send({ message: 'OK' });
  } catch (error) {
    res.status(500);
    console.log(error)
    res.send({ message: 'Internal error' });
  }
  return;
});

/*
* Replaces the existing data of a route, if the route doesn't exist, returns error.
*/
router.put('/:stopId', async (req, res, next) => {
  const newStop = req.body;
  const newStopId = newStop.cenefa_paradero;
  try {
    const stopDocRef = db.collection(STOPS_COLLECTION_NAME).doc(`${newStopId}`);
    const stopDocsnapshot = await stopDocRef.get();
    if (!stopDocsnapshot.exists) {
      // Document does exists.
      res.status(404);
      res.send({ message: 'Stop does not exist.' })
      return
    }

    const setResult = await stopDocRef.set({ ...newStop });
    if (!setResult) {
      res.status(500);
      res.send({ message: 'Error writing' });
      return;
    }

    res.status(201);
    res.send({ message: 'OK' });
  } catch (error) {
    res.status(500);
    console.log(error)
    res.send({ message: 'Internal error' });
  }
  return;
});

/*
* Delete a route, if the route doesn't exist, returns error.
*/
router.delete('/:stopId', async (req, res, next) => {
  const stopId = req.params.stopId;

  if (!stopId) {
    // No stopId present, return error
    res.status(400);
    res.send({ message: "Bad requets." });
    return
  }

  try {
    const stopDocRef = db.collection(STOPS_COLLECTION_NAME).doc(stopId);
    const stopDocsnapshot = await stopDocRef.get();
    if (!stopDocsnapshot.exists) {
      // Document does not exists.
      res.status(404);
      res.send({ message: 'Stop does not exist.' })
      return
    }

    const deleteResult = await stopDocRef.delete();

    if (!deleteResult) {
      res.status(500);
      res.send({ message: 'Error deleting Stop, index may be out of date.' });
      return;
    }

    const updateRouteIndexResult = await db.collection(STOPS_COLLECTION_NAME).doc(STOPS_INDEX_DOCUMENT_ID).update({
      cenefas: FieldValue.arrayRemove(stopId)
    })

    if (!updateRouteIndexResult) {
      res.status(500);
      res.send({ message: 'Error updating stops index, index may be out of date.' });
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

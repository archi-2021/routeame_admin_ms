const express = require('express');
const router = express.Router();

const admin = require('../helpers/firebase');
const db = admin.firestore()


const ROUTES_COLLECTION_NAME = 'routes';
const ROUTES_INDEX_DOCUMENT_ID = 'ids';
const STOPS_COLLECTION_NAME = 'stops';
const STOPS_INDEX_DOCUMENT_ID = 'index';

/*
* Search microservise. non composed
*/

/*
* Pull all routes by partial id on name or code.
*/
router.get('/routes/:routeID', async (req, res, next) => {
  const partialID = req.params.routeID;

  try {
    const routesDocSnapshot = await db.collection(ROUTES_COLLECTION_NAME).doc(ROUTES_INDEX_DOCUMENT_ID).get();

    if (!routesDocSnapshot.exists) {
      res.status(500)
      res.send({message: 'Index not found, contact admin.'})
    }

    const routesData = routesDocSnapshot.data()
    const routesIDs = Object.keys(routesData)

    const partiaRouteIDRegex = new RegExp(partialID, 'i')
    const availableRoutes = []

    routesIDs.forEach((routeID) => {
      if(partiaRouteIDRegex.test(routesData[routeID].name) || partiaRouteIDRegex.test(routesData[routeID].denomination)) availableRoutes.push({
        id: routeID,
        readableLabel: `${routesData[routeID].name} - ${routesData[routeID].denomination}`,
        ...routesData[routeID]
      })
    })

    res.status(200);
    res.send({availableRoutes});

  } catch (error) {
    res.status(500);
    console.error(error)
    res.send({ error });
  }
  return;
});

module.exports = router;
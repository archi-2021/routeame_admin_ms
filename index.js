const express = require('express');
const routesRouter = require('./routes/admin_routes');
const stopsRouter = require('./routes/admin_stops');
const searchRouter = require('./routes/admin_search');

const app = express();
const port = 3000

app.use(express.json()) // for parsing application/json

app.use('/routes', routesRouter);
app.use('/stops', stopsRouter);
app.use('/search', searchRouter);

app.listen(port, () => {
  console.log(`Admin microservice running and listening at http://localhost:${port}`)
})

const express = require("express");

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /orders.
const recordRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

// This section will help you get a list of all the orders.
recordRoutes.route("/orders").get(async function (req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection("orders")
    .find({}).limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send("Error fetching orders !");
     } else {
        res.json(result);
      }
    });
});

// This section will help us placing a new order



// This section will help you delete an order
recordRoutes.route("/orders/delete/:id").delete((req, res) => {
  const dbConnect = dbo.getDb();
  const orderQuery = { listing_id: req.body.id };

  dbConnect
    .collection("orders")
    .deleteOne(listingQuery, function (err, _result) {
      if (err) {
        res.status(400).send(`Error deleting order with id ${orderQuery.listing_id}!`);
      } else {
        console.log("1 document deleted");
      }
    });
});

module.exports = recordRoutes;

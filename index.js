const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//MIADLEWERE

app.use(
  cors({
    origin: ["http://localhost:5173", "https://etranslator.netlify.app"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(cors());

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }
  // bearer token
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

//------------------------------------------------------------------
//------------------------------------------------------------------

const port = process.env.PORT || 5000;

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@robiul.13vbdvd.mongodb.net/?retryWrites=true&w=majority`;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@robiul.13vbdvd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});



async function run() {
  try {
    const noticecollection = client
      .db("Canteen-Management")
      .collection("notice");

    ////////////////////////////////////////////////////////////////////////////
    //                       jwt
    ///////////////////////////////////////////////////////////////////////////

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res.send({ token });
    });
    ////////////////////////////////////////////////////////////////////////////
    //                      verifyAdmin
    ////////////////////////////////////////////////////////////////////////////
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersInfocollection.findOne(query);
      if (user?.role !== "admin") {
        return res
          .status(403)
          .send({ error: true, message: "forbidden message" });
      }
      next();
    };

    ////////Notice//////
    app.post("/notice", async (req, res) => {
      const data = req.body;
      const result = await noticecollection.insertOne(data);
      res.send(result);
    });

    app.get("/notice", async (req, res) => {
      const result = await noticecollection.find().toArray();
      res.send(result);
    });

    app.get("/notice/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await noticecollection.findOne(filter);
      res.send(result);
    });

    app.patch("/notice/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const body = req.body;
      const updatedoc = {
        $set: {
          title: body.title,
          description: body.description,
        },
      };
      const result = await noticecollection.updateOne(filter, updatedoc);
      res.send(result);
    });

    app.delete("/notice/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await noticecollection.deleteOne(filter);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello school");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

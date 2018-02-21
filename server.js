const express = require('express');
const helmet = require('helmet');
const cors = require('cors'); // https://www.npmjs.com/package/cors
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Bear = require('./Bears/BearModel');
const server = express();

server.use(helmet()); // https://helmetjs.github.io/
server.use(cors());   // https://medium.com/trisfera/using-cors-in-express-cac7e29b005b
server.use(bodyParser.json());

server.get('/', function(req, res) {
  res.status(200).json({ status: 'API Running' });
});

server.post('/api/bears', (req, res) => {
  const bearInformation = req.body;
  const bear = new Bear(bearInformation); // mongoose document
  const {species, latinName} = req.body;

  if (species && latinName) {
    bear.save() // returns a promise
      .then(savedBear => {
        res.status(201).json(savedBear);
      })
      .catch(err => {
        res.status(500).json({error: 'There was an error while saving the Bear to the Database'})
      });
  } else  {
    res.status(500).json({
      errorMessage: 'Please provide both species and latinName for the Bear.'
    })
  }
});

server.get('/api/bears', (req, res) => {
  Bear.find({}).then(bears => {
    res.status(200).json(bears);
  }).catch(error => {
    res.status(500).json({ error: 'The Information could not be retrieved.'})
  }) 
});

server.get('/api/bears/:id', (req, res) => {
  const id = req.params.id;

  Bear.findById(id).then(bear => {
    if (bear) {
      res.status(200).json(bear);
    } else {
      res.status(404).json({ message: "The Bear with the specified ID does not exist." });
    }
  }).catch(error => {
    res.status(500).json({ error: 'The bear information could not be retrieved.'});
  }) 
});

server.delete('/api/bears/:id', (req, res) => {
  const id = req.params.id;

  Bear.findByIdAndRemove(id)
    .then(bear => {
      if (bear) {
        res.status(200).json(bear);
      } else {
        res.status(404).json({ message: "The Bear with the specified ID does not exist." });
      }
    })
    .catch(err => {
      res.status(500).json({ error: "The Bear could not be removed" });
    })
})


server.put('/api/bears/:id', (req, res) => {
  const id = req.params.id;
  const bearInformation = req.body;
  const {species, latinName} = req.body;

  if (species && latinName) {
    Bear.findByIdAndUpdate(id, bearInformation)
      .then(updatedBear => {
        if (updatedBear) {
          res.status(200).json(updatedBear);
        } else {
          res.status(404).json({ message: "The Bear with the specified ID does not exist." });
        }
      })
      .catch(error => {
        res.status(500).json({ error: "The Bear information could not be modified." });
      })
  } else {
    res.status(500).json({ errorMessage: "Please provide both species and latinName for the Bear."})
  }

})
mongoose.connect('mongodb://localhost/BearKeeper')
  .then(db => {
    console.log(`Succesfully connected to the ${db.connections[0].name} database`)
  })
  .catch(error => {
    console.error('Database Connection Failed')
  })

const port = process.env.PORT || 5005;
server.listen(port, () => {
  console.log(`API running on http://localhost:${port}.`);
});

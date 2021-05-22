import dotenv from "dotenv"
dotenv.config()
import express from "express"
import mongoose from "mongoose"
import _ from "lodash"


const { Schema } = mongoose;

const app = express()
mongoose.connect("mongodb+srv://admin-user:"+ process.env.PASSWORD +"@cluster0.hyqg9.mongodb.net/"+ process.env.DBNAME +"?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});


const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
 console.log("db connected");
});


const itemSchema = new Schema( {
    
        "Number": {
          "type": "Number"
        },
        "Line1": {
          "type": "String"
        },
        "Line2": {
          "type": "String"
        },
        "Translation": {
          "type": "String"
        },
        "mv": {
          "type": "String"
        },
        "sp": {
          "type": "String"
        },
        "mk": {
          "type": "String"
        },
        "explanation": {
          "type": "String"
        },
        "couplet": {
          "type": "String"
        },
        "transliteration1": {
          "type": "String"
        },
        "transliteration2": {
          "type": "String"
        }
      
});

const detailSchema = new Schema({
    "name": {
        "type": "String"
    },
    "translation": {
        "type": "String"
    },
    "transliteration": {
        "type": "String"
    },
    "start": {
        "type": "Number"
    },
    "end": {
        "type": "Number"
    }
});

const Item = mongoose.model("Item", itemSchema);
const Detail = mongoose.model("Detail", detailSchema);

app.get("/", (req, res) => {
  res.send('Hello World! LOL')
})

// app.get("/from/:kuralNeeded", (req, res) => {

// })

app.get("/:kuralNeeded", (req, res) => {

    const kural = req.params.kuralNeeded;
    const kuralNumber = parseInt(kural);
    
    if(kuralNumber) {

        Item.findOne({ Number : kuralNumber } , function(err, item) {
          if(err) {
              console.log(err) ;   
          } else if (!item){
              res.send("No such thirukkural");
          } else {
              res.send(item);
          }
        })
    } else {
        let kuralName =  _.camelCase(kural);
        kuralName = _.startCase(kural);

        if(kuralName == "Random") {
          let kuralId = Math.floor(Math.random() * 1330 + 1);
          res.redirect("/" + kuralId);
        } else {
          Detail.findOne({ transliteration : kuralName } , function(err, detail) {
            if(err) {
                console.log(err) ;   
            } else if (!detail){
                res.send("No such thirukkural topic");
            } else {
                const start = detail.start;
                const end = detail.end;
                const difference = end - start;
                let kuralId = Math.floor(Math.random() * difference + start + 1);
                res.redirect("/" + kuralId);
            }
          })
        }
    }
   
});




app.listen(process.env.PORT || 3000, () => {
  console.log(`App listening at port ${ process.env.PORT || 3000 }`)
})
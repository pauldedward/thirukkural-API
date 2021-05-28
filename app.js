
import dotenv from "dotenv"
dotenv.config()
import express from "express"
import mongoose from "mongoose"
import _ from "lodash"
import cors from "cors"

const { Schema } = mongoose;

const app = express()

app.use( cors({
  origin: "*",
}));

app.use(express.static('public'))

const dbConnect = (async () => {
  try {
    
    await mongoose.connect("mongodb+srv://admin-user:"+ process.env.PASSWORD +"@cluster0.hyqg9.mongodb.net/"+ process.env.DBNAME +"?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=> console.log("db connected"));

    const db = mongoose.connection;

  } catch (err) {
    console.log('error: ' + err)
  }
})();

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

app.get("/", async (req, res) => {
  res.sendFile("index.html")
})

app.get("/select/:kuralNoArray", async (req, res) => {

  let kuralArray = [];
  let arrayOfKuralNo = req.params.kuralNoArray;
  arrayOfKuralNo = arrayOfKuralNo.split(",");
  arrayOfKuralNo = arrayOfKuralNo.map(num => _.toNumber(num));
  arrayOfKuralNo = arrayOfKuralNo.filter(num => (num > 0 && num <= 1330 ));
  arrayOfKuralNo = [...new Set(arrayOfKuralNo)]

  try {
    kuralArray = arrayOfKuralNo.map(async kuralNumber => {
      return await Item.findOne({ Number : kuralNumber }, (err, item) => {
        if(err) {
          console.log(err)
        } else {
          return item;
        }
      })
    });
  
    kuralArray = await Promise.all(kuralArray)
  } catch(err) {
    console.log(err);
  }
 
  
  if(kuralArray[0]) {
    res.send(kuralArray)
  } else {
    res.send("No thirukural found.\nCheck available kural list at https://github.com/tk120404/thirukkural");
  }  

});


app.get("/topic/:kuralNeeded", async (req, res) => {
  
  const topic = req.params.kuralNeeded;
  let topicName =  _.camelCase(topic);
  topicName = _.startCase(topic);
  
  try {
    await Detail.findOne({ transliteration : topicName } , (err, detail) => {
      if(err) {
          console.log(err) ;   
      } else if (!detail){
          res.send("No such thirukkural topic.\nCheck spelling with original DB at https://github.com/tk120404/thirukkural");
      } else {
        const start = detail.start;
        const end = detail.end;
      
        res.redirect("/from/"+ start +"/to/"+ end);
      }
    });
  } catch(err) {
    console.log(err)
  }
 

});

app.get("/from/:from/to/:to", async (req, res) => {
  
    const start = _.toNumber(req.params.from);
    const end = _.toNumber(req.params.to);
    if(start && end)
    {
        if(end - start >= 0) {

          try {
            const kuralArray = await Item.find({ $and : [ {Number : { $gte : start }}, {Number : { $lte : end }} ] } , (err, items) => {
              if(err) {
                console.log(err)
              } else if(!items) {
                console.log("No such thirukkural.\nCheck available kural list at https://github.com/tk120404/thirukkural")
              } else {
                return items
              }
            })

            kuralArray.sort((a, b) => a.Number - b.Number );
            res.send(kuralArray);

          } catch(err) {
            console.log(err);
          }
        } else {
          res.send("Start is larger than End");
        }
        

    } else {
      res.send("Not valid start or end value.");
    }

});

app.get("/:kuralNeeded", async (req, res) => {

    const kural = req.params.kuralNeeded;
    const kuralNumber = parseInt(kural);
    
    if(kuralNumber) {

        try {
          await Item.findOne({ Number : kuralNumber } , (err, item) => {
            if(err) {
                console.log(err) ;   
            } else if (!item){
                res.send("No such thirukkural.\nCheck available kural list at https://github.com/tk120404/thirukkural");
            } else {
                res.send(item);
            }
          })
        } catch(err) {
          console.log(err);
        }
    } else {
        let kuralName =  _.camelCase(kural);
        kuralName = _.startCase(kural);

        if(kuralName == "Random") {
          let kuralId = Math.floor(Math.random() * 1330 + 1);
          res.redirect("/" + kuralId);
        } else {

          try {
            await Detail.findOne({ transliteration : kuralName } , (err, detail) => {
              if(err) {
                  console.log(err) ;   
              } else if (!detail){
                  res.send("No such thirukkural topic.\nCheck spelling with original DB at https://github.com/tk120404/thirukkural");
              } else {
                  const start = detail.start;
                  const end = detail.end;
                  const difference = end - start;
                  let kuralId = Math.floor(Math.random() * difference + start + 1);
                  res.redirect("/" + kuralId);
              }
            })
          } catch(err) {
            console.log(err)
          }
        }
    }
   
});

app.get("*",(req, res) => {
  res.send("No such Route (404).\nRead Documentation at []")
});


app.listen(process.env.PORT || 3000, () => {
  console.log(`App listening at port ${ process.env.PORT || 3000 }`)
})
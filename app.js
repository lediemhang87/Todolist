const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
const date = require(__dirname + "/date.js");

var todolist = [];
var work = [];

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect('mongodb+srv://admin-ashley:behang@cluster0.6ivlj.mongodb.net/todolistDB?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = {name: String};
const listsSchema = {name: String, items: [itemsSchema]};

const Item = mongoose.model ("Item", itemsSchema);
const List = mongoose.model ("List", listsSchema);

const welcome = new Item({name: "Welcome to your to do list"});
const addYourTask = new Item({name: "Click + to add your task"});
const defaultItems = [welcome, addYourTask];

app.get("/",function(req,res){
  res.sendFile('index.html' , { root : __dirname});
})

app.get("/todolist", function(req, res){
  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0)
    {
      Item.insertMany(defaultItems, function(err){})
      res.render("list", {weekDay: "Today", newTask: defaultItems});
    } else {
      res.render("list", {weekDay: "Today", newTask: foundItems});
    }
  })
})

app.post("/todolist", function(req, res){
  const address = req.body.list;

  if (req.body.task !== undefined)
  {
    const itemName = req.body.task;

    const newItem = new Item({
      name: itemName
    })

    if (address === "Today")
    {
      newItem.save();
      res.redirect("/todolist");
    } else {
      List.findOne({name: address}, function(err, foundItems){
        if (!err){
          foundItems.items.push(newItem);
          foundItems.save();
          res.redirect("/" + address);
        }
      })

    }
  }
  else{
    res.redirect("/todolist" );
  }



})

app.post("/delete", function(req, res){
    const listName = req.body.listName;
    const checkedItemId = req.body.checkbox;
    if (listName === "Today")
    {
      Item.findByIdAndRemove(checkedItemId, function(err){
        if (!err)
        {
          console.log("sucessfully delete checked item");
          res.redirect("/todolist");
        }
      })
    } else {
      List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err, results){
          if (!err){
            res.redirect("/" + listName);
          }
      })
    }
})

app.get("/:address", function(req, res){
  const address = req.params.address;
  List.findOne({name: address}, function(err, foundItems){
    if (!err){
      if (!foundItems){
        const newList = new List({
          name: address,
          items: defaultItems
        })
        newList.save()
        res.redirect("/" + address);
      } else {
        res.render("list", {weekDay: address, newTask: foundItems.items});
      }
    }
  })
})

app.post("/:address", function(req, res){
    const address = req.params.address;
    res.redirect("/" + address);
})
app.listen(process.env.PORT || 3000, function(req, res){
  console.log("App is running on port.")
})

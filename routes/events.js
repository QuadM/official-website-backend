module.exports = function(ioInstance){
  const express = require("express");
  const router = express.Router();
  const Joi = require('joi');
  const Event = require("../models/Event");
  const Chat = require("../models/Chat");

  const auth = require("../middleware/auth")
  const admin = require("../middleware/admin")
  const { User, validate } = require('../models/User');

  // Defining a Checking schema for the Event Body
  const minDate = `1-1-${new Date(Date.now()).getFullYear() - 1}`;
  const maxDate = `1-1-${new Date(Date.now()).getFullYear() + 1}`;

  const eventsSchema = Joi.object({
    name: Joi.string()
      .required(),

    startDate: Joi.date()
      .greater(minDate),

    endDate: Joi.date()
      .less(maxDate),

    status: Joi.string()
      .required()
      .valid('Closed', 'Soon', 'Opened'),

    category: Joi.string()
      .required()
      .valid('Session', 'OnDayEvent', 'Marathon', 'Competition'),

    eventDescription: Joi.string()
      .required(),

    eventDetails: Joi.string()
      .required(),

    eventLocation: Joi.string()
      .required(),

    eventImageID: Joi.string()
      .allow("")
  })

  // CRUD Operations routing of event
  router.get("/events", (req, res) => {
    Event.find({}, (err, events) => {
      if (err) {
        console.log(err.message);
        return res.sendStatus(500);
      }
      res.status(200).json(events);
    });
  });

  router.post("/events", /*[auth, admin],*/(req, res) => {
    const result = eventsSchema.validate(req.body)
    if (result.error) {
      console.log(result.error.message);
      return res.sendStatus(400);
    }
    let newEvent = new Event(req.body);
    newEvent.save();
    res.sendStatus(200);
  });

  router.put("/events/:id", [auth, admin], (req, res) => {
    result = eventsSchema.validate(req.body)
    if (result.error) {
      console.log(result.error.message);
      return res.sendStatus(400);
    }

    try {
      Event.findByIdAndUpdate({ _id: req.params.id },
        {
          $set: req.body
        })
        .then((event) => {
          res.send(event);
        });
    } catch (err) {
      console.log(err.message);
      res.sendStatus(500);
    }
  });

  router.delete("/events/:id", [auth, admin], (req, res) => {
    try {
      Event.findByIdAndRemove(req.params.id, (err, event) => {
        if (err) throw err;
        if (event == null)
          return res.sendStatus(404);
        res.sendStatus(200);
      });
    } catch (err) {
      console.log(err.message);
      res.sendStatus(500);
    }
  });

  router.delete("/events", /*[auth, admin],*/(req, res) => {
    try {
      Event.deleteMany({}, (err) => {
        if (err) throw err;
        res.sendStatus(200);
      });
    } catch (err) {
      console.log(err.message);
      res.sendStatus(500);
    }
  });

  // chat get and add by know the event id 
  const chatSchema = Joi.object({
    userId: Joi.required(),
    EventId: Joi.required(),
    message: Joi.string()
      .required(),

  })

  //	Make Connection
  let io = ioInstance();
  const socket = io.connect('http://localhost:4000/chat');  //  TypeError: io.connect is not a function

  //	Listen for message
  socket.on('send', (data) => {
    console.log(`${data.userId} has send: ${data.message}`);
  });

  router.get("/chat/:id", async (req, res) => {
    let event = await Event.findById(req.params.id);
    if(!event)
    {    
      console.log("Not Found");
      return res.sendStatus(404);
    }
    let messages = await Chat.find({EventId : req.params.id}).populate('Event');
    res.json(messages);

  });

  // Change when add auth you get the user id from it 
  router.post("/chat", /*[auth, admin],*/async (req, res) => {
    const result = chatSchema.validate(req.body)
    if (result.error) {
      console.log(result.error.message);
      return res.sendStatus(400);
    }
    let event = await Event.findById(req.body.EventId);
    let user = await User.findById(req.body.userId);
    if(!event || !user)
    {    
      console.log("Not Found");
      return res.sendStatus(404);
    }
    let newChat = new Chat({
        userId : req.body.userId,
        username : user.firstname + " "+  user.lastname, 
        message : req.body.message,
        EventId : event._id
    });

    //	Emit message
    socket.emit('send', {
      message: newChat.message,
      userId: newChat.userId
    });

    newChat.save();
    res.json(newChat);
  });

  return router;
}
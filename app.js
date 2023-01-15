var createError = require('http-errors');
var express = require('express');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var routes = require('./routes');

var mysql = require('mysql');

var app = express();

var mailvalidator = require("email-validator");
var datevalidator = require("moment");

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

conn = require('./model/db')

app.get('/', (req, res) => {
  res.send('hello world')
})

app.get('/user', (req, res) => {
  conn.query(
    "SELECT * FROM user",
    function (err, data, fields) {
      if (err) {
        return next(new AppError(err, 500));
      }
      res.status(200).json(data);
    }
  );
})

function isNotANumber(testnumber) {
  let a = parseInt(testnumber, 10);
  return isNaN(a);
}

const DATEFORMAT = 'YYYY-MM-DD hh:mm:ss';

function validateDate(datestring) {
  return datevalidator(datestring,DATEFORMAT,true).isValid()
}

app.get('/user/:id', (req, res) => {
  console.log('Request Id:', req.params.id);

  if(isNotANumber(req.params.id)) {
      res.status(400).json({"error":"userid " + req.params.id +  " not a number"});
      return;
  }

  conn.query(
    "SELECT * FROM user where id=?",
    [req.params.id],
    function (err, data, fields) {
      if (err) {
        return next(new AppError(err, 500));
      }

      if(data.length == 0) {
        res.status(404).json({"error":"userid " + req.params.id +  " not present"});
      } else {
        //can use the first occurrence given the above validation
        res.status(200).json(data[0]);
      }
    }
  );
})

app.post('/user/', (req, res) => {
  if(!mailvalidator .validate(req.body.mail)) {
    res.status(400).json({"error": req.body.mail + " is not a mail"});
  }

  conn.query(
    "INSERT INTO user(name,mail) values (?,?)",
    [req.body.name, req.body.mail],
    function (err, data, fields) {
      if (err) {
        return next(new AppError(err, 500));
      }

      res.status(200).json(
        req.body
      );
    }
  );
})

app.put('/user/:id', (req, res) => {
  if(isNotANumber(req.params.id)) {
    res.status(400).json({"error":"userid " + req.params.id +  " not a number"});
    return;
  }
  conn.query(
    "UPDATE user SET name=?, mail=? WHERE id=?",
    [req.body.name, req.body.mail, req.params.id],
    function (err, data, fields) {
      if (err) {
        return next(new AppError(err, 500));
      }

      res.status(200).json(
        req.body
      );
    }
  );
})


app.delete('/user/:id', (req, res) => {
  if(isNotANumber(req.params.id)) {
    res.status(400).json({"error":"userid " + req.params.id +  " not a number"});
    return;
  }
  conn.query(
    "delete from user WHERE id=?",
    [req.params.id],
    function (err, data, fields) {
      if (err) {
        return next(new AppError(err, 500));
      }

      if(data.fieldCount == 0) {
        res.status(404).json({"error":"userid " + req.params.id +  " not present"});
      }

      res.status(200).json(
        req.body
      );
    }
  );
})

app.get('/user/:id/appointment', (req, res) => {
  console.log('Request Id:', req.params.id);

  if(isNotANumber(req.params.id)) {
      res.status(400).json({"error":"userid " + req.params.id +  " not a number"});
      return;
  }

  conn.query(
    "SELECT * FROM appointment where user_id=?",
    [req.params.id],
    function (err, data, fields) {
      if (err) {
        return next(new AppError(err, 500));
      }

      // if(data.length == 0) {
      //   res.status(404).json({"error":"userid " + req.params.id +  " not present"});
      // } else {
        //can use the first occurrence given the above validation
        res.status(200).json(data);
      // }
    }
  );
})

app.get('/user/:userid/appointment/:id', (req, res) => {
  console.log('Request Id:', req.params.id);

  if(isNotANumber(req.params.id)) {
      res.status(400).json({"error":"id " + req.params.id +  " not a number"});
      return;
  }

  conn.query(
    "SELECT * FROM appointment where id=?",
    [req.params.id],
    function (err, data, fields) {
      if (err) {
        return next(new AppError(err, 500));
      }

      if(data.length == 0) {
         res.status(404).json({"error":"id " + req.params.id +  " not present"});
      } else {
        //can use the first occurrence given the above validation
        res.status(200).json(data[0]);
      }
    }
  );
})

app.post('/user/:id/appointment', (req, res) => {
  if(isNotANumber(req.params.id)) {
    res.status(400).json({"error":"userid " + req.params.id +  " not a number"});
    return;
  }

  if(req.body.start === undefined ) {
    res.status(400).json({"error":"start is mandatory"});
    return;
  }

  if(req.body.end === undefined ) {
    res.status(400).json({"error":"end is mandatory"});
    return;
  }

  if(req.body.location === undefined ) {
    res.status(400).json({"error":"location is mandatory"});
    return;
  }

  if(! validateDate(req.body.start)) {
    res.status(400).json({"error": req.body.start + " should be format " + DATEFORMAT});
    return;
  }

  if(! validateDate(req.body.end)) {
    res.status(400).json({"error": req.body.end + " should be format " + DATEFORMAT});
    return;
  }

  
  // let start = '2023-01-01 01:00:00';//Date.parse('01 Jan 2023 00:00:00 GMT');
  // let end = '2023-01-01 01:05:00';//Date.parse('01 Jan 2023 10:00:00 GMT');

  conn.query(
    "INSERT INTO appointment(location,start,end,user_id) values (?,?,?,?)",
    [req.body.location, req.body.start, req.body.end, req.params.id],
    function (err, data, fields) {
      if (err) {
        console.log(err);
        return next(new AppError(err, 500));
      }

      res.status(200).json(
        req.body
      );
    }
  );
})

app.put('/user/:userid/appointment/:id', (req, res) => {
  if(isNotANumber(req.params.id)) {
    res.status(400).json({"error":"id " + req.params.id +  " not a number"});
    return;
  }

  if(req.body.start === undefined ) {
    res.status(400).json({"error":"start is mandatory"});
    return;
  }

  if(req.body.end === undefined ) {
    res.status(400).json({"error":"end is mandatory"});
    return;
  }

  if(req.body.location === undefined ) {
    res.status(400).json({"error":"location is mandatory"});
    return;
  }

  if(! validateDate(req.body.start)) {
    res.status(400).json({"error": req.body.start + " should be format " + DATEFORMAT});
    return;
  }

  if(! validateDate(req.body.end)) {
    res.status(400).json({"error": req.body.end + " should be format " + DATEFORMAT});
    return;
  }

  conn.query(
    "update appointment set location=?,start=?,end=? where id=?",
    [req.body.location, req.body.start, req.body.end, req.params.id],
    function (err, data, fields) {
      if (err) {
        console.log(err);
        return next(new AppError(err, 500));
      }

      res.status(200).json(
        req.body
      );
    }
  );
})

app.delete('/user/:userid/appointment/:id', (req, res) => {
  console.log("okokok" + req.params.id);
  if(isNotANumber(req.params.id)) {
    res.status(400).json({"error":"id " + req.params.id +  " not a number"});
    return;
  }
  conn.query(
    "delete from appointment WHERE id=?",
    [req.params.id],
    function (err, data, fields) {
      console.log(err);
      if (err) {
        return next(new AppError(err, 500));
      }

      res.status(200).json(
        req.body
      );
    }
  );
})


module.exports = app;

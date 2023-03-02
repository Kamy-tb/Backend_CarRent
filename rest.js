var express = require("express");
var app = express();
var mysql = require("mysql");
const bodyParser = require('body-parser');
const multer = require('multer')
app.use(express.static('images')) ;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

// Connect to mysql 
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database:'carrent_db',
});
connection.connect();

 // get cars
 app.get('/getcars',function(req,res){   
    var query="select * from voiture"
    connection.query(query,function(error,results){
       if (error) {
           console.log(error)
           res.status(500).json({message:"server error"}) 
       }
    
       res.status(200).json(results)
   })
});

// get details cars
app.get('/getdetailscar/:id',function(req,res){
    var data = null    
    var query="select * from voiture where id=?"
   
    connection.query(query,[req.params.id],function(error,results){
       if (error) {
           console.log(error)
           res.status(500).json({message:"server error"}) 
       }
       if(results.length>0) {
           data = results[0]
       }
       res.status(200).json(data)
   })
   });

// get users
app.get('/getusers',function(req,res){   
    var query="select tel,pwd from user"
    connection.query(query,function(error,results){
       if (error) {
           console.log(error)
           res.status(500).json({message:"server error"}) 
       }
    
       res.status(200).json(results)
   })
   });

 // get reservation
 app.get('/getreservation/:userid',function(req,res){   
    var query="select * from reservation where userid=?"
    connection.query(query,[req.params.userid],function(error,results){
       if (error) {
           console.log(error)
           res.status(500).json({message:"server error"}) 
       }
       res.status(200).json(results)
   })
});

// add reservation
app.post('/addreservation',function(req,res){  
    // si on insere toutes les colonnes on est pas oubliger de specifier 
    var query="INSERT INTO reservation (datedebut , timedebut , voitureid , userid ,pin) values (? ,? , ? ,? ,?)"
    connection.query(query , [req.body.datedebut  , req.body.timedebut  , req.body.voitureid , req.body.userid,req.body.pin ],function(error,results){
       if (error) {
           console.log(error)
           res.status(500).json({message:"server error"}) 
       }
       res.status(200).json("success")
   })
});

 

// add user
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './images/users/')
    },
    filename: function (req, file, cb) {
      cb(null,Date.now()+"-"+file.originalname);
    }
  })
   
app.post("/adduser",multer({storage: storage}).single('image'), function(req, res) { 
    var data = JSON.parse(req.body.user)
	var query="INSERT INTO user(nom,tel,creditcart ,pwd , licencedrive) values (?,?,?,?,?)"
    connection.query(query,[data.nom ,data.tel , data.creditcart ,data.pwd, "users/"+req.file.filename],function(error,results){
       if (error) {
           console.log(error)
           res.status(500).json({message:"server error"}) 
       }
        res.status(200).json("success")
   })  
})

      


 // get user
 app.get('/getuser/:tel/:pwd',function(req,res){
 var data = null    
 var query="select id,nom,tel,birthdate from user where tel=? and pwd=?"
 //var query=`select id,tel from user where tel=${tel} and pwd=${pwd}`

 connection.query(query,[req.params.tel,req.params.pwd],function(error,results){
    if (error) {
        console.log(error)
        res.status(500).json({message:"server error"}) 
    }
    if(results.length>0) {
        data = results[0]
    }
    res.status(200).json(data)
})
});

 

// Modifier mot de passe
app.patch('/modifierpwd',function(req,res){  
    // si on insere toutes les colonnes on est pas oubliger de specifier 
    var query= 'UPDATE user SET pwd = ? WHERE user.id = ? and user.pwd = ?'
    connection.query(query , [req.body.new  , req.body.id ,req.body.old ],function(error,results){
        if (error) {
            console.log(error);
            res.status(500).json(error);
        } else if (results.affectedRows === 0) {
            res.status(200).json('vide');
        } else {
            res.status(200).json('success');
        }
   })
});

// get trajet d'un utilisateur
app.get('/gettrajet/:id',function(req,res){
    var data = null    
    var query="select t.id , r.datedebut , r.timedebut , r.datefin , r.timefin , t.cout , t.id_reservation  from reservation r join trajets t where r.id = t.id_reservation and r.pin IS NOT NULL and userid = ?" 
    connection.query(query,[req.params.id],function(error,results){
       if (error) {
           console.log(error)
           res.status(500).json({message:"server error"}) 
       }
       if(results.length>0) {
           data = results[0]
       }
       res.status(200).json(data)
   })
});

app.get('/getreservations/:id',function(req,res){   
    var data = null
    var query="select r.datedebut,r.timedebut,r.matricule,c.photo,c.modele from reservation r join car c on r.matricule=c.matricule where id=? order by r.idreservation DESC"
    connection.query(query,[req.params.id],function(error,results){
        if (error) {
            console.log(error)
            res.status(500).json({message:"server error"}) 
        }
        if(results.length>0) {
            data = results
        }
        res.status(200).json(data)
    })
   })

var server = app.listen(8082,function(){
    var host = server.address().address
    var port = server.address().port
});

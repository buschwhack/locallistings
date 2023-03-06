const express = require('express');
const path = require('path');
let app = express();
const mysql = require('mysql');

app.set('view engine', 'ejs');

//middleware to process <form> data
app.use(express.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: 'root',
    database: '7062',
    port: '8889',
    multipleStatements: true
});

connection.connect((err)=>{
    if(err) return console.log(err.message);
    console.log("connected to local mysql db");
});



app.get('/',  (req, res) => {

    let read = `SELECT * FROM gig_events INNER JOIN
                gig_performers ON
                gig_events.band_id = gig_performers.id
                ORDER BY performs_on ASC`;

    connection.query(read, (err, gigdata)=>{ 
        if(err) throw err;
        
        //console.table(gigdata);

        console.log(req);

        res.render('listings', {gigdata});
    });

});


app.get('/insertevent', (req, res) => {

    let getbands = `SELECT * FROM gig_performers`;

    connection.query(getbands, (err, bandresults) => { 
        
        if (err) throw err;

       res.render('create_event', {bandresults} );
    });


}); 

app.post('/insertevent', (req, res)=>{ 

    let bandid = req.body.artist_field;
    let venue = req.body.venue_field;
    let event = req.body.details_field;
    let day = req.body.date_field;
    
    let sqlinsert = ` INSERT INTO gig_events 
                    ( band_id, venue, event_details, performs_on) 
                    VALUES ( ?, ?, ?, ? );
                    SELECT * FROM gig_performers WHERE id = ?;
    `;

    connection.query(sqlinsert,[bandid,venue,event,day,bandid] , (err, dataobj)=>{  

        console.log(dataobj[0]);
        
        console.log(dataobj[1]);

        let band = dataobj[1][0].name;

        if (err) throw err;
          res.send(`well done it been added: <p> ${band} -  ${venue} - date ${day}</p>`);

    }); 


});
   



app.listen(process.env.PORT || 3000, ()=>{ 
    console.log("server started on: localhost:3000");
});
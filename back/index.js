const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql');

const database= "agenci13_appsreact"
const user= "agenci13_proyecto2"
const host= "51.161.116.202"
const password= "cu$s0.pr0y3c702.2028"


const db = mysql.createConnection({
    host,
    user,
    password,
    database,
    /*ssl:{
        rejectUnauthorized: false
    }*/
})

var pool  = mysql.createPool({
    connectionLimit : 10,
    host,
    user,
    password,
    database,
    /*ssl:{
        rejectUnauthorized: false
    }*/
  });
  
  

const PORT = process.env.PORT || 3001

app.use(cors());
app.use(express.json())
app.listen(PORT,() =>{
    console.log('listening on 3001')
})

app.get('/',(req,res)=>{
    res.send({status:200});
})

//empresa
app.post('/company',(req,res)=>{
    const company = req.body.company
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    const logo = req.body.logo
    pool.getConnection(function(err, connection) {
        connection.query( `INSERT INTO company (company,username,email,password,logo) VALUES(?,?,?,md5(?),?)`,[company,username,email,password,logo],
        (err, rows)=> {
            if (err) {
                res.send({
                    status: 400,
                    message: err
                })
            }else{
                res.status(201)
                .send({
                    status: 201,
                    message: 'Empresa creada con éxito',
                    data: result
                })
            }
    
          console.log(pool._freeConnections.indexOf(connection)); // -1
    
          connection.release();
    
          console.log(pool._freeConnections.indexOf(connection)); // 0
    
       });
    });
    
    

})

app.get('/company/:id',(req,res)=>{
    const companyId = req.params.id
    db.query(`SELECT  company_id,company,username,email,logo FROM company WHERE company_id=${companyId}`,
    (err, result) => {
        if (result.length >0) {
            res.status(200)
            .send(result[0])
        }else{
            res.status(400).send({
                message: 'No existe la empresa'
            })
        }
    }
    );

})

app.post('/login',(req,res)=>{
    const email = req.body.email
    const password = req.body.password
    db.query(`SELECT company_id,company,username,email,logo FROM company WHERE email=? AND password=md5(?)`,[email,password],
    (err, result) => {
        if (err) {
            res.send({
                status: 500,
                message: err
            })
        }else{
            if (result.length >0) {
                res.status(200)
                .send(result[0])
            }else{
                res.status(401).send({
                    status: 401,
                    message: 'Usuario o contraseña incorrectos'
                })
            }
            
        }
    }
    );

})

//vacantes
app.post('/job',(req,res)=>{
    const title = req.body.title
    const from_date = req.body.from_date
    const until_date = req.body.until_date
    const city = req.body.city
    const job_type = req.body.job_type
    const experience = req.body.experience
    const company_id = req.body.company_id
    db.query(`INSERT INTO job (title,from_date,until_date,city,job_type,experience,company_id) VALUES(?,?,?,?,?,?,?)`,[title,from_date,until_date,city,job_type,experience,company_id],
    (err, result) => {
        if (err) {
            res.status(400).send({
                message: err
            })
        }else{
            res.status(201)
            .send({
                status: 201,
                message: 'Vacante creada con éxito',
                data: result
            })
        }
    }
    );

})

app.get('/job/:id',(req,res)=>{
    const id = req.params.id
    db.query(`SELECT  * FROM job WHERE job_id=${id}`,
    (err, result) => {
        if (result.length >0) {
            res.status(200)
            .send(result[0])
        }else{
            res.status(400).send({
                message: 'No existe la vacante'
            })
        }
    }
    );

})

app.get('/job/all/:company_id/:page/:limit',(req,res)=>{
    const id = req.params.company_id
    const page = req.params.page
    const limit = req.params.limit
    const start = (page - 1) * limit 

    db.query(`SELECT  * FROM job WHERE company_id=${id} order by job_id DESC limit ${start}, ${limit} `,
    (err, result) => {
        if (result.length >0) {
            res.status(200)
            .send(result)
        }else{
            res.status(400).send({
                message: 'No existe datos'
            })
        }
    }
    );

})

app.get('/job/all/:page/:limit',(req,res)=>{
    const page = req.params.page
    const limit = req.params.limit
    const start = (page - 1) * limit 

    db.query(`SELECT  * FROM job order by job_id DESC limit ${start}, ${limit} `,
    (err, result) => {
        if (result.length >0) {
            res.status(200)
            .send(result)
        }else{
            res.status(400).send({
                message: 'No existe datos'
            })
        }
    }
    );

})

app.put('/job/:id',(req,res)=>{
    const id = Number(req.params.id)
    const title = req.body.title
    const from_date = req.body.from_date
    const until_date = req.body.until_date
    const city = req.body.city
    const job_type = req.body.job_type
    const experience = req.body.experience
    const company_id = Number(req.body.company_id)

    switch(id){
        case company_id:
            db.query(`UPDATE job SET title=?,from_date=?,until_date=?,city=?,job_type=?,experience=? where job_id=? and company_id=?`,[title,from_date,until_date,city,job_type,experience,id,company_id],
            (err, result) => {
                if (err) {
                    res.status(400).send({
                        message: err
                    })
                }else{
                    res.status(200)
                    .send({
                        message: 'Vacante actualizada con éxito',
                        data: result
                    })
                }
            }
            );
            break;
        default:
            res.status(401).send({
                message: "Empresa no autorizada"
            })
            break;
    }
    

})
app.delete('/job/:id',(req,res)=>{
    const id = Number(req.params.id)
    const company_id = Number(req.body.company_id)

    switch(id){
        case company_id:
            db.query(`UPDATE job SET deleted=1 where job_id=? and company_id=?`,[id,company_id],
            (err, result) => {
                if (err) {
                    res.status(400).send({
                        message: err
                    })
                }else{
                    res.status(200)
                    .send({
                        message: 'Vacante borrada con éxito',
                        data: result
                    })
                }
            }
            );
            break;
        default:
            res.status(401).send({
                message: "Empresa no autorizada"
            })
            break;
    }
    

    

})

//personas
app.post('/persons',(req,res)=>{
    const dni = req.body.dni
    const name = req.body.name
    const email = req.body.email
    const img = req.body.img
    
    db.query(`INSERT INTO persons (dni,name,email,img) VALUES(?,?,?,?)`,[dni,name,email,img],
    (err, result) => {
        if (err) {
            res.status(400).send({
                message: err
            })
        }else{
            res.status(201)
            .send({
                status: 201,
                message: 'Persona creada con éxito',
                data: result
            })
        }
    }
    );

})

//vacantes
app.post('/apply',(req,res)=>{
    const job_id = req.body.job_id
    const persons_id = req.body.persons_id
    const salary = req.body.salary
    
    db.query(`INSERT INTO job_persons_apply (job_job_id,persons_id,salary) VALUES(?,?,?)`,[job_id,persons_id,salary],
    (err, result) => {
        if (err) {
            res.status(400).send({
                message: err
            })
        }else{
            res.status(201)
            .send({
                status: 201,
                message: 'Postulación registrada con éxito',
                data: result
            })
        }
    }
    );

})

app.put('/apply/:job_id/:person_id',(req,res)=>{
    const job_id = req.params.job_id
    const persons_id = req.params.person_id
    const deleted = req.body.deleted
    const selected = req.body.selected
    
    db.query(`UPDATE job_persons_apply SET deleted=?,selected=? WHERE persons_id=? AND job_job_id=?`,[deleted,selected,persons_id,job_id],
    (err, result) => {
        if (err) {
            res.status(400).send({
                message: err
            })
        }else{
            res.status(201)
            .send({
                status: 201,
                message: 'Postulación actualizada con éxito',
                data: result
            })
        }
    }
    );

})
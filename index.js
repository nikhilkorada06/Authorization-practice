const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
// const bodyParser = require('body-parser');

const app = express();

app.use(cors({origin : '*'}))  //allows requests from any domain...
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const JWT_Secret_Token = 'secretkey';

const portalUsers = {
    "Nikhil" : {
        ID : 1, 
        name : 'Nikhil', 
        role : 'Student', 
        password : '123'
    },
    "Kishore" : {
        ID : 2,
        name : 'Kishore', 
        role: 'Faculty', 
        password: '12345'
    }
}

const authenticateFaculty = (req, res, next) => {
    const brearerToken = req.headers.authorization;
    console.log('Brearer Token from Client : ', brearerToken);
    if(!brearerToken || !brearerToken.startsWith('Bearer ')) {
        res.status(401).send('Bearer Token Missing...');
    } 
    const token = brearerToken.split('Bearer ')[1]
    console.log('Token ::: ', token);
    // const payloadInToken = token.split('.')[1];
    const decodedVersion = jwt.verify(token, JWT_Secret_Token);
    console.log('Decoded Version ::: ', decodedVersion);
    if(decodedVersion.user_role !== 'Faculty'){
        res.status(401).send('Sorry..., You are not Authorized to see the Data !!!');
    } else {
        next();
    }
}

app.post('/login', (req, res) => {
    const {username, password} =  req.body;
    let user = portalUsers[username];
    console.log("User : ", user);
    if(user.password == password) {
        const userPayload = {
            user_ID : user.ID, 
            user_role : user.role,
        }
        const token = jwt.sign(userPayload, JWT_Secret_Token, {expiresIn: '1h'});
        res.status(200).send({
            message : "LOGIN SUCCESSFULL !!!",
            token      //token : token
        });
    } else {
        res.status(401).send("LOGIN FAILED !!!")
    }
    res.send(req.body);
})



app.get('/', (req, res) => {
    console.log('New Request to the default route');
    res.send('Hii This is the default route');
})

app.get('/anyone-can-access', (req, res) => {
    res.send('Welcome!!!, anyone can access this Route...')
});

app.get('/students-attendence', authenticateFaculty, (req, res) => {
    const students = {
        'Nikhil' : '90%',
        'Akhil' : '85%',
        'Rahul' : '48%'
    }
    res.status(200).send({
        data: students, 
        message: 'Only Faculty Can Access This Data...'
    })
})

app.listen(3000, ()=> {
    console.log('Server started running on port 3000');
})
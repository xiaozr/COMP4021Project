
// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

function initUserManager(app,fs,bcrypt,onlineUsers){

    // Handle the /register endpoint
    app.post("/register", (req, res) => {
        // Get the JSON data from the body
        const { username, avatar, name, password } = req.body;
        
        // Reading the users.json file
        const users = JSON.parse(fs.readFileSync("data/users.json")); // users = JS object

        // Checking for the user data correctness
        if(username==""||avatar==""||name==""||password=="")
            return res.json({ status: "error", error: "Username, avatar, name and password should not be empty" });
        if(!containWordCharsOnly(username))
            return res.json({ status: "error", error: "Username contains only underscores, letters or numbers" });
        if(users[username])
            return res.json({ status: "error", error: "User already exists" });
        
        // Adding the new user account
        const hash = bcrypt.hashSync(password,10);
        users[username] = {avatar,name,hash}; // Update json "database"
        
        // Saving the users.json file
        fs.writeFileSync("data/users.json",JSON.stringify(users,null,"  "));

        // Sending a success response to the browser
        return res.json({ status:"success"});

    });

    app.get("/validate", (req, res) => {

        // Getting req.session.user
        let user = req.session.user;
    
        // Sending a success response with the user account
        if (user){
            return res.json({status:"success",user:user});
        }
            
        return res.json({status:"error",error:"No user has signed in the current session"});
     
    });

    // Handle the /signin endpoint
    app.post("/signin", (req, res) => {
    // Get the JSON data from the body
        const { username, password } = req.body;

        // Reading the users.json file
        const users = JSON.parse(fs.readFileSync("data/users.json"));
        //console.log(users[username]);

        // Checking for username/password
        if(!(username in users))
            return res.json({ status: "error", error: "User does not exists." });
        if(!bcrypt.compareSync(password,users[username].hash))
            return res.json({ status: "error", error: "Wrong password." });

        //Check multiple Sign-ins
        if(username in onlineUsers)
            return res.json({ status: "error", error: "User signed in on other browser." });

        // Sending a success response with the user account
        let avatar = users[username].avatar;
        let name = users[username].name;
        let userJS = {
            username,
            avatar,
            name
        };
        // Maintain Sign-in session
        req.session.user = userJS;

        return res.json({ status: "success", user: userJS });
    
    });

}

module.exports = {initUserManager}
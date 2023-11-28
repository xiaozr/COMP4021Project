
const Authentication = (function() {
    // This stores the current signed-in user
    let user = null;

    // This function gets the signed-in user
    const getUser = function() {
        return user;
    }

    // This function sends a sign-in request to the server
    // * `username`  - The username for the sign-in
    // * `password`  - The password of the user
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const signin = function(username, password, onSuccess, onError) {

          // A. Preparing the user data
        // B. Sending the AJAX request to the server
        fetch("/signin", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({username, password}) // Convert to JSON string and send to server
            
        })
        .then((res) => res.json() )
        .then((json)=> {
            if(json.status=="success"){
                console.log("Login Success")
                user = json.user;
                onSuccess("Welcome back!")
            }   
            else if (onError) onError(json.error);
        })
        .catch((err) => {
            console.log("Error!");
        });
        // F. Processing any error returned by the server

        // H. Handling the success response from the server

        // Delete when appropriate
        //if (onError) onError("This function is not yet implemented.");
    };

    // This function sends a validate request to the server
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const validate = function(onSuccess, onError) {

        
        // A. Sending the AJAX request to the server
        fetch("/validate")
        .then((res)=>res.json())
        // C. Processing any error returned by the server
        .then((json)=>{
            if(json.status=="success")
            {
                console.log("Validation success");
                user = json.user;
                onSuccess(user);
            }    
            else if(json.status=="error")
                onError(json.error);
        })
        // E. Handling the success response from the server
        .catch((error) => {
            console.log("Error!");
        });

        // Delete when appropriate
        //if (onError) onError("This function is not yet implemented.");
    };

    // This function sends a sign-out request to the server
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const signout = function(onSuccess, onError) {

        fetch("/signout")
        .then((res)=>res.json())
        .then((json)=>{
            if(json.status=="success")
            {
                user = null;
                window.location.href = "/";
            }    
        })
        // Delete when appropriate
        //if (onError) onError("This function is not yet implemented.");
    };

    return { getUser, signin, validate, signout };
})();

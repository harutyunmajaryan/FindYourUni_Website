document.addEventListener("DOMContentLoaded", function() {

    const form = document.getElementById("register_form")

    form.addEventListener("submit", async function(event) {
        event.preventDefault()	

	let email = document.getElementById("email").value
	let password = document.getElementById("password").value

        let emailError = document.getElementById("email_error")
        let passwordError = document.getElementById("password_error")

        emailError.textContent = ""
        passwordError.textContent = ""

	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

	if(!emailPattern.test(email)){
            emailError.textContent = "Please enter a valid email address"
            return
	}

        if (password.length < 12){
            passwordError.textContent = "Password must be at least 12 characters"
            return
	}
 
	const capitals = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

	let hasCapital = false
	for (let char of password) {
    	    if (capitals.includes(char)) {
	        hasCapital = true
		break
            }
	}

	if (!hasCapital) {
            passwordError.textContent = "Password must contain at least one capital letter"
            return
	}

        try {

            const response = await fetch("/register", {
	        method: "POST",
	        headers: {
	            "Content-Type": "application/json"
	        },
	        body: JSON.stringify({
	            email: email,
		    password: password
	        })
	    })

	    const result = await response.json()

            if (response.ok && result.status === "success") {
		window.location.href = "login.html"
	    } else {
                passwordError.textContent = result.message || "Registration failed."
	    }
	
	} catch(error) {
	    passwordError.textContent = "Something went wrong. Please try again."
	}

    })

})


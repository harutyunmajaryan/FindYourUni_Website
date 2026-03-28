document.addEventListener("DOMContentLoaded", function() {

    const form = document.getElementById("login_form")

    form.addEventListener("submit", async function(event) {
        event.preventDefault()	

	let email = document.getElementById("email").value
	let password = document.getElementById("password").value

        let emailError = document.getElementById("email_error")
        let passwordError = document.getElementById("password_error")

        emailError.textContent = ""
        passwordError.textContent = ""

	if (!email) {
	    emailError.textContent = "Please enter your email"
	}

	if (!password) {
	    passwordError.textContent = "Please enter your password"
	}

	if (!email || !password) {
	    return
	}

        try {

            const response = await fetch("/login", {
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
		window.location.href = "Index.html"
	    } else {
                passwordError.textContent = "Incorrect email or password"
	    }
	
	} catch(error) {
            passwordError.textContent = "Login failed. Please try again."
	}

    })

})


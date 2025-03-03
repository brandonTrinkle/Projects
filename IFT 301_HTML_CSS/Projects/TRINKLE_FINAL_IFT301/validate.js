document.addEventListener('DOMContentLoaded', function() {
    const form = document.forms['quoteForm'];

    if (!form) {
        console.error("Form not found!");
        return;
    }

    form.addEventListener('submit', function(event) {
        console.log("Submit event triggered!");
        if (!validateForm()) {
            console.log("Validation failed, preventing default!");
            event.preventDefault(); // Prevent form submission
            event.stopPropagation(); // Stop further event propagation
            return false; // Explicitly return false
        } else {
            console.log("Validation passed, allowing submission.");
        }
    });
});

function validateForm() {
    let isValid = true;
    let name = document.forms["quoteForm"]["name"].value;
    let phone = document.forms["quoteForm"]["phone"].value;
    let email = document.forms["quoteForm"]["email"].value;
    let description = document.forms["quoteForm"]["description"].value;

    // Clear previous errors
    document.getElementById("name-error").textContent = '';
    document.getElementById("phone-error").textContent = '';
    document.getElementById("email-error").textContent = '';
    document.getElementById("description-error").textContent = '';

    if (!/^\w+\s+\w+$/.test(name)) {
        document.getElementById("name-error").textContent = "Name must contain at least two words.";
        isValid = false;
    }

    if (!/^\d{3}-\d{3}-\d{4}$/.test(phone)) {
        document.getElementById("phone-error").textContent = "Phone number must be in the format XXX-XXX-XXXX.";
        isValid = false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        document.getElementById("email-error").textContent = "Email must be a valid email address.";
        isValid = false;
    }

    if (description.length < 25) {
        document.getElementById("description-error").textContent = "Description must contain at least 25 characters.";
        isValid = false;
    }

    return isValid;
}

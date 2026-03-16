const form = document.getElementById("registerForm");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        alert("Signup Error: " + error.message);
        return;
    }

    const user = data.user;

    if (user) {
        const { error: insertError } = await supabaseClient
            .from("users")
            .insert([
                {
                    id: user.id,
                    name: name,
                    email: email
                }
            ]);

        if (insertError) {
            alert("Table Insert Error: " + insertError.message);
            return;
        }
    }

    alert("Registration successful! Please check your email and verify your account before login.");
    window.location.href = "index.html";
});
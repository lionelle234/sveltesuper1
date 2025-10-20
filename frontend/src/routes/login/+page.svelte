<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let username = "";
  let password = "";
  let error = "";

  // ✅ Redirect if user is already logged in
  onMount(() => {
    const token = localStorage.getItem("token");
    if (token) {
      goto("/"); // default page
    }
  });

  async function login(e) {
    e.preventDefault();
    error = "";

    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Save token & role in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        // ✅ Redirect to default page
        goto("/profile");
      } else {
        error = data.error || "Login failed.";
      }
    } catch (err) {
      console.error("Login error:", err);
      error = "Network or server error.";
    }
  }

    function goToPage() {
    goto("/");  
  }
</script>

<h1>Login</h1>

<form on:submit={login}>
  <input
    placeholder="Username"
    bind:value={username}
    required
  />
  <input
    type="password"
    placeholder="Password"
    bind:value={password}
    required
  />
  <button type="submit">Login</button>
</form>

{#if error}
  <p style="color:red">{error}</p>
{/if}

<p>
  Sem conta? <a href="/signup">Sign up</a>
</p>

<button on:click={goToPage}>Pagina Principal</button> 

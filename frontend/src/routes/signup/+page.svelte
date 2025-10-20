<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let username = "";
  let password = "";
  let error = "";
  let success = "";

  // ✅ Redirect if already logged in
  onMount(() => {
    const token = localStorage.getItem("token");
    if (token) {
      goto("/"); // default page
    }
  });

  async function signup(e) {
    e.preventDefault();
    error = "";
    success = "";

    const res = await fetch("http://localhost:3000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      success = data.message;
      setTimeout(() => goto("/login"), 1000);
    } else {
      error = data.error;
    }
  }
</script>

<h1>Sign Up</h1>
<form on:submit={signup}>
  <input placeholder="Username" bind:value={username} required />
  <input type="password" placeholder="Password" bind:value={password} required />
  <button type="submit">Sign Up</button>
</form>

{#if error}<p style="color:red">{error}</p>{/if}
{#if success}<p style="color:green">{success}</p>{/if}

<p>
  Ja tem uma conta? <a href="/login">Login</a>
</p>

<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let user = null;
  let message = "Loading...";

  onMount(async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem('role') || "guest";

    if (!token || role !== 'adm') {
      goto("/");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok) {
        user = data.user;
        message = `Ola, ${user.username}!`;
      } else {
        message = data.error || "Failed to fetch profile.";
        if (res.status === 401) {
          localStorage.removeItem("token");
          goto("/login");
        }
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      message = "Network or server error while fetching profile.";
    }
  });

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    goto("/");
  }

  function goToAdm() {
    goto("/adm");  
  }
</script>

<h1>Perfil</h1>
<p>{message}</p>

{#if user}
  <p>Seu ID: {user.id}</p>
  <p>Usuario: {user.username}</p>
  
<button on:click={logout}>Logout</button>

<button on:click={goToAdm}>Ir para Painel</button> 
{/if}

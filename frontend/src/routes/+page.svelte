<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  let services = [];
  let serviceTypes = [];
  let query = "";
  let selectedType = "";
  let error = "";
  let selectedService = null;
  let selectedVariation = "";
  let selectedDateTime = "";
  let token;
  let role;
  let isLoggedIn = false;

  // Load all service types
  async function loadServiceTypes() {
    try {
      const res = await fetch("http://localhost:3000/api/service-types");
      if (!res.ok) throw new Error("Failed to load service types");
      serviceTypes = await res.json();
    } catch (err) {
      console.error("Error loading service types:", err);
      error = "Could not load service types.";
    }
  }

  // Search services
  async function searchServices() {
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (selectedType) params.append("type", selectedType);

      const res = await fetch(`/api/services/search?${params}`);
      if (!res.ok) throw new Error("Failed to load services");
      services = await res.json();

      // Fetch variations and available dates
      for (let s of services) {
        const [varRes, dateRes] = await Promise.all([
          fetch(`/api/services/${s.id}/variations`),
          fetch(`/api/services/${s.id}/available-dates`),
        ]);

        s.variations = varRes.ok ? await varRes.json() : [];
        s.availableDates = dateRes.ok ? await dateRes.json() : [];
      }
    } catch (err) {
      console.error("Error loading services:", err);
      error = "Could not load services.";
    }
  }

  function goToLoginAdm() {
    goto("/login");
  }

  function goToLoginClient() {
    goto("/login-client");
  }
  // Open modal
  function openModal(service) {
    console.log(role);
    if (!token || role !== "client") {
    alert("You voce deve estar cadastrado como cliente para contratar um servico.");
    return;
  }
    selectedService = service;
    selectedVariation = "";
    selectedDateTime = "";
  }

  // Close modal
  function closeModal() {
    selectedService = null;
  }
  
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    location.reload();
    
  }

  // Contract service
 async function contractService() {
  if (!selectedVariation || !selectedDateTime) {
    alert("Please select both a variation and a date/time option.");
    return;
  }

  try {
    token = localStorage.getItem("token");

    const res = await fetch(`/api/contracts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        service_id: selectedService.id,
        variation: selectedVariation,
        datetime: selectedDateTime,
      }),
    });

    // Safely parse JSON or fallback to empty
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(data.error || "Failed to contract service");
    }

    alert("Service contracted successfully!");
    closeModal();
  } catch (err) {
    console.error("Contract error:", err);
    alert(err.message || "Could not contract service.");
  }
}




function formatDateTime(dateVal, timeVal) {
  if (!dateVal || !timeVal) return "Inválido";

  try {
    let dateStr = String(dateVal).split("T")[0];
    let timeStr = String(timeVal).split(".")[0];

    const [year, month, day] = dateStr.split("-").map(Number);
    const [hour, minute] = timeStr.split(":").map(Number);

    if (!year || !month || !day || isNaN(hour) || isNaN(minute))
      return "Inválido";

    const parsed = new Date(year, month - 1, day, hour, minute);

    const formattedDate = parsed.toLocaleDateString("pt-BR", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime = parsed.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${formattedDate} às ${formattedTime}`;
  } catch (err) {
    console.error("Erro ao formatar data:", err, dateVal, timeVal);
    return `${dateVal} ${timeVal}`;
  }
}


function toISO(dateVal, timeVal) {
  if (!dateVal || !timeVal) return "";
  const dateStr = String(dateVal).split("T")[0];
  const timeStr = String(timeVal).split(".")[0].slice(0, 5);
  return `${dateStr}T${timeStr}`;
}



  onMount(async () => {

    token = localStorage.getItem("token");
    role = localStorage.getItem("role") || "guest";

    isLoggedIn = !!token;

    await loadServiceTypes();
    await searchServices();
  });
</script>

<div class="max-w-7xl mx-auto p-6 space-y-8">

  <header class="text-center space-y-2">
    <h1 class="text-3xl font-bold tracking-tight text-gray-900">Encontrar Servicos</h1>
    <p class="text-gray-500 text-sm">Procurar por nome ou descricao</p>
  </header>

  {#if error}
    <p class="text-red-500 text-center font-medium">{error}</p>
  {/if}
    {#if !isLoggedIn}
  <div
    class="absolute top-4 right-6 flex gap-3"
    style="position: absolute; top: 1rem; right: 1.5rem;"
  >
    <button
      on:click={goToLoginClient}
      class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition"
    >
      Login como Cliente
    </button>
    <button
      on:click={goToLoginAdm}
      class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium transition"
    >
      Login como Adm
    </button>
  </div>
{/if}
  <!-- Filter Section -->
  <section class="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm p-4 flex flex-wrap justify-center gap-3 sticky top-0 z-10">
    <input
      type="text"
      placeholder="Procurar por nome ou descricao..."
      bind:value={query}
      on:input={searchServices}
      class="border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg px-3 py-2 w-64 text-sm transition"
    />
    <select
      bind:value={selectedType}
      on:change={searchServices}
      class="border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg px-3 py-2 w-48 text-sm bg-white transition"
    >
      <option value="">Todos os tipos</option>
      {#each serviceTypes as type}
        <option value={type.type}>{type.type}</option>
      {/each}
    </select>

    {#if isLoggedIn}
    <button on:click={logout}>Logout</button>
    {/if}
  </section>

  <!-- Services Grid -->
  <section class="mt-4">
    {#if services.length > 0}
      <div
        class="grid justify-center gap-x-2 gap-y-5"
        style="grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); max-width: 900px; margin: 0 auto;"
      >
        {#each services as s}
          <div
            class="flex flex-col items-center text-center bg-white rounded-lg shadow-sm hover:shadow-md transition duration-200 p-1 cursor-pointer"
            on:click={() => openModal(s)}
          >
            <div class="relative w-full aspect-square max-w-[120px] rounded-md overflow-hidden">
              {#if s.picture}
                <img
                  src={s.picture}
                  alt={s.name}
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              {:else}
                <div class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                  No image
                </div>
              {/if}
            </div>

            <div class="mt-2 space-y-0.5 max-w-[100px] leading-tight">
              <h3 class="font-medium text-sm text-gray-800 truncate">{s.name}</h3>
              <p class="text-[11px] text-gray-500 line-clamp-2">{s.description}</p>
              <span class="inline-block text-[10px] bg-indigo-100 text-indigo-700 px-1 py-[1px] rounded-full">{s.type_service}</span>
            </div>
          </div>
        {/each}
      </div>
    {:else if !error}
      <p class="text-center text-gray-500 mt-8">No services found.</p>
    {/if}
  </section>
</div>

<!-- Modal -->
{#if selectedService}
  <!-- Overlay -->
  <div
    style="
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    "
  >
    <!-- Modal -->
    <div
      style="
        background: black;
        color: white;
        border: 2px solid #444;
        border-radius: 1rem;
        padding: 1.5rem;
        width: 90%;
        max-width: 400px;
        text-align: center;
      "
    >
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">
        {selectedService.name}
      </h2>
      <p style="font-size: 0.875rem; margin-bottom: 1rem;">{selectedService.description}</p>

      <!-- Variation Select -->
      <div style="text-align: left; margin-bottom: 0.75rem;">
        <h3 style="font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Selecione uma variacao:</h3>
        <select bind:value={selectedVariation} style="width: 100%; padding: 0.5rem; background: #111; color: white; border: 1px solid #555; border-radius: 0.375rem;">
          <option value="">-- Escolher variacao --</option>
          {#each selectedService.variations as v}
            <option value={v.description}>{v.description}</option>
          {/each}
        </select>
      </div>

<!-- Date & Time Select -->
<div style="text-align: left; margin-bottom: 1rem;">
  <h3 style="font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Selecione uma data e hora:</h3>
  <select
    bind:value={selectedDateTime}
    style="width: 100%; padding: 0.5rem; background: #111; color: white; border: 1px solid #555; border-radius: 0.375rem;"
  >
    <option value="">-- Escolher data/hora --</option>
    {#each selectedService.availableDates as d}
      <option value={toISO(d.date, d.time)}>
        {formatDateTime(d.date, d.time)}
      </option>
    {/each}
  </select>
</div>



      <!-- Buttons -->
      <div style="display: flex; justify-content: space-between; margin-top: 1rem;">
        <button on:click={closeModal} style="background: #333; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem;">
          Cancelar
        </button>
        <button on:click={contractService} style="background: #4f46e5; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem;">
          Contratar
        </button>
      </div>
    </div>
  </div>
{/if}

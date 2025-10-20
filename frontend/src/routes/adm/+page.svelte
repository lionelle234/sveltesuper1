<script>
  import { onMount, onDestroy } from "svelte";
  import { goto } from "$app/navigation";

  let serviceTypes = [];
  let userServices = [];
  let contracts = [];
  let selectedType = "";
  let name = "";
  let description = "";
  let pictureFile = null;
  let message = "";

  let variations = [""]; 
  let availability = [{ date: "", start: "" }];

  let token = null;
  let role;
  let notifications = [];
  let ws;

  onMount(async () => {
    token = localStorage.getItem("token");
    role = localStorage.getItem("role") || "guest";

    if (!token || role !== "adm") {
      goto("/");
      return;
    }

    // --- WebSocket connection ---
    ws = new WebSocket(`ws://localhost:3000?token=${token}`);
    ws.onopen = () => console.log("Conectado ao WebSocket de notificações");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        notifications = [{
          message: `O serviço "${data.serviceName}" foi contratado pelo cliente ${data.clientName}`
        }];
        loadContracts(); // Atualiza contratos em tempo real
      } catch (err) {
        console.error("Mensagem WebSocket inválida:", err);
      }
    };
    ws.onerror = (err) => console.error("Erro no WebSocket:", err);

    await fetchServiceTypes();
    await loadUserServices();
    await loadContracts();
  });

  onDestroy(() => {
    if (ws) ws.close();
  });

  async function fetchServiceTypes() {
    try {
      const res = await fetch("http://localhost:3000/api/service-types");
      serviceTypes = await res.json();
    } catch (err) {
      console.error("Erro ao buscar tipos de serviço:", err);
    }
  }

  async function loadUserServices() {
    try {
      const res = await fetch("http://localhost:3000/api/user-services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return console.error("Erro ao buscar serviços do usuário", await res.text());
      userServices = await res.json();
    } catch (err) {
      console.error("Erro ao buscar serviços do usuário:", err);
    }
  }

  async function loadContracts() {
    try {
      const res = await fetch("http://localhost:3000/api/contracts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return console.error("Erro ao buscar contratos", await res.text());
      contracts = await res.json();
    } catch (err) {
      console.error("Erro ao buscar contratos:", err);
    }
  }

  function handleFileChange(e) {
    pictureFile = e.target.files[0];
  }

  function addVariation() { variations = [...variations, ""]; }
  function removeVariation(i) { if (variations.length > 1) variations = variations.filter((_, idx) => idx !== i); }

  function addAvailability() { availability = [...availability, { date: "", start: "" }]; }
  function removeAvailability(i) { if (availability.length > 1) availability = availability.filter((_, idx) => idx !== i); }

  async function createService(e) {
    e.preventDefault();
    if (!selectedType || !name || !variations.some(v=>v.trim()!=="") || availability.some(a=>!a.date || !a.start)) {
      message = "Todos os campos (tipo, nome, variações, disponibilidade) são obrigatórios.";
      return;
    }
    const formData = new FormData();
    formData.append("typeId", selectedType);
    formData.append("name", name);
    formData.append("description", description);
    if (pictureFile) formData.append("picture", pictureFile);
    formData.append("variations", JSON.stringify(variations.filter(v => v.trim() !== "")));
    formData.append("availability", JSON.stringify(availability));

    try {
      const res = await fetch("http://localhost:3000/api/user-services", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) message = data.error || "Erro ao criar serviço";
      else {
        message = "✅ Serviço criado com sucesso!";
        name = description = selectedType = "";
        pictureFile = null;
        variations = [""]; availability = [{ date: "", start: "" }];
        await loadUserServices();
      }
    } catch (err) {
      console.error("Erro ao criar serviço:", err);
      message = "Erro de rede";
    }
  }

  function goToProfile() { goto("/profile"); }

  async function deleteService(id) {
    if (!confirm("Tem certeza que deseja deletar este serviço?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Falha ao deletar serviço");
      userServices = userServices.filter(s => s.id !== id);
      await loadContracts(); // Atualiza contratos
    } catch (err) {
      console.error("Erro ao deletar serviço:", err);
      alert("Falha ao deletar serviço");
    }
  }

  async function cancelContract(id) {
    if (!confirm("Tem certeza que deseja cancelar este contrato?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/contracts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Falha ao cancelar contrato");
      contracts = contracts.filter(c => c.contract_id !== id);
    } catch (err) {
      console.error("Erro ao cancelar contrato:", err);
      alert("Falha ao cancelar contrato");
    }
  }
</script>

<div class="p-6 max-w-5xl mx-auto space-y-8">
  <!-- Notifications -->
  <div class="mb-6 p-4 border rounded bg-gray-50">
    <h2 class="font-semibold text-lg mb-2">Notificações</h2>
    {#if notifications.length === 0}
      <p class="text-gray-500 text-sm">Nenhuma notificação ainda.</p>
    {:else}
      {#each notifications as n}
        <p class="text-sm text-gray-700">{n.message}</p>
      {/each}
    {/if}
  </div>

  <header class="flex items-center justify-between">
    <h1 class="text-3xl font-bold text-gray-800">Painel do Administrador</h1>
    <button on:click={goToProfile} class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition">
      Ir para Perfil
    </button>
  </header>

  <!-- Create Service Form -->
  <section class="bg-white rounded-xl shadow p-6 space-y-6 border border-gray-100 max-w-2xl mx-auto">
    <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 text-center">Criar Novo Serviço</h2>
    <form on:submit|preventDefault={createService} class="space-y-4">
      <div class="mx-auto max-w-xs">
        <label class="block text-sm font-medium mb-1 text-gray-700">Tipo de Serviço</label>
        <select bind:value={selectedType} class="border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 w-auto" required>
          <option value="">-- Selecione o tipo --</option>
          {#each serviceTypes as type}
            <option value={type.id}>{type.type}</option>
          {/each}
        </select>
      </div>
      <div class="mx-auto max-w-xs">
        <label class="block text-sm font-medium mb-1 text-gray-700">Nome do Serviço</label>
        <input type="text" bind:value={name} class="border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 w-auto" required />
      </div>
      <div class="mx-auto max-w-md">
        <label class="block text-sm font-medium mb-1 text-gray-700">Descrição</label>
        <textarea bind:value={description} rows="3" class="border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 w-auto"></textarea>
      </div>
      <div class="mx-auto max-w-xs">
        <label class="block text-sm font-medium mb-1 text-gray-700">Imagem</label>
        <input type="file" accept="image/*" on:change={handleFileChange} class="block text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
      </div>

      <!-- Variations -->
      <div class="mx-auto space-y-2">
        <label class="block text-sm font-medium mb-1 text-gray-700">Variações</label>
        {#each variations as v, i}
          <div class="flex gap-2 items-center">
            <input type="text" bind:value={variations[i]} class="border-gray-300 rounded-md p-2 w-auto focus:ring-2 focus:ring-blue-500" placeholder="ex: R$20, 2 vezes por semana" required />
            <button type="button" class="bg-red-500 text-white px-2 py-1 rounded" on:click={() => removeVariation(i)}>✕</button>
          </div>
        {/each}
        <button type="button" class="bg-green-500 text-white px-3 py-1 rounded mt-1" on:click={addVariation}>+ Adicionar Variação</button>
      </div>

      <!-- Availability -->
      <div class="mx-auto space-y-2">
        <label class="block text-sm font-medium mb-1 text-gray-700">Disponibilidade</label>
        {#each availability as a, i}
          <div class="flex gap-2 items-center">
            <input type="date" bind:value={availability[i].date} class="border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" required />
            <input type="time" bind:value={availability[i].start} class="border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" required />
            <button type="button" class="bg-red-500 text-white px-2 py-1 rounded" on:click={() => removeAvailability(i)}>✕</button>
          </div>
        {/each}
        <button type="button" class="bg-green-500 text-white px-3 py-1 rounded mt-1" on:click={addAvailability}>+ Adicionar Data/Horário</button>
      </div>

      <div class="flex justify-center">
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Criar Serviço</button>
      </div>
    </form>
    {#if message}
      <p class="text-sm mt-2 text-blue-600 font-medium text-center">{message}</p>
    {/if}
  </section>

  <!-- User Services -->
  <section class="mt-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Seus Serviços</h2>
    {#if userServices.length === 0}
      <p class="text-gray-500 italic">Você ainda não criou nenhum serviço.</p>
    {:else}
      <div class="grid justify-center gap-x-2 gap-y-5" style="grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); max-width: 900px; margin: 0 auto;">
        {#each userServices as svc}
          <div class="flex flex-col items-center text-center bg-white rounded-lg shadow-sm hover:shadow-md transition duration-200 p-1">
            <div class="relative w-full aspect-square max-w-[120px] rounded-md overflow-hidden">
              {#if svc.picture}
                <img src={svc.picture} alt={svc.name} class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              {:else}
                <div class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">Sem imagem</div>
              {/if}
            </div>
            <div class="mt-1 space-y-0.5 max-w-[120px] leading-tight text-xs">
              <p><span class="font-medium">Nome:</span> {svc.name}</p>
              <p><span class="font-medium">Descrição:</span> {svc.description}</p>
              <p><span class="font-medium">Tipo:</span> {svc.type}</p>
            </div>
            <button on:click={() => deleteService(svc.id)} class="mt-1 bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded text-xs transition">
              Deletar
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Contracts Section -->
  <section class="mt-8">
    <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Contratos</h2>
    {#if contracts.length === 0}
      <p class="text-gray-500 italic">Nenhum contrato ainda.</p>
    {:else}
      <div class="space-y-2 max-w-2xl mx-auto">
        {#each contracts as c}
          <div class="flex justify-between items-start bg-white border rounded p-3">
            <div class="text-sm text-gray-800 space-y-1">
              <p><span class="font-medium">Serviço:</span> {c.service_name}</p>
              <p><span class="font-medium">Cliente:</span> {c.client_name}</p>
              <p><span class="font-medium">Variação:</span> {c.variation}</p>
              <p><span class="font-medium">Data:</span> {new Date(c.datetime).toLocaleString()}</p>
            </div>
            <button on:click={() => cancelContract(c.contract_id)} class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs">
              Cancelar
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>

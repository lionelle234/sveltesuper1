import { x as ensure_array_like } from "../../../chunks/index2.js";
import { a as ssr_context } from "../../../chunks/context.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import { a as attr } from "../../../chunks/attributes.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { e as escape_html } from "../../../chunks/escaping.js";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let serviceTypes = [];
    let userServices = [];
    let contracts = [];
    let selectedType = "";
    let name = "";
    let description = "";
    let variations = [""];
    let availability = [{ date: "", start: "" }];
    let notifications = [];
    onDestroy(() => {
    });
    $$renderer2.push(`<div class="p-6 max-w-5xl mx-auto space-y-8"><div class="mb-6 p-4 border rounded bg-gray-50"><h2 class="font-semibold text-lg mb-2">Notificações</h2> `);
    if (notifications.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-gray-500 text-sm">Nenhuma notificação ainda.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(notifications);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let n = each_array[$$index];
        $$renderer2.push(`<p class="text-sm text-gray-700">${escape_html(n.message)}</p>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> <header class="flex items-center justify-between"><h1 class="text-3xl font-bold text-gray-800">Painel do Administrador</h1> <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition">Ir para Perfil</button></header> <section class="bg-white rounded-xl shadow p-6 space-y-6 border border-gray-100 max-w-2xl mx-auto"><h2 class="text-xl font-semibold text-gray-800 border-b pb-2 text-center">Criar Novo Serviço</h2> <form class="space-y-4"><div class="mx-auto max-w-xs"><label class="block text-sm font-medium mb-1 text-gray-700">Tipo de Serviço</label> `);
    $$renderer2.select(
      {
        value: selectedType,
        class: "border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 w-auto",
        required: true
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`-- Selecione o tipo --`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(serviceTypes);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let type = each_array_1[$$index_1];
          $$renderer3.option({ value: type.id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(type.type)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="mx-auto max-w-xs"><label class="block text-sm font-medium mb-1 text-gray-700">Nome do Serviço</label> <input type="text"${attr("value", name)} class="border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 w-auto" required/></div> <div class="mx-auto max-w-md"><label class="block text-sm font-medium mb-1 text-gray-700">Descrição</label> <textarea rows="3" class="border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 w-auto">`);
    const $$body = escape_html(description);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea></div> <div class="mx-auto max-w-xs"><label class="block text-sm font-medium mb-1 text-gray-700">Imagem</label> <input type="file" accept="image/*" class="block text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/></div> <div class="mx-auto space-y-2"><label class="block text-sm font-medium mb-1 text-gray-700">Variações</label> <!--[-->`);
    const each_array_2 = ensure_array_like(variations);
    for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
      each_array_2[i];
      $$renderer2.push(`<div class="flex gap-2 items-center"><input type="text"${attr("value", variations[i])} class="border-gray-300 rounded-md p-2 w-auto focus:ring-2 focus:ring-blue-500" placeholder="ex: R$20, 2 vezes por semana" required/> <button type="button" class="bg-red-500 text-white px-2 py-1 rounded">✕</button></div>`);
    }
    $$renderer2.push(`<!--]--> <button type="button" class="bg-green-500 text-white px-3 py-1 rounded mt-1">+ Adicionar Variação</button></div> <div class="mx-auto space-y-2"><label class="block text-sm font-medium mb-1 text-gray-700">Disponibilidade</label> <!--[-->`);
    const each_array_3 = ensure_array_like(availability);
    for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
      each_array_3[i];
      $$renderer2.push(`<div class="flex gap-2 items-center"><input type="date"${attr("value", availability[i].date)} class="border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" required/> <input type="time"${attr("value", availability[i].start)} class="border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" required/> <button type="button" class="bg-red-500 text-white px-2 py-1 rounded">✕</button></div>`);
    }
    $$renderer2.push(`<!--]--> <button type="button" class="bg-green-500 text-white px-3 py-1 rounded mt-1">+ Adicionar Data/Horário</button></div> <div class="flex justify-center"><button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Criar Serviço</button></div></form> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></section> <section class="mt-6"><h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Seus Serviços</h2> `);
    if (userServices.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-gray-500 italic">Você ainda não criou nenhum serviço.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="grid justify-center gap-x-2 gap-y-5" style="grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); max-width: 900px; margin: 0 auto;"><!--[-->`);
      const each_array_4 = ensure_array_like(userServices);
      for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
        let svc = each_array_4[$$index_4];
        $$renderer2.push(`<div class="flex flex-col items-center text-center bg-white rounded-lg shadow-sm hover:shadow-md transition duration-200 p-1"><div class="relative w-full aspect-square max-w-[120px] rounded-md overflow-hidden">`);
        if (svc.picture) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<img${attr("src", svc.picture)}${attr("alt", svc.name)} class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">Sem imagem</div>`);
        }
        $$renderer2.push(`<!--]--></div> <div class="mt-1 space-y-0.5 max-w-[120px] leading-tight text-xs"><p><span class="font-medium">Nome:</span> ${escape_html(svc.name)}</p> <p><span class="font-medium">Descrição:</span> ${escape_html(svc.description)}</p> <p><span class="font-medium">Tipo:</span> ${escape_html(svc.type)}</p></div> <button class="mt-1 bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded text-xs transition">Deletar</button></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></section> <section class="mt-8"><h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Contratos</h2> `);
    if (contracts.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-gray-500 italic">Nenhum contrato ainda.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-2 max-w-2xl mx-auto"><!--[-->`);
      const each_array_5 = ensure_array_like(contracts);
      for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
        let c = each_array_5[$$index_5];
        $$renderer2.push(`<div class="flex justify-between items-start bg-white border rounded p-3"><div class="text-sm text-gray-800 space-y-1"><p><span class="font-medium">Serviço:</span> ${escape_html(c.service_name)}</p> <p><span class="font-medium">Cliente:</span> ${escape_html(c.client_name)}</p> <p><span class="font-medium">Variação:</span> ${escape_html(c.variation)}</p> <p><span class="font-medium">Data:</span> ${escape_html(new Date(c.datetime).toLocaleString())}</p></div> <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs">Cancelar</button></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></section></div>`);
  });
}
export {
  _page as default
};

import { x as ensure_array_like } from "../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import { a as attr } from "../../chunks/attributes.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { e as escape_html } from "../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let services = [];
    let serviceTypes = [];
    let query = "";
    let selectedType = "";
    $$renderer2.push(`<div class="max-w-7xl mx-auto p-6 space-y-8"><header class="text-center space-y-2"><h1 class="text-3xl font-bold tracking-tight text-gray-900">Encontrar Servicos</h1> <p class="text-gray-500 text-sm">Procurar por nome ou descricao</p></header> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="absolute top-4 right-6 flex gap-3" style="position: absolute; top: 1rem; right: 1.5rem;"><button class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition">Login como Cliente</button> <button class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium transition">Login como Adm</button></div>`);
    }
    $$renderer2.push(`<!--]--> <section class="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm p-4 flex flex-wrap justify-center gap-3 sticky top-0 z-10"><input type="text" placeholder="Procurar por nome ou descricao..."${attr("value", query)} class="border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg px-3 py-2 w-64 text-sm transition"/> `);
    $$renderer2.select(
      {
        value: selectedType,
        class: "border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg px-3 py-2 w-48 text-sm bg-white transition"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Todos os tipos`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(serviceTypes);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let type = each_array[$$index];
          $$renderer3.option({ value: type.type }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(type.type)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></section> <section class="mt-4">`);
    if (services.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="grid justify-center gap-x-2 gap-y-5" style="grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); max-width: 900px; margin: 0 auto;"><!--[-->`);
      const each_array_1 = ensure_array_like(services);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let s = each_array_1[$$index_1];
        $$renderer2.push(`<div class="flex flex-col items-center text-center bg-white rounded-lg shadow-sm hover:shadow-md transition duration-200 p-1 cursor-pointer"><div class="relative w-full aspect-square max-w-[120px] rounded-md overflow-hidden">`);
        if (s.picture) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<img${attr("src", s.picture)}${attr("alt", s.name)} class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No image</div>`);
        }
        $$renderer2.push(`<!--]--></div> <div class="mt-2 space-y-0.5 max-w-[100px] leading-tight"><h3 class="font-medium text-sm text-gray-800 truncate">${escape_html(s.name)}</h3> <p class="text-[11px] text-gray-500 line-clamp-2">${escape_html(s.description)}</p> <span class="inline-block text-[10px] bg-indigo-100 text-indigo-700 px-1 py-[1px] rounded-full">${escape_html(s.type_service)}</span></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="text-center text-gray-500 mt-8">No services found.</p>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></section></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};

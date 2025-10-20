import { a as attr } from "../../../chunks/attributes.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let client_name = "";
    let password = "";
    $$renderer2.push(`<h1>Login</h1> <form><input placeholder="Clientname"${attr("value", client_name)} required/> <input type="password" placeholder="Password"${attr("value", password)} required/> <button type="submit">Login</button></form> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <p>Sem conta? <a href="/signup-client">Sign up</a></p> <button>Pagina Principal</button>`);
  });
}
export {
  _page as default
};

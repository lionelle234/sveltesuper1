import { a as attr } from "../../../chunks/attributes.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let username = "";
    let password = "";
    $$renderer2.push(`<h1>Sign Up</h1> <form><input placeholder="Username"${attr("value", username)} required/> <input type="password" placeholder="Password"${attr("value", password)} required/> <button type="submit">Sign Up</button></form> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <p>Ja tem uma conta? <a href="/login">Login</a></p>`);
  });
}
export {
  _page as default
};

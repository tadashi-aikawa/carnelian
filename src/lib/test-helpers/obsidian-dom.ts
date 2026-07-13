import { JSDOM } from "jsdom";

export type DomElementInfo = {
  cls?: string | string[];
  text?: string;
  attr?: Record<string, string | number | boolean>;
  title?: string;
};

/**
 * ObsidianのDOMヘルパー(グローバルのcreateSpan/createDivや
 * HTMLElement.createSpan/createDiv、Element.find)をjsdomで再現し、
 * グローバルへ登録します。specの先頭で一度呼び出して使う
 */
export function setupObsidianDom(): {
  dom: JSDOM;
  createEl: (tag: string, o?: DomElementInfo) => HTMLElement;
} {
  const dom = new JSDOM("<!doctype html><html><body></body></html>");
  (globalThis as any).document = dom.window.document;
  (globalThis as any).HTMLElement = dom.window.HTMLElement;
  (globalThis as any).Element = dom.window.Element;

  const createEl = (tag: string, o?: DomElementInfo): HTMLElement => {
    const el = dom.window.document.createElement(tag);
    if (o?.cls) {
      el.className = Array.isArray(o.cls) ? o.cls.join(" ") : o.cls;
    }
    if (o?.text) {
      el.textContent = o.text;
    }
    if (o?.title) {
      el.setAttribute("title", o.title);
    }
    if (o?.attr) {
      for (const [k, v] of Object.entries(o.attr)) {
        el.setAttribute(k, String(v));
      }
    }
    return el;
  };

  (globalThis as any).createSpan = (o?: DomElementInfo) => createEl("span", o);
  (globalThis as any).createDiv = (o?: DomElementInfo) => createEl("div", o);

  const htmlProto = dom.window.HTMLElement.prototype as any;
  htmlProto.addClass = function (...classes: string[]) {
    this.classList.add(...classes);
  };
  htmlProto.removeClass = function (...classes: string[]) {
    this.classList.remove(...classes);
  };
  htmlProto.createSpan = function (o?: DomElementInfo) {
    const el = createEl("span", o);
    this.appendChild(el);
    return el;
  };
  htmlProto.createDiv = function (o?: DomElementInfo) {
    const el = createEl("div", o);
    this.appendChild(el);
    return el;
  };
  (dom.window.Element.prototype as any).find = function (selector: string) {
    return this.querySelector(selector);
  };

  return { dom, createEl };
}

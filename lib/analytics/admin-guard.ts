import { ANALYTICS_DESTINATION_IDS } from './config';

export function isAdminPath(pathname: string | null | undefined): boolean {
  return /^\/admin(\/|$)/i.test(pathname ?? '');
}

type GuardWindow = Record<string, unknown>;

/**
 * Activa/desactiva el interruptor oficial de Google (`window['ga-disable-ID']`)
 * para todos los destinos. Se llama en cada cambio de ruta: al volver a una
 * ruta pública el interruptor se apaga y la medición pública sigue intacta.
 */
export function applyAnalyticsGuard(
  pathname: string | null | undefined,
  target: GuardWindow = window as unknown as GuardWindow
): boolean {
  const blocked = isAdminPath(pathname);
  for (const id of ANALYTICS_DESTINATION_IDS) {
    target[`ga-disable-${id}`] = blocked;
  }
  return blocked;
}

/**
 * Script inline (string) que se ejecuta ANTES de `gtag('config', …)`.
 *  - Carga directa en /admin: el interruptor ya está activo antes del primer hit.
 *  - Navegación SPA (history.pushState/replaceState/popstate): el interruptor se
 *    recalcula de forma síncrona ANTES de que GA4 mida el cambio de historial,
 *    de modo que el page_view de entrada a /admin no se envía.
 */
export function getAnalyticsGuardScript(): string {
  const ids = JSON.stringify(ANALYTICS_DESTINATION_IDS);
  return `(function(){
  var ids=${ids};
  function isAdmin(p){return /^\\/admin(\\/|$)/i.test(p||'');}
  function apply(p){var b=isAdmin(p);for(var i=0;i<ids.length;i++){window['ga-disable-'+ids[i]]=b;}}
  apply(location.pathname);
  ['pushState','replaceState'].forEach(function(m){
    var original=history[m];
    if(typeof original!=='function'||original.__pvGuard)return;
    var wrapped=function(state,title,url){
      try{if(url!==undefined&&url!==null){apply(new URL(String(url),location.href).pathname);}}catch(e){}
      return original.apply(this,arguments);
    };
    wrapped.__pvGuard=true;
    history[m]=wrapped;
  });
  window.addEventListener('popstate',function(){apply(location.pathname);});
})();`;
}

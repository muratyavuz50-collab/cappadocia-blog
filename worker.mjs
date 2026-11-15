// Keep the existing CMS, security and localization worker unchanged.
import core from './worker-core.mjs';
import {decorateResponse} from './scripts/balloon-resource.mjs';
export {core as originalWorker};
export default {...core,async fetch(request,env,context){return decorateResponse(request,await core.fetch(request,env,context));}};

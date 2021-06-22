import Ruleset from './ruleset'
export default function(opts){
  return {
    components: {
      Ruleset
    },
    template: opts.application?`<ruleset :id-enginetype='${opts.idEnginetype}' application='${opts.application}'/>`:`<ruleset :id-enginetype='${opts.idEnginetype}' />`
  }
}

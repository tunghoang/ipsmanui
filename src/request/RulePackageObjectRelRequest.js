import BaseModelRequest from './base/BaseModelRequest';

export default class RulePackageObjectRelRequest extends BaseModelRequest {

  getModelName() {
    return 'rulepackageObjectRels'
  }

  getList(params) {
    return this.get(`/${this.getModelName()}/`, params);
  }

  create(params) {
    return this.post(`/${this.getModelName()}/`, params);
  }

  delete(idRulepackageobjectrel) {
    return this.del(`/${this.getModelName()}/${idRulepackageobjectrel}`);
  }
}

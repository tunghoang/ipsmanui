import BaseModelRequest from './base/BaseModelRequest';

export default class RulePackageRequest extends BaseModelRequest {

  getModelName() {
    return 'rulepackages'
  }

  getList(params) {
    return this.get(`/${this.getModelName()}/`, params);
  }

  create(params) {
    return this.post(`/${this.getModelName()}/`, params);
  }

  delete(rulePackageId) {
    return this.del(`/${this.getModelName()}/${rulePackageId}`);
  }
}

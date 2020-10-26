import BaseModelRequest from './base/BaseModelRequest';

export default class ContainmentRelRequest extends BaseModelRequest {

  getModelName() {
    return 'containmentRels'
  }
  getList(params) {
    return this.get('/containmentRels/', params);
  }

  find(params) {
    return this.put(`/containmentRels/`, params);
  }

  create(params) {
    return this.post('/users/', params);
  }

  export(params) {
    return this.get('/users/', params);
  }

  delete(userId) {
    return this.del(`/users/${userId}`);
  }
}

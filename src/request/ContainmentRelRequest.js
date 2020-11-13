import BaseModelRequest from './base/BaseModelRequest';

export default class ContainmentRelRequest extends BaseModelRequest {

  getModelName() {
    return 'containmentRels'
  }
  allObjects(params) {
    return this.get('/objects/', params);
  }

  getList(params) {
    return this.get('/containmentRels/', params);
  }

  getChildNode(params) {
    return this.put(`/containmentRels/`, params);
  }

  create(params) {
    return this.post('/users/', params);
  }

  update(roleId, params) {
    return this.put(`/objects/${roleId}`, params);
  }

  export(params) {
    return this.get('/containmentRels/', params);
  }

  delete(userId) {
    return this.del(`/objects/${userId}`);
  }
}

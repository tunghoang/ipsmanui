import BaseModelRequest from './base/BaseModelRequest';

export default class UserRoleRelRequest extends BaseModelRequest {

  getModelName() {
    return 'userRoleRels'
  }
  getList(params) {
    return this.get('/userRoleRels/', params);
  }

  find(params) {
    return this.put('/userRoleRels/', params);
  }

  create(params) {
    return this.post('/userRoleRels/', params);
  }

  update(userRoleRelId, params) {
    return this.put(`/userRoleRels/${userRoleRelId}`, params);
  }

  delete(userRoleRelId) {
    return this.del(`/userRoleRels/${userRoleRelId}`);
  }
}

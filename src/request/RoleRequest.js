import BaseModelRequest from './base/BaseModelRequest';

export default class RoleRequest extends BaseModelRequest {

  getModelName() {
    return 'roles'
  }
  getList(params) {
    return this.get('/roles/', params);
  }

  update(roleId, params) {
    return this.put(`/roles/${roleId}`, params);
  }

  create(params) {
    return this.post('/roles/', params);
  }

  export(params) {
    return this.get('/roles/', params);
  }

  delete(roleId) {
    return this.del(`/roles/${roleId}`);
  }
}

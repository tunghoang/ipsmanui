import BaseModelRequest from './base/BaseModelRequest';

export default class StudentRequest extends BaseModelRequest {

  getModelName() {
    return 'users'
  }

  getList(params) {
    return this.get('/students', params);
  }

  import(params) {
    return this.post('/student/import', params);
  }

  update(params) {
    return this.put('/student/update', params);
  }

  create(params) {
    return this.post('/student/create', params);
  }

  export(params) {
    return this.post('/student/export', params);
  }

  delete(params) {
    return this.del(`student/delete`, params);
  }
}

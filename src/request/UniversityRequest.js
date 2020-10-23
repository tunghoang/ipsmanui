import BaseModelRequest from './base/BaseModelRequest';

export default class UniversityRequest extends BaseModelRequest {

  getModelName() {
    return 'universities'
  }

  getList(params) {
    return this.get('/universities', params);
  }

  getSummaryOfTheUniversity(params) {
    return this.get('/summary-university', params);
  }

  import(params) {
    return this.post('/university/import', params);
  }

  update(params) {
    return this.put('/university/update', params);
  }

  create(params) {
    return this.post('/university/create', params);
  }

  export(params) {
    return this.post('/university/export', params);
  }

  delete(params) {
    return this.del(`/university/delete`, params);
  }
}

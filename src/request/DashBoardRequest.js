import BaseModelRequest from './base/BaseModelRequest';

export default class DashBoardRequest extends BaseModelRequest {


  getSummaryTotal() {
    return this.get('/dashboard/summary-total');
  }

  getUserReport() {
    return this.get('/dashboard/user-register');
  }

  getUniversityReport() {
    return this.get('/dashboard/university-register');
  }

  getSemesterReport() {
    return this.get('/dashboard/semester-register');
  } 

  getRoomReport() {
    return this.get('/dashboard/room-register');
  }  

  getSubjectReport() {
    return this.get('/dashboard/subject-register');
  }  

  getExamRoomReport() {
    return this.get('/dashboard/exam-room-register');
  }
}

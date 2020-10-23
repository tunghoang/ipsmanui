import MasterdataRequest from './MasterdataRequest';
import DashBoardRequest from './DashBoardRequest';
import UserRequest from './UserRequest';
import StudentRequest from './StudentRequest';
import UniversityRequest from './UniversityRequest';

const requestMap = {
  MasterdataRequest,
  DashBoardRequest,
  UserRequest,
  StudentRequest,
  UniversityRequest
};

const instances = {};

export default class RequestFactory {

  static getRequest(classname) {
    let RequestClass = requestMap[classname];
    if (!RequestClass) {
      throw new Error('Invalid request class name: ' + classname);
    }

    let requestInstance = instances[classname];
    if (!requestInstance) {
        requestInstance = new RequestClass();
        instances[classname] = requestInstance;
    }

    return requestInstance;
  }

}
import MasterdataRequest from './MasterdataRequest';
import DashBoardRequest from './DashBoardRequest';
import AuthRequest from './AuthRequest';
import UserRequest from './UserRequest';
import RoleRequest from './RoleRequest';
import StudentRequest from './StudentRequest';
import UniversityRequest from './UniversityRequest';
import ContainmentRelRequest from './ContainmentRelRequest';

const requestMap = {
  MasterdataRequest,
  DashBoardRequest,
  AuthRequest,
  UserRequest,
  RoleRequest,
  StudentRequest,
  UniversityRequest,
  ContainmentRelRequest
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
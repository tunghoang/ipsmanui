import axios from 'axios'

export const login = async () => {
  await axios({
    method: 'post',
    url: 'https://ipsmanagerapi.uetis.com/login',
    data: { username: 'admin', password: '123456' }
  })
  .then(res => {
    localStorage.setItem("token", `Bearer ${res.data.token}`);
    localStorage.setItem("expireToken", res.data.expire);
  })
}
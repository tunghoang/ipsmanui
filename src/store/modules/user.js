import Vue from 'vue';
import rf from 'requestfactory'
import { resetRouter } from '@/router'

const state = {
  status          : 'pending',
  user            : {},
  roles: []
}

const mutations = {
  UPDATE_STATUS: (state, status) => {
    Vue.set(state, 'status', status);
  },
  UPDATE_ROLES: (state, roles) => {
    state.roles = roles
  },

  UPDATE_USER: (state, data) => {
    state.user = data || {};
  },
}
const actions = {

  getCurrentUser({ commit }) {
    return new Promise((resolve, reject) => {
      let roles = ['admin']
      rf.getRequest('AuthRequest').getCurrentUser().then((res) => {
        if (!res) {
          reject('Verification failed, please Login again.')
        }
        roles = [...roles, ...res.roles]
        commit('UPDATE_USER', { idUser: res.idUser, username: res.username });
        commit('UPDATE_ROLES', roles)
        resolve(roles);
      }).catch(error => {
        reject(error)
      })
    });
  },



  // async init({ commit }) {
  //   try {
  //     if (window.isAuthenticated) {
  //       await this.dispatch('user/getCurrentUser');
  //       commit('UPDATE_STATUS', 'success');
  //     }
  //   } catch (e) {
  //     console.error(e);

  //     commit('UPDATE_STATUS', 'error');
  //   }
  // },
  updateUser({ commit }, data) {
    console.log(data)
    commit('UPDATE_USER', data);
  },
  logout ({ commit }) {
    return new Promise((resolve,) => {
      commit('UPDATE_USER', {});
      commit('UPDATE_ROLES', []);
      resetRouter()
      this.dispatch('tagsView/delAllViews', null, { root: true })
      resolve()
    }).catch(error => {
        Promise.reject(error)
    })
  },

  login () {
    // this.dispatch('user/getCurrentUser');
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

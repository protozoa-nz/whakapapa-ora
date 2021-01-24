import Vue from 'vue'
import Vuex from 'vuex'
import { createProvider } from '../plugins/vue-apollo'

import whakapapa from './modules/whakapapa'
import person from './modules/person'
import archive from './modules/archive'
import dialog from './modules/dialog'
import notifications from './modules/notifications'
import tribe from './modules/tribe'
import alerts from './modules/alerts'

import { whoami } from '../lib/person-helpers.js'

const apolloProvider = createProvider()
const apollo = apolloProvider.defaultClient

Vue.use(Vuex)

/*
  TODO (later):
    - [ ] move loading and syncing to alerts modules
    - [ ] change modules to be namespaced
          - https://vuex.vuejs.org/guide/modules.html#namespacing
          - see alerts module for another example
*/

const store = new Vuex.Store({
  state: {
    currentAccess: null,
    whoami: {
      public: {
        feedId: '',
        profile: {
          id: '',
          preferredName: '',
          aliveInterval: '',
          avatarImage: { uri: '' }
        }
      },
      personal: {
        groupId: '',
        profile: {
          id: '',
          preferredName: '',
          aliveInterval: '',
          avatarImage: { uri: '' }
        }
      }
    },
    loading: false,
    goBack: '',
    allowSubmissions: true,
    syncing: false
  },
  modules: {
    whakapapa,
    person,
    archive,
    dialog,
    notifications,
    tribe,
    alerts
  },
  getters: {
    loadingState: state => {
      return state.loading
    },
    syncing: state => {
      return state.syncing
    },
    whoami: state => {
      return state.whoami
    },
    // TODO-implement goBack to previous profile &| component
    goBack: state => {
      return state.goBack
    },
    currentAccess: state => {
      return state.currentAccess
    },
    allowSubmissions: state => {
      return state.allowSubmissions
    }
  },
  mutations: {
    setAllowSubmissions (state, allow) {
      state.allowSubmissions = allow
    },
    setCurrentAccess (state, access) {
      state.currentAccess = access
    },
    updateLoading (state, loading) {
      state.loading = loading
    },
    updateSyncing (state, syncing) {
      state.syncing = syncing
      setTimeout(() => {
        state.syncing = !state.syncing
      }, 30000)
    },
    updateWhoami (state, whoami) {
      state.whoami = whoami
    },
    updateGoBack (state, id) {
      state.goBack = id
    }
  },
  actions: {
    setLoading ({ commit }, loading) {
      commit('updateLoading', loading)
    },
    setSyncing ({ commit }, syncing) {
      commit('updateSyncing', syncing)
    },
    async setWhoami ({ commit }) {
      const result = await apollo.query(whoami)

      if (result.errors) throw result.errors

      commit('updateWhoami', result.data.whoami)
    },
    setGoBack ({ commit }, id) {
      commit('updateGoBack', id)
    }
  }
})

export default store

// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'
import getRelatives from '@/lib/profile-helpers'
import tree from '@/lib/tree-helpers'

const state = {
  selectedProfile: {},
  currentProfile: {}
}

const getters = {
  selectedProfile: state => {
    return state.selectedProfile
  },
  currentProfile: state => {
    return state.currentProfile
  }
}

const mutations = {
  updateSelectedProfile (state, profile) {
    state.selectedProfile = profile
  },
  updateCurrentProfile (state, profile) {
    state.currentProfile = profile
  }
}

const actions = {
  async setProfileById ({ commit, rootState, dispatch }, { id, type }) {
    if (id === rootState.whoami.profile.id) {
      dispatch('setWhoami', id)
    }
    if (type !== 'setWhanau' && rootState.dialog.dialog) {
      dispatch('setDialog', null)
    }
    var person = await getRelatives(id)
    if (person.children) {
      person.children = await Promise.all(person.children.map(async (child) => {
        const childProfile = await getRelatives(child.profile.id)
        person = tree.getPartners(person, childProfile)
        return childProfile
      }))
    }
    if (person.parents) {
      person.parents = await Promise.all(person.parents.map(async parent => {
        const parentProfile = await getRelatives(parent.profile.id)
        person = tree.getSiblings(parentProfile, person)
        if (parentProfile.parents) {
          person.grandparents = parentProfile.parents.map(grandparent => {
            console.log(grandparent)
            return grandparent.profile
            // const grandParent = await getRelatives(grandparent.profile.id)
            // return grandParent
          })
        }
        return parentProfile
      }))
    }
    if (!type) commit('updateCurrentProfile', person)
    commit('updateSelectedProfile', person)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
